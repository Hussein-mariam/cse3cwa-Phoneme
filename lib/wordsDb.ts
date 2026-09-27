import { prisma } from "@/lib/prisma";

// sounds are saved one row each, this turns them back into a list like ["tʃ", "ɪ", "n"]
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
