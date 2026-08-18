import { phonemes, getHint } from "@/lib/phonemes";

export function exportWordle(word, maxGuesses, showLetters) {
  let keys = "";
  for (const p of phonemes) {
    keys += '<button class="key" data-sym="' + p.symbol + '" ... </button>';
  }

  return `<!DOCTYPE html>
  ... all the CSS in a <style> tag ...
  ... the board and keypad markup ...
  <script>
  var target = ${JSON.stringify(word.phonemes)};
  var english = ${JSON.stringify(word.word)};
  ... a plain-JavaScript copy of the game ...
  </script>`;
}