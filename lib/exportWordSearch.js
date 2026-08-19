import { getHint } from "@/lib/phonemes";

// Builds the downloadable word search as one big piece of text, the same way exportWordle.js does.
export function exportWordSearch(puzzle, showEnglish) {
  let list = "";
  for (const p of puzzle.placed) {
    let chips = "";
    for (const s of p.phonemes) {
      chips +=
        '<span class="chip">' + s + '<span class="tip">' + getHint(s) + "</span></span>";
    }
    list +=
      '<li id="w-' +
      p.phonemes.join("") +
      '">/' +
      chips +
      "/" +
      (showEnglish ? " - " + p.word : "") +
      "</li>";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Phoneme Word Search</title>
<style>
body { font-family: Arial, sans-serif; padding: 16px; max-width: 800px; margin: 0 auto; color: #121213; }
h1 { font-size: 22px; text-transform: uppercase; letter-spacing: 1px;
     border-bottom: 1px solid #d3d6da; padding-bottom: 8px; margin-bottom: 10px; }
.wrap { display: flex; gap: 24px; flex-wrap: wrap; }
.grid { display: grid; gap: 3px; max-width: 420px; flex: 1; min-width: 280px; }
.cell { aspect-ratio: 1; border: 1px solid #d3d6da; background: #f6f7f8; font-size: 15px;
        font-weight: bold; cursor: pointer; padding: 0; border-radius: 4px; }
.cell.picked { background: #c9b458; color: white; border-color: #c9b458; }
.cell.found  { background: #6aaa64; color: white; border-color: #6aaa64; }
ul { list-style: none; padding: 0; }
li { margin-bottom: 8px; font-size: 16px; }
li.done { text-decoration: line-through; color: #6aaa64; }
.chip { border: 1px solid #d3d6da; padding: 2px 5px; margin: 0 1px; position: relative;
        border-radius: 4px; }
.chip .tip { display: none; position: absolute; bottom: 100%; left: 0; background: #121213;
             color: white; padding: 4px 6px; font-size: 12px; font-weight: normal;
             white-space: nowrap; z-index: 5; border-radius: 4px; }
.chip:hover .tip, .chip:focus .tip { display: block; }
.msg { padding: 8px; background: #f6f7f8; border: 1px solid #d3d6da; margin: 10px 0; }
.go { padding: 8px 14px; background: #d3d6da; color: #121213; border: none; border-radius: 4px;
      font-weight: bold; cursor: pointer; margin-right: 6px; }
.go:hover { background: #bcc0c4; }
</style>
</head>
<body>
<h1>Phoneme Word Search</h1>
<p>Click the first phoneme of a word, then click the last one. Hover a phoneme to see its English letters.</p>

<div class="wrap">
  <div>
    <p id="count"></p>
    <div class="grid" id="grid"></div>
  </div>
  <div>
    <h3>Find these words</h3>
    <ul>${list}</ul>
  </div>
</div>

<div class="msg" id="msg"></div>
<button class="go" onclick="showAnswers()">Show answers</button>
<button class="go" onclick="location.reload()">Reset</button>

<script>
var grid = ${JSON.stringify(puzzle.grid)};
var placed = ${JSON.stringify(puzzle.placed)};
var size = ${puzzle.size};
var start = null;
var found = [];

function build() {
  var g = document.getElementById("grid");
  g.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var b = document.createElement("button");
      b.className = "cell";
      b.id = r + "," + c;
      b.textContent = grid[r][c];
      b.onclick = makeClick(r, c);
      g.appendChild(b);
    }
  }
  count();
}

function makeClick(r, c) {
  return function () { clicked(r, c); };
}

function getPath(r1, c1, r2, c2) {
  var dr = r2 - r1;
  var dc = c2 - c1;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  var steps = Math.max(Math.abs(dr), Math.abs(dc));
  var sr = steps === 0 ? 0 : dr / steps;
  var sc = steps === 0 ? 0 : dc / steps;
  var path = [];
  for (var i = 0; i <= steps; i++) path.push([r1 + sr * i, c1 + sc * i]);
  return path;
}

function clicked(r, c) {
  if (start === null) {
    start = [r, c];
    document.getElementById(r + "," + c).classList.add("picked");
    document.getElementById("msg").textContent = "Now click the last phoneme.";
    return;
  }

  var path = getPath(start[0], start[1], r, c);
  document.getElementById(start[0] + "," + start[1]).classList.remove("picked");
  start = null;

  if (path === null) {
    document.getElementById("msg").textContent = "Words go straight across, down or diagonally.";
    return;
  }

  var text = "";
  var back = "";
  for (var i = 0; i < path.length; i++) text += grid[path[i][0]][path[i][1]];
  for (var j = path.length - 1; j >= 0; j--) back += grid[path[j][0]][path[j][1]];

  for (var k = 0; k < placed.length; k++) {
    var key = placed[k].phonemes.join("");
    if (found.indexOf(key) !== -1) continue;
    if (key === text || key === back) {
      found.push(key);
      for (var m = 0; m < path.length; m++) {
        document.getElementById(path[m][0] + "," + path[m][1]).classList.add("found");
      }
      document.getElementById("w-" + key).className = "done";
      document.getElementById("msg").textContent = "Found " + placed[k].word + "!";
      count();
      return;
    }
  }

  document.getElementById("msg").textContent = "Not one of the words.";
}

function count() {
  document.getElementById("count").textContent = found.length + " of " + placed.length + " found";
  if (found.length === placed.length) {
    document.getElementById("msg").textContent = "All words found. Well done!";
  }
}

function showAnswers() {
  for (var k = 0; k < placed.length; k++) {
    for (var m = 0; m < placed[k].cells.length; m++) {
      document.getElementById(placed[k].cells[m]).classList.add("found");
    }
  }
  document.getElementById("msg").textContent = "Answers shown.";
}

build();
</script>
</body>
</html>`;
}