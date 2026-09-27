import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkWord, parseId } from "@/lib/validate";
import { getWords, soundRows } from "@/lib/wordsDb";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const listId = parseId(url.searchParams.get("listId") || "");
  if (listId === null) {
    return NextResponse.json({ error: "Add ?listId= to say which list." }, { status: 400 });
  }

  try {
    const words = await getWords({ listId: listId });
    return NextResponse.json(words);
  } catch {
    return NextResponse.json({ error: "Could not load the words." }, { status: 500 });
  }
}

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

  const allPhonemes = await prisma.phoneme.findMany();
  const known = allPhonemes.map((p) => p.symbol);

  const error = checkWord(body.english, body.phonemes, known);
  if (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }

  const english = body.english.trim().toLowerCase();

  const clash = await prisma.word.findFirst({ where: { listId: listId, english: english } });
  if (clash) {
    return NextResponse.json({ error: english + " is already in this list." }, { status: 409 });
  }

  try {
    // saved together so a word never ends up with half its sounds
    const word = await prisma.word.create({
      data: {
        english: english,
        listId: listId,
        phonemes: { create: soundRows(body.phonemes) },
      },
    });
    const saved = await getWords({ id: word.id });
    return NextResponse.json(saved[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the word." }, { status: 500 });
  }
}
