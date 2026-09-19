import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkActivity } from "@/lib/validate";

// GET /api/activities - every saved activity, newest first.
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { updatedAt: "desc" },
      include: { list: true },
    });
    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: "Could not load the activities." }, { status: 500 });
  }
}

// POST /api/activities - save the builder settings under a name.
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const error = checkActivity(body);
  if (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }

  const list = await prisma.wordList.findUnique({
    where: { id: body.listId },
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

  // A wordle names the word to guess. It has to be a word from the chosen list.
  let targetWordId: number | null = null;
  if (body.targetWordId) {
    const word = await prisma.word.findFirst({
      where: { id: body.targetWordId, listId: body.listId },
    });
    if (!word) {
      return NextResponse.json({ error: "The chosen word is not in that word list." }, { status: 400 });
    }
    targetWordId = word.id;
  }

  // Anything left out (for example gridSize on a wordle) gets the default
  // from the schema.
  try {
    const activity = await prisma.activity.create({
      data: {
        name: body.name.trim(),
        type: body.type,
        listId: body.listId,
        targetWordId: targetWordId,
        maxGuesses: body.maxGuesses,
        gridSize: body.gridSize,
        showLetters: body.showLetters,
        showEnglish: body.showEnglish,
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the activity." }, { status: 500 });
  }
}
