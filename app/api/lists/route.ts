import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkListName } from "@/lib/validate";

// GET /api/lists - every word list, with how many words each has.
export async function GET() {
  try {
    const lists = await prisma.wordList.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { words: true } } },
    });
    return NextResponse.json(lists);
  } catch {
    return NextResponse.json({ error: "Could not load the word lists." }, { status: 500 });
  }
}

// POST /api/lists - make a new list.
export async function POST(request: Request) {
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

  // 409 means "conflict" - the name is already taken.
  const existing = await prisma.wordList.findUnique({ where: { name: name } });
  if (existing) {
    return NextResponse.json({ error: "A list with that name already exists." }, { status: 409 });
  }

  try {
    const list = await prisma.wordList.create({ data: { name: name } });
    return NextResponse.json(list, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the list." }, { status: 500 });
  }
}
