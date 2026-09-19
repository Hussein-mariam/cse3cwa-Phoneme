import { prisma } from "@/lib/prisma";

// Each sound of a word is stored as its own row in the WordPhoneme table.
// This loads words together with those rows, in order, and turns them back
// into a simple list like ["tʃ", "ɪ", "n"] for the rest of the app.
//
// getWords({ listId: 2 }) gives every word in list 2.
// getWords({ id: 5 }) gives just word 5 (or nothing if it doesn't exist).
export async function getWords(where: { listId?: number; id?: number }) {
  const words = await prisma.word.findMany({
    where: where,
    orderBy: { english: "asc" },
    include: { phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } } },
  });

  return words.map((word) => ({
    id: word.id,
    english: word.english,
    listId: word.listId,
    phonemes: word.phonemes.map((row) => row.phoneme.symbol),
  }));
}

// Turns ["tʃ", "ɪ", "n"] into the rows Prisma needs to save them: one row per
// sound, with its position, linked to the phoneme that has that symbol.
export function soundRows(symbols: string[]) {
  const rows = [];

  for (let i = 0; i < symbols.length; i++) {
    rows.push({
      position: i,
      phoneme: { connect: { symbol: symbols[i] } },
    });
  }

  return rows;
}
