import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkActivity, parseId } from "@/lib/validate";

// In Next 16 the id from the URL arrives as a promise, so it has to be awaited.
type Params = { params: Promise<{ id: string }> };

// GET /api/activities/3 - one saved activity.
export async function GET(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id: id },
    include: { list: true, targetWord: true },
  });
  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }
  return NextResponse.json(activity);
}

// PUT /api/activities/3 - change any of the saved settings.
export async function PUT(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

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

  const activity = await prisma.activity.findUnique({ where: { id: id } });
  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  const list = await prisma.wordList.findUnique({ where: { id: body.listId } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
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

  const updated = await prisma.activity.update({
    where: { id: id },
    data: {
      name: body.name.trim(),
      listId: body.listId,
      targetWordId: targetWordId,
      maxGuesses: body.maxGuesses,
      gridSize: body.gridSize,
      showLetters: body.showLetters,
      showEnglish: body.showEnglish,
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/activities/3
export async function DELETE(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id: id } });
  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  await prisma.activity.delete({ where: { id: id } });
  return NextResponse.json({ deleted: id });
}
