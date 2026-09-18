import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The assessment asks for /health to return 200 OK.
// It also pings the database, so a green result means the whole stack is up,
// not just that Next.js is running.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}
