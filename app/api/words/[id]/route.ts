import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkWord, parseId } from "@/lib/validate";
import { getWords, soundRows } from "@/lib/wordsDb";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid word id." }, { status: 400 });
  }

  const found = await getWords({ id: id });
  if (found.length === 0) {
    return NextResponse.json({ error: "No word with that id." }, { status: 404 });
  }
  return NextResponse.json(found[0]);
}

export async function PUT(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid word id." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const word = await prisma.word.findUnique({ where: { id: id } });
  if (!word) {
    return NextResponse.json({ error: "No word with that id." }, { status: 404 });
  }

  const allPhonemes = await prisma.phoneme.findMany();
  const known = allPhonemes.map((p) => p.symbol);

  const error = checkWord(body.english, body.phonemes, known);
  if (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }

  const english = body.english.trim().toLowerCase();

  const clash = await prisma.word.findFirst({ where: { listId: word.listId, english: english } });
  if (clash && clash.id !== id) {
    return NextResponse.json({ error: english + " is already in this list." }, { status: 409 });
  }

  // easier to just replace all the sounds than work out which ones changed
  await prisma.word.update({
    where: { id: id },
    data: {
      english: english,
      phonemes: { deleteMany: {}, create: soundRows(body.phonemes) },
    },
  });

  const saved = await getWords({ id: id });
  return NextResponse.json(saved[0]);
}

export async function DELETE(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid word id." }, { status: 400 });
  }

  const word = await prisma.word.findUnique({ where: { id: id } });
  if (!word) {
    return NextResponse.json({ error: "No word with that id." }, { status: 404 });
  }

  await prisma.word.delete({ where: { id: id } });
  return NextResponse.json({ deleted: id });
}
