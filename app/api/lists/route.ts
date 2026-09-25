import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateListName } from "@/lib/validate";

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

// POST /api/lists - create a list.
export async function POST(request: Request) {
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

  const existing = await prisma.wordList.findUnique({ where: { name: body.name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "A list with that name already exists." }, { status: 409 });
  }

  try {
    const list = await prisma.wordList.create({
      data: {
        name: body.name.trim(),
        description: typeof body.description === "string" ? body.description.trim() : null,
      },
    });
    return NextResponse.json(list, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the list." }, { status: 500 });
  }
}
