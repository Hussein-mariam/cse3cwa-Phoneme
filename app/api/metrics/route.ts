import { prisma } from "@/lib/prisma";

// GET /api/metrics - the dashboard numbers in the plain text format Prometheus reads
// Prometheus asks for this every 15 seconds (see prometheus/prometheus.yml)
export async function GET() {
  const lines: string[] = [];

  // 1 if the database answers, 0 if not, so Grafana can show when it went down
  let dbUp = 1;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbUp = 0;
  }
  lines.push("# HELP phoneme_db_up 1 if the database answered, 0 if it did not");
  lines.push("# TYPE phoneme_db_up gauge");
  lines.push("phoneme_db_up " + dbUp);

  if (dbUp === 1) {
    try {
      // every Generate press, split by type and whether it worked
      const generations = await prisma.generationLog.groupBy({
        by: ["type", "success"],
        _count: { _all: true },
      });
      lines.push("# HELP phoneme_generations_total Generate presses by type and result");
      lines.push("# TYPE phoneme_generations_total counter");
      for (const row of generations) {
        const result = row.success ? "success" : "failed";
        lines.push('phoneme_generations_total{type="' + row.type + '",result="' + result + '"} ' + row._count._all);
      }

      // saved activities of each type
      const activities = await prisma.activity.groupBy({ by: ["type"], _count: { _all: true } });
      lines.push("# HELP phoneme_activities Saved activities by type");
      lines.push("# TYPE phoneme_activities gauge");
      for (const row of activities) {
        lines.push('phoneme_activities{type="' + row.type + '"} ' + row._count._all);
      }

      lines.push("# HELP phoneme_word_lists Word lists stored");
      lines.push("# TYPE phoneme_word_lists gauge");
      lines.push("phoneme_word_lists " + (await prisma.wordList.count()));
      lines.push("# HELP phoneme_words Words stored");
      lines.push("# TYPE phoneme_words gauge");
      lines.push("phoneme_words " + (await prisma.word.count()));

      // visits and total seconds for each page, Grafana divides them for the average
      const visits = await prisma.pageVisit.groupBy({
        by: ["page"],
        _count: { _all: true },
        _sum: { seconds: true },
      });
      lines.push("# HELP phoneme_page_visits_total Page visits by page");
      lines.push("# TYPE phoneme_page_visits_total counter");
      for (const row of visits) {
        lines.push('phoneme_page_visits_total{page="' + row.page + '"} ' + row._count._all);
      }
      lines.push("# HELP phoneme_page_seconds_total Seconds spent on each page");
      lines.push("# TYPE phoneme_page_seconds_total counter");
      for (const row of visits) {
        lines.push('phoneme_page_seconds_total{page="' + row.page + '"} ' + (row._sum.seconds ?? 0));
      }
    } catch {
      // the database dropped out halfway, phoneme_db_up is enough to show that
    }
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; version=0.0.4" },
  });
}
