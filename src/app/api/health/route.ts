import { NextResponse } from "next/server";

import { getMongoDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const db = await getMongoDatabase();
    await db.command({ ping: 1 }, { timeoutMS: 5_000 });
    return NextResponse.json({ status: "ok" }, { headers });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers });
  }
}
