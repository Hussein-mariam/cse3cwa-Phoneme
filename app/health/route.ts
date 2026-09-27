import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// checks the database too, not just the site
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
