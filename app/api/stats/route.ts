import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats - all the numbers the dashboard shows, worked out from the database
export async function GET() {
  try {
    // word lists
    const lists = await prisma.wordList.count();
    const words = await prisma.word.count();
    const sounds = await prisma.wordPhoneme.count();

    // activities that have been saved
    const wordles = await prisma.activity.count({ where: { type: "wordle" } });
    const wordSearches = await prisma.activity.count({ where: { type: "wordsearch" } });
    const easy = await prisma.activity.count({ where: { difficulty: "easy" } });
    const normal = await prisma.activity.count({ where: { difficulty: "normal" } });
    const hard = await prisma.activity.count({ where: { difficulty: "hard" } });

    // every time Generate was pressed
    const generated = await prisma.generationLog.count();
    const succeeded = await prisma.generationLog.count({ where: { success: true } });
    const failed = generated - succeeded;
    const wordlesMade = await prisma.generationLog.count({ where: { type: "wordle", success: true } });
    const searchesMade = await prisma.generationLog.count({ where: { type: "wordsearch", success: true } });

    let successRate = 0;
    if (generated > 0) {
      successRate = Math.round((succeeded / generated) * 100);
    }

    // most-used type is the one that has been generated the most
    let mostUsed = "None yet";
    if (wordlesMade > searchesMade) {
      mostUsed = "Wordle";
    } else if (searchesMade > wordlesMade) {
      mostUsed = "Word Search";
    } else if (wordlesMade > 0) {
      mostUsed = "Both the same";
    }

    // time on page: add up the seconds for each page, then divide by its number of visits
    const visits = await prisma.pageVisit.findMany();
    const pages: Record<string, { total: number; count: number }> = {};
    let allSeconds = 0;

    for (const visit of visits) {
      if (!pages[visit.page]) {
        pages[visit.page] = { total: 0, count: 0 };
      }
      pages[visit.page].total += visit.seconds;
      pages[visit.page].count += 1;
      allSeconds += visit.seconds;
    }

    const timeOnPage = [];
    for (const page in pages) {
      timeOnPage.push({
        page: page,
        visits: pages[page].count,
        average: Math.round(pages[page].total / pages[page].count),
      });
    }
    // most visited pages first
    timeOnPage.sort((a, b) => b.visits - a.visits);

    let averageTime = 0;
    if (visits.length > 0) {
      averageTime = Math.round(allSeconds / visits.length);
    }

    // the last 10 things that were generated, with the activity and list they came from
    const recent = await prisma.generationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { activity: { include: { list: true } } },
    });

    const outputs = recent.map((log) => ({
      id: log.id,
      when: log.createdAt,
      type: log.type,
      success: log.success,
      message: log.message,
      activityId: log.activityId,
      name: log.activity ? log.activity.name : "(deleted activity)",
      list: log.activity ? log.activity.list.name : "",
      difficulty: log.activity ? log.activity.difficulty : "",
    }));

    // how much of the data is sample data
    const simulated =
      (await prisma.activity.count({ where: { simulated: true } })) +
      (await prisma.generationLog.count({ where: { simulated: true } })) +
      (await prisma.pageVisit.count({ where: { simulated: true } }));

    return NextResponse.json({
      lists: lists,
      words: words,
      sounds: sounds,
      activities: { wordle: wordles, wordsearch: wordSearches, total: wordles + wordSearches },
      difficulty: { easy: easy, normal: normal, hard: hard },
      generations: {
        total: generated,
        succeeded: succeeded,
        failed: failed,
        successRate: successRate,
        wordle: wordlesMade,
        wordsearch: searchesMade,
      },
      mostUsed: mostUsed,
      averageTime: averageTime,
      timeOnPage: timeOnPage,
      outputs: outputs,
      simulated: simulated,
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the database." }, { status: 503 });
  }
}
