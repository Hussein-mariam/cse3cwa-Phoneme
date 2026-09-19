import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/phonemes - every sound. The keypad is built from this.
export async function GET() {
  try {
    const phonemes = await prisma.phoneme.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(phonemes);
  } catch {
    return NextResponse.json({ error: "Could not load the phonemes." }, { status: 500 });
  }
}
