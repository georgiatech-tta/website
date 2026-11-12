// Returns null if valid, error string if not.
// scoreP1: comma-separated "a-b" per game from player1's perspective, e.g. "11-7,8-11,11-9"
export function validateTTScores(
  scoreP1: string,
  winnerId: string,
  player1Id: string
): string | null {
  const games = scoreP1.split(",").map((g) => g.trim());
  if (games.length === 0 || (games.length === 1 && games[0] === ""))
    return "No games entered";

  let p1Wins = 0;
  let p2Wins = 0;

  for (let i = 0; i < games.length; i++) {
    const parts = games[i].split("-");
    if (parts.length !== 2) return `Game ${i + 1}: invalid format`;

    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0)
      return `Game ${i + 1}: scores must be non-negative numbers`;
    if (a === b) return `Game ${i + 1}: games cannot end in a tie`;

    const hi = Math.max(a, b);
    const lo = Math.min(a, b);

    if (hi < 11) return `Game ${i + 1}: winner must reach at least 11`;
    if (hi - lo < 2) return `Game ${i + 1}: winner must lead by at least 2`;
    if (hi === 11 && lo > 9)
      return `Game ${i + 1}: if score reaches 10-10, play continues until someone leads by 2`;
    if (hi > 11 && lo !== hi - 2)
      return `Game ${i + 1}: at deuce, winner must win by exactly 2`;

    if (a > b) p1Wins++; else p2Wins++;

    // check no extra games after match already decided
    if (i > 0) {
      const prevP1 = a > b ? p1Wins - 1 : p1Wins;
      const prevP2 = a > b ? p2Wins : p2Wins - 1;
      if ((prevP1 >= 2 && prevP1 - prevP2 >= 2) || (prevP2 >= 2 && prevP2 - prevP1 >= 2))
        return `Game ${i + 1}: match already ended (${prevP1}-${prevP2})`;
    }
  }

  const declaredP1Wins = winnerId === player1Id;
  if (declaredP1Wins && p1Wins <= p2Wins)
    return "Declared winner did not win more games";
  if (!declaredP1Wins && p2Wins <= p1Wins)
    return "Declared winner did not win more games";

  const totalGames = p1Wins + p2Wins;
  const maxWins = Math.max(p1Wins, p2Wins);
  if (maxWins < 2) return "Match must be at least best-of-3 (winner needs 2+ game wins)";
  if (maxWins !== Math.ceil(totalGames / 2))
    return "Invalid number of games for the result";

  return null;
}
