import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId, validateActivity } from "@/lib/validate";

// GET /api/activities - every saved configuration.
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        list: { select: { id: true, name: true, _count: { select: { words: true } } } },
        targetWord: { select: { id: true, english: true } },
      },
    });
    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: "Could not load the activities." }, { status: 500 });
  }
}

// POST /api/activities - save the current builder settings under a name.
export async function POST(request: Request) {
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

  const listId = parseId(String(body.listId));
  const list = await prisma.wordList.findUnique({
    where: { id: listId as number },
    include: { _count: { select: { words: true } } },
  });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }
  if (list._count.words === 0) {
    return NextResponse.json(
      { error: "That word list is empty, so no activity can be made from it." },
      { status: 400 }
    );
  }

  // A wordle needs one word to guess; it has to belong to the chosen list.
  let targetWordId: number | null = null;
  if (body.type === "wordle" && body.targetWordId !== undefined && body.targetWordId !== null) {
    targetWordId = parseId(String(body.targetWordId));
    const word = await prisma.word.findUnique({ where: { id: targetWordId as number } });
    if (!word) {
      return NextResponse.json({ error: "No word with that id." }, { status: 404 });
    }
    if (word.listId !== listId) {
      return NextResponse.json(
        { error: "The chosen word is not in that word list." },
        { status: 400 }
      );
    }
  }

  try {
    const activity = await prisma.activity.create({
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
        targetWordId,
      },
      include: { list: { select: { id: true, name: true } } },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the activity." }, { status: 500 });
  }
}
