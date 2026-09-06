import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId, validateActivity } from "@/lib/validate";

type Params = { params: Promise<{ id: string }> };

// GET /api/activities/3 - one configuration, with the words it will use.
export async function GET(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      list: {
        include: {
          words: {
            orderBy: { english: "asc" },
            include: { phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } } },
          },
        },
      },
      targetWord: {
        include: { phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } } },
      },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  return NextResponse.json({
    ...activity,
    list: {
      id: activity.list.id,
      name: activity.list.name,
      words: activity.list.words.map((w) => ({
        id: w.id,
        english: w.english,
        phonemes: w.phonemes.map((p) => p.phoneme.symbol),
      })),
    },
    targetWord: activity.targetWord
      ? {
          id: activity.targetWord.id,
          english: activity.targetWord.english,
          phonemes: activity.targetWord.phonemes.map((p) => p.phoneme.symbol),
        }
      : null,
  });
}

// PUT /api/activities/3 - change the saved settings.
export async function PUT(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const check = validateActivity(body);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  const listId = parseId(String(body.listId));
  const list = await prisma.wordList.findUnique({ where: { id: listId as number } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      name: String(body.name).trim(),
      type: body.type as "wordle" | "wordsearch",
      difficulty: (body.difficulty ?? "standard") as "easy" | "standard" | "hard",
      maxGuesses: Number(body.maxGuesses ?? 6),
      gridSize: Number(body.gridSize ?? 10),
      showHints: body.showHints !== false,
      showLetters: body.showLetters !== false,
      showEnglish: body.showEnglish !== false,
      listId: listId as number,
      targetWordId:
        body.targetWordId === undefined || body.targetWordId === null
          ? null
          : parseId(String(body.targetWordId)),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/activities/3
export async function DELETE(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ deleted: id });
}
