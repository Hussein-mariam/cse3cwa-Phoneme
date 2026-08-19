import { phonemes, getHint } from "@/lib/phonemes";

// Builds the whole downloadable file as one big piece of text. Everything is
// inlined so the file works on its own with no server and no internet.
export function exportWordle(word, maxGuesses, showLetters) {
  // Build the keypad buttons as HTML text first.
  let keys = "";

  for (const p of phonemes) {
    keys +=
      '<button class="key" data-sym="' +
      p.symbol +
      '" onclick="pick(\'' +
      p.symbol +
      "')\">" +
      p.symbol +
      (showLetters ? '<span class="small">' + p.letters + "</span>" : "") +
      '<span class="tip">' +
      getHint(p.symbol) +
      "</span></button>";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Phoneme Wordle</title>
<style>
body { font-family: Arial, sans-serif; padding: 16px; max-width: 700px; margin: 0 auto; color: #121213; }
h1 { font-size: 22px; text-transform: uppercase; letter-spacing: 1px;
     border-bottom: 1px solid #d3d6da; padding-bottom: 8px; margin-bottom: 10px; }
.row { display: flex; gap: 5px; margin-bottom: 5px; }
.tile { width: 52px; height: 52px; border: 2px solid #d3d6da; display: flex;
        align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
.correct { background: #6aaa64; border-color: #6aaa64; color: white; }
.present { background: #c9b458; border-color: #c9b458; color: white; }
.absent  { background: #787c7e; border-color: #787c7e; color: white; }
.keypad { display: flex; flex-wrap: wrap; gap: 5px; margin: 12px 0; }
.key { min-width: 44px; min-height: 48px; background: #d3d6da; color: #121213; border: none;
       border-radius: 4px; cursor: pointer; position: relative; font-size: 15px; font-weight: bold; }
.key:hover { background: #bcc0c4; }
.key .small { display: block; font-size: 10px; font-weight: normal; color: #6e6e6e; }
.key .tip { display: none; position: absolute; bottom: 100%; left: 0; background: #121213;
            color: white; padding: 4px 6px; font-size: 12px; font-weight: normal;
            white-space: nowrap; z-index: 5; border-radius: 4px; }
.key:hover .tip, .key:focus .tip { display: block; }
.go { padding: 8px 14px; background: #d3d6da; color: #121213; border: none; border-radius: 4px;
      font-weight: bold; cursor: pointer; margin-right: 6px; }
.go:hover { background: #bcc0c4; }
.msg { padding: 8px; background: #f6f7f8; border: 1px solid #d3d6da; margin: 10px 0; }
.answer { padding: 10px; background: #6aaa64; color: white; margin: 10px 0;
          font-size: 18px; border-radius: 4px; }
</style>
</head>
<body>
<h1>Phoneme Wordle</h1>
<p>Build the word using the buttons, then press Check. Hover a phoneme to see its English letters.</p>

<div id="board"></div>
<div class="msg" id="msg"></div>
<div id="answer"></div>
<div class="keypad">${keys}</div>

<button class="go" onclick="check()">Check</button>
<button class="go" onclick="back()">Delete</button>
<button class="go" onclick="restart()">Play again</button>

<script>
// JSON.stringify turns the array into text that is valid JavaScript.
var target = ${JSON.stringify(word.phonemes)};
var english = ${JSON.stringify(word.word)};
var maxGuesses = ${maxGuesses};
var guess = [];
var row = 0;
var over = false;

function build() {
  var board = document.getElementById("board");
  board.innerHTML = "";
  for (var r = 0; r < maxGuesses; r++) {
    var line = document.createElement("div");
    line.className = "row";
    for (var c = 0; c < target.length; c++) {
      var tile = document.createElement("div");
      tile.className = "tile";
      tile.id = "t" + r + "-" + c;
      line.appendChild(tile);
    }
    board.appendChild(line);
  }
}

function draw() {
  for (var c = 0; c < target.length; c++) {
    document.getElementById("t" + row + "-" + c).textContent = guess[c] || "";
  }
}

function pick(sym) {
  if (over || guess.length >= target.length) return;
  guess.push(sym);
  draw();
}

function back() {
  if (over) return;
  guess.pop();
  draw();
}

// Same rule as lib/score.js, rewritten in plain JavaScript so the downloaded
// file marks guesses exactly the same way the preview does.
function score(g, t) {
  var result = [];
  var used = [];
  var i, j;

  for (i = 0; i < g.length; i++) {
    if (g[i] === t[i]) {
      result[i] = "correct";
      used.push(i);
    } else {
      result[i] = "absent";
    }
  }

  for (i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;
    for (j = 0; j < t.length; j++) {
      if (used.indexOf(j) === -1 && t[j] === g[i]) {
        result[i] = "present";
        used.push(j);
        break;
      }
    }
  }

  return result;
}

function check() {
  if (over) return;

  if (guess.length < target.length) {
    document.getElementById("msg").textContent =
      "Pick " + (target.length - guess.length) + " more phoneme(s).";
    return;
  }

  var result = score(guess, target);
  var win = true;

  for (var c = 0; c < target.length; c++) {
    var tile = document.getElementById("t" + row + "-" + c);
    tile.className = "tile " + result[c];
    if (result[c] !== "correct") win = false;

    var keys = document.querySelectorAll(".key");
    for (var k = 0; k < keys.length; k++) {
      if (keys[k].getAttribute("data-sym") === guess[c]) {
        if (keys[k].className.indexOf("correct") === -1) {
          keys[k].className = "key " + result[c];
        }
      }
    }
  }

  row++;
  guess = [];

  if (win) {
    over = true;
    document.getElementById("msg").textContent = "Correct!";
    document.getElementById("answer").innerHTML =
      "<div class='answer'>/" + target.join(" ") + "/ = <b>" + english + "</b></div>";
  } else if (row >= maxGuesses) {
    over = true;
    document.getElementById("msg").textContent = "Out of guesses.";
    document.getElementById("answer").innerHTML =
      "<div class='answer'>The word was /" + target.join(" ") + "/ = <b>" + english + "</b></div>";
  } else {
    document.getElementById("msg").textContent = "Try again.";
  }
}

function restart() {
  guess = [];
  row = 0;
  over = false;
  document.getElementById("msg").textContent = "";
  document.getElementById("answer").innerHTML = "";
  var keys = document.querySelectorAll(".key");
  for (var k = 0; k < keys.length; k++) {
    keys[k].className = "key";
  }
  build();
}

build();
</script>
</body>
</html>`;
}