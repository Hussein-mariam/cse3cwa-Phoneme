import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId } from "@/lib/validate";
import { exportWordle } from "@/lib/exportWordle";
import { makeGrid } from "@/lib/wordsearch";
import { exportWordSearch } from "@/lib/exportWordSearch";

type Params = { params: Promise<{ id: string }> };

// GET /api/activities/3/download
//
// Builds the finished .html file on the server from what is stored in the
// database, then records whether it worked. The exporters are the same ones
// Assessment 1 used - they have no React in them, so they run here unchanged.
export async function GET(request: Request, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      list: {
        include: {
          words: {
            orderBy: { english: "asc" },
            include: { phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } } },
          },
        },
      },
      targetWord: {
        include: { phonemes: { orderBy: { position: "asc" }, include: { phoneme: true } } },
      },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  // Turn the stored sound rows back into the shape the exporters expect.
  const words = activity.list.words.map((w) => ({
    word: w.english,
    phonemes: w.phonemes.map((p) => p.phoneme.symbol),
  }));

  // Anything that goes wrong from here is logged as a failed generation.
  const log = async (success: boolean, message?: string) => {
    await prisma.generationLog.create({
      data: { activityId: activity.id, type: activity.type, success, message: message ?? null },
    });
  };

  if (words.length === 0) {
    await log(false, "The word list is empty.");
    return NextResponse.json(
      { error: "That word list has no words in it, so nothing can be generated." },
      { status: 400 }
    );
  }

  try {
    let html: string;
    let filename: string;

    if (activity.type === "wordle") {
      const target = activity.targetWord
        ? {
            word: activity.targetWord.english,
            phonemes: activity.targetWord.phonemes.map((p) => p.phoneme.symbol),
          }
        : words[0];

      html = exportWordle(target, activity.maxGuesses, activity.showLetters);
      filename = "phoneme-wordle.html";
    } else {
      const puzzle = makeGrid(words, activity.gridSize);

      if (puzzle.placed.length < words.length) {
        const missing = words.length - puzzle.placed.length;
        await log(false, `${missing} word(s) did not fit on a ${activity.gridSize} grid.`);
        return NextResponse.json(
          {
            error: `${missing} word(s) would not fit on a ${activity.gridSize} by ${activity.gridSize} grid. Try a bigger grid or fewer words.`,
          },
          { status: 400 }
        );
      }

      html = exportWordSearch(puzzle, activity.showEnglish);
      filename = "phoneme-word-search.html";
    }

    await log(true);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    await log(false, error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not generate the activity." }, { status: 500 });
  }
}
