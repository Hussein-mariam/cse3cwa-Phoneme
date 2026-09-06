import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The sound inventory. The keypad reads this instead of a file.
export async function GET() {
  try {
    const phonemes = await prisma.phoneme.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(phonemes);
  } catch {
    return NextResponse.json({ error: "Could not load phonemes." }, { status: 500 });
  }
}
