import "server-only";
import type { Session } from "next-auth";
import { getMongoDatabase } from "@/lib/mongodb";

export async function isPathSessionCurrent(session: Session | null, name: string): Promise<boolean> {
  if (session?.user?.pathName !== name) return false;
  const database = await getMongoDatabase();
  const user = await database.collection("user").findOne({ name }, { projection: { sessionId: 1 } });
  if (!user) return false;
  const sessionId = typeof user.sessionId === "string" ? user.sessionId : String(user._id);
  if (typeof session.user.pathSessionId === "string") return session.user.pathSessionId === sessionId;
  // Preserve older sessions only for accounts that have never been reset/recreated.
  return user.sessionId === undefined;
}
