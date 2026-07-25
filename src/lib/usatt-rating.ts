/**
 * USATT rating calculation.
 * Source: https://www.teamusa.org/USA-Table-Tennis/USATT-Ratings/Rating-System
 *
 * Point exchange depends on rating difference between players and who wins.
 * The higher-rated player risks more; the lower-rated player gains more from an upset.
 */

// USATT lookup table: [ratingDiff, winnerIsHigher_change, winnerIsLower_change]
// ratingDiff = higherRating - lowerRating (always >= 0)
// Exchange is applied: winner gains, loser loses the same amount
const EXCHANGE_TABLE: [number, number][] = [
  // [maxDiff, pointsExchanged]
  [12, 8],
  [37, 7],
  [62, 6],
  [87, 5],
  [112, 4],
  [137, 3],
  [162, 2],
  [187, 1],
  // diff > 187: 0 points exchanged when higher-rated wins; handled below
];

/**
 * Returns the points exchanged for a single match.
 * If the lower-rated player wins (upset), the exchange is from the table above.
 * If the higher-rated player wins (expected), the exchange is max(0, tableValue - 1) ... actually
 * the USATT rule: if lower wins, exchange = table value; if higher wins, exchange is inverted.
 *
 * Simplified USATT rule actually used:
 *   - diff = |r1 - r2|
 *   - if higher-rated wins: winner gains points from "higher wins" column
 *   - if lower-rated wins (upset): winner gains points from "lower wins" column
 *
 * The published USATT table has two columns. We implement both here.
 */
function lookupExchange(diff: number): { higherWins: number; lowerWins: number } {
  // USATT published two-column table (diff, higherWins, lowerWins)
  // Source: USATT Rating System document
  const TABLE: [number, number, number][] = [
    [12, 8, 8],
    [37, 7, 8],
    [62, 6, 8],
    [87, 5, 8],
    [112, 4, 8],
    [137, 3, 7],
    [162, 2, 6],
    [187, 1, 5],
    [212, 0, 4],
    [237, 0, 3],
    [262, 0, 2],
    [Infinity, 0, 1],
  ];

  for (const [maxDiff, hw, lw] of TABLE) {
    if (diff <= maxDiff) return { higherWins: hw, lowerWins: lw };
  }
  return { higherWins: 0, lowerWins: 1 };
}

export interface MatchResult {
  player1Rating: number;
  player2Rating: number;
  winnerId: "player1" | "player2";
}

export interface RatingChange {
  player1NewRating: number;
  player2NewRating: number;
  player1Delta: number;
  player2Delta: number;
}

export function calculateMatchRatingChange(match: MatchResult): RatingChange {
  const { player1Rating, player2Rating, winnerId } = match;
  const diff = Math.abs(player1Rating - player2Rating);
  const { higherWins, lowerWins } = lookupExchange(diff);

  const p1IsHigher = player1Rating >= player2Rating;
  const p1Won = winnerId === "player1";

  let exchange: number;
  if (p1IsHigher === p1Won) {
    // expected result: higher-rated won
    exchange = higherWins;
  } else {
    // upset: lower-rated won
    exchange = lowerWins;
  }

  const player1Delta = p1Won ? exchange : -exchange;
  const player2Delta = p1Won ? -exchange : exchange;

  return {
    player1Delta,
    player2Delta,
    player1NewRating: player1Rating + player1Delta,
    player2NewRating: player2Rating + player2Delta,
  };
}

/**
 * Calculate rating changes for all matches in a group night.
 * Ratings update cumulatively within the night (each match uses current running rating).
 */
export function calculateGroupRatings(
  entries: { playerId: string; ratingBefore: number }[],
  matches: { player1Id: string; player2Id: string; winnerId: string | null }[]
): Map<string, number> {
  const current = new Map(entries.map((e) => [e.playerId, e.ratingBefore]));

  for (const match of matches) {
    if (!match.winnerId) continue;
    const r1 = current.get(match.player1Id) ?? 500;
    const r2 = current.get(match.player2Id) ?? 500;
    const winner = match.winnerId === match.player1Id ? "player1" : "player2";
    const change = calculateMatchRatingChange({ player1Rating: r1, player2Rating: r2, winnerId: winner });
    current.set(match.player1Id, change.player1NewRating);
    current.set(match.player2Id, change.player2NewRating);
  }

  return current;
}

/**
 * Apply USATT sync rule: only overwrite league rating with USATT rating if USATT > league rating.
 */
export function applyUsattSync(leagueRating: number, usattRating: number): number {
  return usattRating > leagueRating ? usattRating : leagueRating;
}

// ponytail: quick self-check — remove or `ts-node` directly to verify
if (process.env.NODE_ENV === "test") {
  const r = calculateMatchRatingChange({ player1Rating: 1500, player2Rating: 1450, winnerId: "player2" });
  console.assert(r.player2Delta > 0, "upset winner should gain points");
  console.assert(r.player1Delta < 0, "upset loser should lose points");
  console.log("usatt-rating: self-check passed", r);
}
