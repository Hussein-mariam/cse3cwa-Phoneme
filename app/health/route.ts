import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /health - the assessment asks for this to return 200.
// It runs a tiny query too, so "ok" means the database is up as well,
// not just the website.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    // 503 means "a service this depends on is down".
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
