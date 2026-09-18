import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId, validateListName } from "@/lib/validate";

// In Next 16 the route's params arrive as a promise, so they need awaiting.
type Params = { params: Promise<{ id: string }> };

// GET /api/lists/5 - one list, with its words and their sounds in order.
export async function GET(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid list id." }, { status: 400 });
  }

  const list = await prisma.wordList.findUnique({
    where: { id },
    include: {
      words: {
        orderBy: { english: "asc" },
        include: {
          phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } },
        },
      },
    },
  });

  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  // Flatten the sound rows back into a simple array for the frontend.
  return NextResponse.json({
    ...list,
    words: list.words.map((word) => ({
      id: word.id,
      english: word.english,
      phonemes: word.phonemes.map((p) => p.phoneme.symbol),
    })),
  });
}

// PUT /api/lists/5 - rename a list or change its description.
export async function PUT(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid list id." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const check = validateListName(body.name);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const list = await prisma.wordList.findUnique({ where: { id } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  const clash = await prisma.wordList.findUnique({ where: { name: body.name.trim() } });
  if (clash && clash.id !== id) {
    return NextResponse.json({ error: "Another list already has that name." }, { status: 409 });
  }

  const updated = await prisma.wordList.update({
    where: { id },
    data: {
      name: body.name.trim(),
      description: typeof body.description === "string" ? body.description.trim() : null,
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/lists/5 - removes the list and its words.
export async function DELETE(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid list id." }, { status: 400 });
  }

  const list = await prisma.wordList.findUnique({ where: { id } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  await prisma.wordList.delete({ where: { id } });
  return NextResponse.json({ deleted: id });
}
