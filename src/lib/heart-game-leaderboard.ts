import "server-only";

import { getMongoDatabase } from "@/lib/mongodb";

export type HeartGameLeaderboardEntry = {
  name: string;
  score: number;
  rank: number;
};

type LeaderboardScore = Pick<HeartGameLeaderboardEntry, "name" | "score">;

export const HEART_GAME_LEADERBOARD_LIMIT = 50;

export async function getHeartGameLeaderboard(): Promise<HeartGameLeaderboardEntry[]> {
  const db = await getMongoDatabase();
  const scores = await db.collection("heart_game").aggregate<LeaderboardScore>([
    {
      $match: {
        pathName: { $type: "string", $regex: /\S/ },
        score: { $type: "number", $gte: 0, $lte: 1_000_000 },
        $expr: {
          $and: [
            { $eq: [{ $type: "$pathName" }, "string"] },
            {
              $cond: [
                { $in: [{ $type: "$score" }, ["double", "int", "long"]] },
                { $eq: ["$score", { $trunc: "$score" }] },
                false,
              ],
            },
          ],
        },
      },
    },
    { $sort: { score: -1, _id: 1 } },
    {
      $group: {
        // Guest/named players have an ID; authenticated and legacy scores use the name.
        _id: {
          $cond: [
            {
              $and: [
                { $eq: [{ $type: "$playerId" }, "string"] },
                { $ne: ["$playerId", ""] },
              ],
            },
            { $concat: ["player:", "$playerId"] },
            { $concat: ["name:", { $trim: { input: "$pathName" } }] },
          ],
        },
        name: { $first: { $trim: { input: "$pathName" } } },
        score: { $first: "$score" },
      },
    },
    { $sort: { score: -1, name: 1, _id: 1 } },
    { $limit: HEART_GAME_LEADERBOARD_LIMIT },
    { $project: { _id: 0, name: 1, score: 1 } },
  ]).toArray();

  let rank = 0;
  return scores.map((entry, index) => {
    if (index === 0 || entry.score !== scores[index - 1].score) {
      rank = index + 1;
    }
    return { ...entry, rank };
  });
}
