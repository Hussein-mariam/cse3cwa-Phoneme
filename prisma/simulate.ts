// adds sample use from late September to early October so the dashboard and reports have something to show
// everything it makes is marked simulated: true
//
//   npm run simulate         adds the sample data
//   npm run simulate clear   removes all of it again (real data is not touched)

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { difficultyFor } from "../lib/difficulty";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// a random whole number from min to max
function between(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// a random item from a list
function pick<T>(items: T[]) {
  return items[between(0, items.length - 1)];
}

// sample data runs from 24 September to the end of 6 October (months count from 0, so 8 is September)
const START = new Date(new Date().getFullYear(), 8, 24);
const END = new Date(new Date().getFullYear(), 9, 7);

// a random time between two dates
function timeBetween(from: Date, to: Date) {
  const ms = Math.random() * (to.getTime() - from.getTime());
  return new Date(from.getTime() + ms);
}

// how long people usually stay on each page, in seconds (shortest, longest)
const pages = [
  { page: "/", min: 5, max: 30 },
  { page: "/lists", min: 20, max: 150 },
  { page: "/wordle", min: 30, max: 200 },
  { page: "/word-search", min: 30, max: 180 },
  { page: "/activities", min: 10, max: 60 },
  { page: "/dashboard", min: 15, max: 90 },
  { page: "/reports", min: 15, max: 90 },
  { page: "/about", min: 10, max: 40 },
  { page: "/settings", min: 5, max: 20 },
];

async function clear() {
  const logs = await prisma.generationLog.deleteMany({ where: { simulated: true } });
  const visits = await prisma.pageVisit.deleteMany({ where: { simulated: true } });
  const activities = await prisma.activity.deleteMany({ where: { simulated: true } });
  console.log("removed", activities.count, "activities,", logs.count, "generations,", visits.count, "visits");
}

async function add() {
  // only lists that have words can be used for an activity
  const lists = await prisma.wordList.findMany({ include: { words: true } });
  const usable = lists.filter((list) => list.words.length > 0);
  if (usable.length === 0) {
    console.log("There are no word lists with words in them, so nothing was added.");
    return;
  }

  let activityCount = 0;
  let logCount = 0;

  for (let i = 1; i <= 24; i++) {
    const list = pick(usable);
    // about 60% wordles
    const type = Math.random() < 0.6 ? "wordle" : "wordsearch";
    const maxGuesses = pick([4, 6, 6, 8]);
    const gridSize = pick([8, 10, 10, 12]);
    const createdAt = timeBetween(START, END);

    const activity = await prisma.activity.create({
      data: {
        name: "Sample " + (type === "wordle" ? "Wordle " : "Word Search ") + i,
        type: type,
        difficulty: difficultyFor(type, maxGuesses, gridSize),
        maxGuesses: maxGuesses,
        gridSize: gridSize,
        showLetters: Math.random() < 0.7,
        showEnglish: Math.random() < 0.7,
        listId: list.id,
        targetWordId: type === "wordle" ? pick(list.words).id : null,
        simulated: true,
        createdAt: createdAt,
      },
    });
    activityCount += 1;

    // a few generations after it was made, most of them working
    const times = between(1, 8);
    for (let g = 0; g < times; g++) {
      const worked = Math.random() > 0.1;

      let message = null;
      if (!worked) {
        if (type === "wordsearch" && gridSize === 8) {
          message = between(1, 3) + " word(s) did not fit on a 8 grid.";
        } else {
          message = "Something went wrong building the file.";
        }
      }

      await prisma.generationLog.create({
        data: {
          activityId: activity.id,
          type: type,
          success: worked,
          message: message,
          simulated: true,
          createdAt: timeBetween(createdAt, END),
        },
      });
      logCount += 1;
    }
  }

  // page visits spread out over the same dates
  for (let v = 0; v < 300; v++) {
    const p = pick(pages);
    await prisma.pageVisit.create({
      data: { page: p.page, seconds: between(p.min, p.max), simulated: true, createdAt: timeBetween(START, END) },
    });
  }

  console.log("added", activityCount, "activities,", logCount, "generations, 300 visits");
}

async function main() {
  if (process.argv[2] === "clear") {
    await clear();
  } else {
    await add();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
