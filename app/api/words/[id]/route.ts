import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId, validateWord } from "@/lib/validate";

type Params = { params: Promise<{ id: string }> };

const withSounds = {
  phonemes: { orderBy: { position: "asc" as const }, include: { phoneme: true } },
};

function flatten(word: {
  id: number;
  english: string;
  listId: number;
  phonemes: { phoneme: { symbol: string } }[];
}) {
  return {
    id: word.id,
    english: word.english,
    listId: word.listId,
    phonemes: word.phonemes.map((p) => p.phoneme.symbol),
  };
}

// GET /api/words/5
export async function GET(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid word id." }, { status: 400 });
  }

  const word = await prisma.word.findUnique({ where: { id }, include: withSounds });
  if (!word) {
    return NextResponse.json({ error: "No word with that id." }, { status: 404 });
  }
  return NextResponse.json(flatten(word));
}

// PUT /api/words/5 - change the spelling and/or the sounds.
export async function PUT(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid word id." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const word = await prisma.word.findUnique({ where: { id } });
  if (!word) {
    return NextResponse.json({ error: "No word with that id." }, { status: 404 });
  }

  const known = (await prisma.phoneme.findMany({ select: { symbol: true } })).map((p) => p.symbol);
  const check = validateWord(body.english, body.phonemes, known);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const english = String(body.english).trim().toLowerCase();

  const clash = await prisma.word.findUnique({
    where: { listId_english: { listId: word.listId, english } },
  });
  if (clash && clash.id !== id) {
    return NextResponse.json({ error: `"${english}" is already in this list.` }, { status: 409 });
  }

  // Replacing the sounds is simpler than working out which ones changed.
  const updated = await prisma.word.update({
    where: { id },
    data: {
      english,
      phonemes: {
        deleteMany: {},
        create: (body.phonemes as string[]).map((symbol, position) => ({
          position,
          phoneme: { connect: { symbol } },
        })),
      },
    },
    include: withSounds,
  });

  return NextResponse.json(flatten(updated));
}

// DELETE /api/words/5
export async function DELETE(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid word id." }, { status: 400 });
  }

  const word = await prisma.word.findUnique({ where: { id } });
  if (!word) {
    return NextResponse.json({ error: "No word with that id." }, { status: 404 });
  }

  await prisma.word.delete({ where: { id } });
  return NextResponse.json({ deleted: id });
}
