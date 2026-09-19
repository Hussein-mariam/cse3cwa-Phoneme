import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseId } from "@/lib/validate";
import { getWords } from "@/lib/wordsDb";
import { exportWordle } from "@/lib/exportWordle";
import { makeGrid } from "@/lib/wordsearch";
import { exportWordSearch } from "@/lib/exportWordSearch";

// In Next 16 the id from the URL arrives as a promise, so it has to be awaited.
type Params = { params: Promise<{ id: string }> };

// GET /api/activities/3/download
//
// Builds the finished .html file from what is stored in the database. The
// export functions are the same ones Assessment 1 used - they are plain
// JavaScript with no React in them, so they can run on the server unchanged.
export async function GET(request: Request, { params }: Params) {
  const p = await params;
  const id = parseId(p.id);
  if (id === null) {
    return NextResponse.json({ error: "That is not a valid activity id." }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id: id } });
  if (!activity) {
    return NextResponse.json({ error: "No activity with that id." }, { status: 404 });
  }

  // The words are read now, when Generate is pressed. So if a teacher edits
  // the list, the next download has the new words in it.
  const words = await getWords({ listId: activity.listId });

  if (words.length === 0) {
    return NextResponse.json(
      { error: "That word list has no words in it, so nothing can be generated." },
      { status: 400 }
    );
  }

  // The exporters expect words shaped like { word: "chin", phonemes: [...] }.
  const forExport = words.map((w) => ({ word: w.english, phonemes: w.phonemes }));

  try {
    let html = "";
    let filename = "";

    if (activity.type === "wordle") {
      // Use the saved answer word, or the first word in the list if there isn't one.
      // The answer is always a word from this list, so it's already loaded.
      let target = forExport[0];
      const answer = words.find((w) => w.id === activity.targetWordId);
      if (answer) {
        target = { word: answer.english, phonemes: answer.phonemes };
      }

      html = exportWordle(target, activity.maxGuesses, activity.showLetters);
      filename = "phoneme-wordle.html";
    } else {
      const puzzle = makeGrid(forExport, activity.gridSize);

      // makeGrid gives up on a word if it can't find room for it.
      const missing = forExport.length - puzzle.placed.length;
      if (missing > 0) {
        const reason = missing + " word(s) did not fit on a " + activity.gridSize + " grid.";
        return NextResponse.json(
          { error: reason + " Try a bigger grid or fewer words." },
          { status: 400 }
        );
      }

      html = exportWordSearch(puzzle, activity.showEnglish);
      filename = "phoneme-word-search.html";
    }

    // "attachment" makes the browser download the file instead of showing it.
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'attachment; filename="' + filename + '"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not generate the activity." }, { status: 500 });
  }
}
