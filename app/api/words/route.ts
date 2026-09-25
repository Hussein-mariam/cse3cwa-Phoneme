import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId, validateWord } from "@/lib/validate";

// Every word's sounds are stored as separate rows, so this turns them back
// into a plain array like ["t\u0283", "\u026a", "n"].
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

// GET /api/words          - all words
// GET /api/words?listId=2 - just that list's words
export async function GET(request: Request) {
  const listId = parseId(new URL(request.url).searchParams.get("listId") ?? undefined);

  try {
    const words = await prisma.word.findMany({
      where: listId ? { listId } : undefined,
      orderBy: { english: "asc" },
      include: { phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } } },
    });
    return NextResponse.json(words.map(flatten));
  } catch {
    return NextResponse.json({ error: "Could not load the words." }, { status: 500 });
  }
}

// POST /api/words - add a word to a list.
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const listId = parseId(String(body.listId));
  if (listId === null) {
    return NextResponse.json({ error: "A word must belong to a list." }, { status: 400 });
  }

  const list = await prisma.wordList.findUnique({ where: { id: listId } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  const known = (await prisma.phoneme.findMany({ select: { symbol: true } })).map((p) => p.symbol);
  const check = validateWord(body.english, body.phonemes, known);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const english = String(body.english).trim().toLowerCase();

  const clash = await prisma.word.findUnique({
    where: { listId_english: { listId, english } },
  });
  if (clash) {
    return NextResponse.json({ error: `"${english}" is already in this list.` }, { status: 409 });
  }

  try {
    const word = await prisma.word.create({
      data: {
        english,
        listId,
        phonemes: {
          create: (body.phonemes as string[]).map((symbol, position) => ({
            position,
            phoneme: { connect: { symbol } },
          })),
        },
      },
      include: { phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } } },
    });
    return NextResponse.json(flatten(word), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the word." }, { status: 500 });
  }
}
