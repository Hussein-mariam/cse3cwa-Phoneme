import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const phonemes = await prisma.phoneme.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(phonemes);
  } catch {
    return NextResponse.json({ error: "Could not load the phonemes." }, { status: 500 });
  }
}
