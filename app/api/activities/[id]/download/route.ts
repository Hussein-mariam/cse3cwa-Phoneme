import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId } from "@/lib/validate";
import { getWords } from "@/lib/wordsDb";
import { exportWordle } from "@/lib/exportWordle";
import { makeGrid } from "@/lib/wordsearch";
import { exportWordSearch } from "@/lib/exportWordSearch";
import { step } from "@/lib/tracing";

type Params = { params: Promise<{ id: string }> };

// saves every Generate press so the dashboard can count successes and failures
async function logGeneration(activityId: number, type: "wordle" | "wordsearch", success: boolean, message: string | null) {
  await step("log generation", () =>
    prisma.generationLog.create({
      data: { activityId: activityId, type: type, success: success, message: message },
    })
  );
}

export async function GET(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  // each step below shows up as its own bar in Jaeger
  const activity = await step("load activity", () => prisma.activity.findUnique({ where: { id: id } }));
  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  const words = await step("load words", () => getWords({ listId: activity.listId }));

  if (words.length === 0) {
    await logGeneration(activity.id, activity.type, false, "The word list is empty.");
    return NextResponse.json(
      { error: "That word list has no words in it, so nothing can be generated." },
      { status: 400 }
    );
  }

  const forExport = words.map((w) => ({ word: w.english, phonemes: w.phonemes }));

  try {
    let html = "";
    let filename = "";

    if (activity.type === "wordle") {
      let target = forExport[0];
      const answer = words.find((w) => w.id === activity.targetWordId);
      if (answer) {
        target = { word: answer.english, phonemes: answer.phonemes };
      }

      html = await step("export wordle", () => exportWordle(target, activity.maxGuesses, activity.showLetters));
      filename = "phoneme-wordle.html";
    } else {
      const puzzle = await step("build grid", () => makeGrid(forExport, activity.gridSize));

      // makeGrid skips a word if it can't fit it
      const missing = forExport.length - puzzle.placed.length;
      if (missing > 0) {
        const reason = missing + " word(s) did not fit on a " + activity.gridSize + " grid.";
        await logGeneration(activity.id, activity.type, false, reason);
        return NextResponse.json(
          { error: reason + " Try a bigger grid or fewer words." },
          { status: 400 }
        );
      }

      html = await step("export word search", () => exportWordSearch(puzzle, activity.showEnglish));
      filename = "phoneme-word-search.html";
    }

    await logGeneration(activity.id, activity.type, true, null);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'attachment; filename="' + filename + '"',
      },
    });
  } catch {
    await logGeneration(activity.id, activity.type, false, "Something went wrong building the file.");
    return NextResponse.json({ error: "Could not generate the activity." }, { status: 500 });
  }
}
