import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkListName, parseId } from "@/lib/validate";
import { getWords } from "@/lib/wordsDb";

// In Next 16 the id from the URL arrives as a promise, so it has to be awaited.
type Params = { params: Promise<{ id: string }> };

// GET /api/lists/5 - one list, with its words.
export async function GET(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid list id." }, { status: 400 });
  }

  const list = await prisma.wordList.findUnique({ where: { id: id } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  const words = await getWords({ listId: id });
  return NextResponse.json({ id: list.id, name: list.name, words: words });
}

// PUT /api/lists/5 - rename a list.
export async function PUT(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid list id." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const error = checkListName(body.name);
  if (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }

  const name = body.name.trim();

  const list = await prisma.wordList.findUnique({ where: { id: id } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  // Another list already using this name is a clash. This same list is fine.
  const clash = await prisma.wordList.findUnique({ where: { name: name } });
  if (clash && clash.id !== id) {
    return NextResponse.json({ error: "Another list already has that name." }, { status: 409 });
  }

  const updated = await prisma.wordList.update({
    where: { id: id },
    data: { name: name },
  });
  return NextResponse.json(updated);
}

// DELETE /api/lists/5 - removes the list. Its words go with it, because the
// schema says onDelete: Cascade.
export async function DELETE(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid list id." }, { status: 400 });
  }

  const list = await prisma.wordList.findUnique({ where: { id: id } });
  if (!list) {
    return NextResponse.json({ error: "No list with that id." }, { status: 404 });
  }

  await prisma.wordList.delete({ where: { id: id } });
  return NextResponse.json({ deleted: id });
}
