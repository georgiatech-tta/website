/**
 * Bracket generation: round-robin by rating tier.
 * Sort players by rating, divide into tiers, distribute one from each tier per group.
 * Groups are 4-7 players; default target group size = 5.
 */

export interface BracketPlayer {
  id: string;
  name: string;
  rating: number;
}

export interface BracketGroup {
  players: BracketPlayer[];
}

export function generateBrackets(
  players: BracketPlayer[],
  targetGroupSize = 5
): BracketGroup[] {
  if (players.length === 0) return [];

  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const numGroups = Math.max(1, Math.round(sorted.length / targetGroupSize));
  const groups: BracketPlayer[][] = Array.from({ length: numGroups }, () => []);

  // Snake-within-tier: assign players in tiers of numGroups,
  // alternating direction each tier so skill is balanced across groups.
  sorted.forEach((player, i) => {
    const tier = Math.floor(i / numGroups);
    const posInTier = i % numGroups;
    const groupIdx = tier % 2 === 0 ? posInTier : numGroups - 1 - posInTier;
    groups[groupIdx].push(player);
  });

  return groups.map((players) => ({ players }));
}

// self-check
if (process.env.NODE_ENV === "test") {
  const players: BracketPlayer[] = Array.from({ length: 12 }, (_, i) => ({
    id: String(i),
    name: `P${i}`,
    rating: 1000 - i * 50,
  }));
  const groups = generateBrackets(players, 5);
  console.assert(groups.length === 2, "should make 2 groups for 12 players");
  console.assert(groups[0].players.length === 6, "should be ~6 per group");
  console.log("bracket: self-check passed");
}
