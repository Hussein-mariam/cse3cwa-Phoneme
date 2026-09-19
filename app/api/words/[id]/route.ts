import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkWord, parseId } from "@/lib/validate";
import { getWords, soundRows } from "@/lib/wordsDb";

// In Next 16 the id from the URL arrives as a promise, so it has to be awaited.
type Params = { params: Promise<{ id: string }> };

// GET /api/words/5 - one word and its sounds.
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

// PUT /api/words/5 - change the spelling and/or the sounds.
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

  // Another word in the same list with this spelling is a clash. This word is fine.
  const clash = await prisma.word.findFirst({ where: { listId: word.listId, english: english } });
  if (clash && clash.id !== id) {
    return NextResponse.json({ error: english + " is already in this list." }, { status: 409 });
  }

  // Deleting the old sound rows and saving the new ones is simpler than
  // working out which sounds changed.
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

// DELETE /api/words/5 - its sound rows are deleted with it (onDelete: Cascade).
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
