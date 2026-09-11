import type { Player } from "@/types";

export async function getDailyLeaderboard(): Promise<Player[]> {
  const response = await fetch("https://api.chess.com/pub/leaderboards");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch leaderboard: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data?.daily ?? [];
}
