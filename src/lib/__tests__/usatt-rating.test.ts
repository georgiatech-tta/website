import { calculateMatchRatingChange, calculateGroupRatings, applyUsattSync } from "../usatt-rating";

describe("USATT rating", () => {
  test("higher-rated winner gains fewer points than upset winner", () => {
    const expectedWin = calculateMatchRatingChange({ player1Rating: 1500, player2Rating: 1400, winnerId: "player1" });
    const upset = calculateMatchRatingChange({ player1Rating: 1500, player2Rating: 1400, winnerId: "player2" });
    expect(expectedWin.player1Delta).toBeGreaterThan(0);
    expect(upset.player2Delta).toBeGreaterThan(expectedWin.player1Delta);
  });

  test("loser always loses what winner gains", () => {
    const r = calculateMatchRatingChange({ player1Rating: 1200, player2Rating: 1000, winnerId: "player2" });
    expect(r.player1Delta + r.player2Delta).toBe(0);
  });

  test("no points exchanged when diff > 212 and higher-rated wins", () => {
    const r = calculateMatchRatingChange({ player1Rating: 1800, player2Rating: 1500, winnerId: "player1" });
    expect(r.player1Delta).toBe(0);
    expect(Math.abs(r.player2Delta)).toBe(0);
  });

  test("upset still awards points when diff > 212", () => {
    const r = calculateMatchRatingChange({ player1Rating: 1800, player2Rating: 1500, winnerId: "player2" });
    expect(r.player2Delta).toBeGreaterThan(0);
  });

  test("group rating calculation accumulates across matches", () => {
    const entries = [
      { playerId: "A", ratingBefore: 1000 },
      { playerId: "B", ratingBefore: 900 },
    ];
    const matches = [{ player1Id: "A", player2Id: "B", winnerId: "B" }]; // upset
    const result = calculateGroupRatings(entries, matches);
    expect(result.get("B")!).toBeGreaterThan(900); // winner gained
    expect(result.get("A")!).toBeLessThan(1000);   // loser lost
  });

  test("USATT sync only upgrades, never downgrades", () => {
    expect(applyUsattSync(1000, 1200)).toBe(1200); // upgrade
    expect(applyUsattSync(1000, 800)).toBe(1000);  // no downgrade
    expect(applyUsattSync(1000, 1000)).toBe(1000); // equal = no change
  });
});
