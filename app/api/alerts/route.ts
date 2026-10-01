import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/alerts - looks for problems and returns a list of warnings for the dashboard
// level is "error" (red) or "warning" (yellow)
export async function GET() {
  try {
    const alerts = [];

    // generations that failed in the last 24 hours, counted by reason
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFails = await prisma.generationLog.findMany({
      where: { success: false, createdAt: { gte: since } },
    });

    if (recentFails.length > 0) {
      const reasons: Record<string, number> = {};
      for (const fail of recentFails) {
        const reason = fail.message || "Unknown reason";
        if (!reasons[reason]) {
          reasons[reason] = 0;
        }
        reasons[reason] += 1;
      }

      const parts = [];
      for (const reason in reasons) {
        parts.push(reason + " (" + reasons[reason] + ")");
      }
      alerts.push({
        level: "warning",
        text: recentFails.length + " generation(s) failed in the last 24 hours: " + parts.join(", "),
      });
    }

    // too many failures overall (only checked once there are a few to go on)
    const total = await prisma.generationLog.count();
    const failed = await prisma.generationLog.count({ where: { success: false } });
    if (total >= 5 && failed / total > 0.2) {
      alerts.push({
        level: "error",
        text: Math.round((failed / total) * 100) + "% of all generations have failed.",
      });
    }

    // empty word lists - any activity using one will fail to generate
    const lists = await prisma.wordList.findMany({
      include: { _count: { select: { words: true, activities: true } } },
    });
    for (const list of lists) {
      if (list._count.words === 0) {
        let text = 'The word list "' + list.name + '" is empty.';
        if (list._count.activities > 0) {
          text += " " + list._count.activities + " activity(s) use it and will fail to generate.";
        }
        alerts.push({ level: "warning", text: text });
      }
    }

    // invalid data: a word saved with no sounds
    const badWords = await prisma.word.findMany({
      where: { phonemes: { none: {} } },
      include: { list: true },
    });
    for (const word of badWords) {
      alerts.push({
        level: "error",
        text: 'The word "' + word.english + '" in "' + word.list.name + '" has no sounds saved.',
      });
    }

    return NextResponse.json(alerts);
  } catch {
    return NextResponse.json({ error: "Could not reach the database." }, { status: 503 });
  }
}
