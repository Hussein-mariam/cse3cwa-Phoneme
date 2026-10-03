import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// turns a date into a day 
// (the server runs on UTC, so without this "today" would start at 10 or 11am)
function dayOf(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" });
}

// GET /api/reports - what has happened over time, for the reports page
export async function GET() {
  try {
    // the last 14 days, oldest first, each starting at zero
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      days.push({ day: dayOf(date), worked: 0, failed: 0, wordles: 0, wordSearches: 0 });
    }
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // 1. generations per day
    const logs = await prisma.generationLog.findMany({ where: { createdAt: { gte: since } } });
    for (const log of logs) {
      const row = days.find((d) => d.day === dayOf(log.createdAt));
      if (row) {
        if (log.success) {
          row.worked += 1;
        } else {
          row.failed += 1;
        }
      }
    }

    // 2. activities created per day
    const created = await prisma.activity.findMany({ where: { createdAt: { gte: since } } });
    for (const activity of created) {
      const row = days.find((d) => d.day === dayOf(activity.createdAt));
      if (row) {
        if (activity.type === "wordle") {
          row.wordles += 1;
        } else {
          row.wordSearches += 1;
        }
      }
    }

    // 3. word list usage: words, activities and successful generations for each list
    const lists = await prisma.wordList.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { words: true, activities: true } } },
    });
    const worked = await prisma.generationLog.findMany({
      where: { success: true },
      include: { activity: true },
    });
    const listUsage = [];
    for (const list of lists) {
      let generated = 0;
      for (const log of worked) {
        if (log.activity && log.activity.listId === list.id) {
          generated += 1;
        }
      }
      listUsage.push({
        name: list.name,
        words: list._count.words,
        activities: list._count.activities,
        generated: generated,
      });
    }
    // most generated first
    listUsage.sort((a, b) => b.generated - a.generated);

    // 4. difficulty by type, and 5. output settings
    const activities = await prisma.activity.findMany();
    const difficulty = {
      wordle: { easy: 0, normal: 0, hard: 0 },
      wordsearch: { easy: 0, normal: 0, hard: 0 },
    };
    const settings = { lettersOn: 0, lettersOff: 0, englishOn: 0, englishOff: 0 };
    for (const activity of activities) {
      difficulty[activity.type][activity.difficulty] += 1;

      if (activity.type === "wordle") {
        if (activity.showLetters) {
          settings.lettersOn += 1;
        } else {
          settings.lettersOff += 1;
        }
      } else {
        if (activity.showEnglish) {
          settings.englishOn += 1;
        } else {
          settings.englishOff += 1;
        }
      }
    }

    // 6. the last 20 failures and why they happened
    const failures = await prisma.generationLog.findMany({
      where: { success: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { activity: { include: { list: true } } },
    });
    const recentFailures = failures.map((log) => ({
      id: log.id,
      when: log.createdAt,
      type: log.type,
      reason: log.message,
      name: log.activity ? log.activity.name : "(deleted activity)",
      list: log.activity ? log.activity.list.name : "",
    }));

    return NextResponse.json({
      days: days,
      listUsage: listUsage,
      difficulty: difficulty,
      settings: settings,
      recentFailures: recentFailures,
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the database." }, { status: 503 });
  }
}
