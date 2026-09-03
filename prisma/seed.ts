// Fills an empty database with the phoneme inventory and some starting word
// lists. Safe to run more than once - it skips anything already there.

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { phonemes } from "../lib/phonemes";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const lists: { name: string; description: string; words: { english: string; phonemes: string[] }[] }[] = [
  {
    name: "Three sounds",
    description: "Short words to start with - one sound per letter, mostly.",
    words: [
      { english: "dog", phonemes: ["d", "ɔ", "ɡ"] },
      { english: "log", phonemes: ["l", "ɔ", "ɡ"] },
      { english: "thin", phonemes: ["θ", "ɪ", "n"] },
      { english: "chin", phonemes: ["tʃ", "ɪ", "n"] },
      { english: "ship", phonemes: ["ʃ", "ɪ", "p"] },
      { english: "jam", phonemes: ["dʒ", "æ", "m"] },
      { english: "fan", phonemes: ["f", "æ", "n"] },
      { english: "van", phonemes: ["v", "æ", "n"] },
      { english: "sun", phonemes: ["s", "ɐ", "n"] },
      { english: "ring", phonemes: ["ɹ", "ɪ", "ŋ"] },
      { english: "bed", phonemes: ["b", "e", "d"] },
    ],
  },
  {
    name: "Four sounds",
    description: "Words with a consonant blend.",
    words: [
      { english: "tent", phonemes: ["t", "e", "n", "t"] },
      { english: "milk", phonemes: ["m", "ɪ", "l", "k"] },
      { english: "hand", phonemes: ["h", "æ", "n", "d"] },
      { english: "jump", phonemes: ["dʒ", "ɐ", "m", "p"] },
      { english: "stop", phonemes: ["s", "t", "ɔ", "p"] },
      { english: "desk", phonemes: ["d", "e", "s", "k"] },
    ],
  },
  {
    name: "Th sounds",
    description: "Words that contrast the two th sounds.",
    words: [
      { english: "thin", phonemes: ["θ", "ɪ", "n"] },
      { english: "then", phonemes: ["ð", "e", "n"] },
      { english: "hat", phonemes: ["h", "æ", "t"] },
      { english: "zip", phonemes: ["z", "ɪ", "p"] },
      { english: "yes", phonemes: ["j", "e", "s"] },
    ],
  },
];

async function main() {
  // 1. The phoneme inventory. Every word's sounds must point at one of these.
  for (const p of phonemes) {
    await prisma.phoneme.upsert({
      where: { symbol: p.symbol },
      update: { letters: p.letters, example: p.example },
      create: { symbol: p.symbol, letters: p.letters, example: p.example },
    });
  }
  console.log("phonemes:", await prisma.phoneme.count());

  // 2. The word lists.
  for (const list of lists) {
    const saved = await prisma.wordList.upsert({
      where: { name: list.name },
      update: { description: list.description },
      create: { name: list.name, description: list.description },
    });

    for (const word of list.words) {
      const exists = await prisma.word.findUnique({
        where: { listId_english: { listId: saved.id, english: word.english } },
      });
      if (exists) continue;

      // Each sound becomes its own row, with its position in the word.
      await prisma.word.create({
        data: {
          english: word.english,
          listId: saved.id,
          phonemes: {
            create: word.phonemes.map((symbol, position) => ({
              position,
              phoneme: { connect: { symbol } },
            })),
          },
        },
      });
    }
  }

  console.log("lists:", await prisma.wordList.count());
  console.log("words:", await prisma.word.count());
  console.log("word sounds:", await prisma.wordPhoneme.count());
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
