# Phoneme Wordle Builder

Assessment 1 cse3cwa

Name: Mariam
Student number: 21582294

A website for Speech Pathology teachers. The teacher picks a word made of
phoneme symbols, sets how hard it should be, checks it works in the preview,
then downloads it as a single HTML file that students can play in any browser.

## Running it

```
npm install
npm run dev
```

Then open http://localhost:3000

## Pages

- **Home** - what the site does
- **Wordle** - build a phoneme Wordle game
- **Word Search** - build a phoneme word search
- **About** - what the project is, my details, and the walkthrough video
- **Settings** - light or dark theme and text size, saved in cookies

## Folders
- app/ - the pages. Each folder name becomes a URL and page.js is the page. layout.js wraps every page so the header, nav and footer are written once.
- components/ - parts used in more than one place: Grid, Keypad, Nav, Footer, AddWord and Theme.
- lib/ - the data and the logic, with no React in it. phonemes.js and words.js are just lists, score.js marks a guess, wordsearch.js builds the grid, and the two export files build the downloadable pages.
- public/ - the walkthrough video.


## Things worth knowing about the code

Phonemes are stored as a list, not as one string. Some sounds are written with two characters, so splitting a string would give the wrong number of tiles.

Marking a guess takes two passes. The first finds sounds in the right place and
crosses them off a copy of the answer, the second looks for the leftovers. The
crossing off is what makes words with a repeated sound, like "tent", work.

## Scope

Assessment 1 is frontend only, so there is no database. The phonemes and the
word list are kept in `lib/phonemes.js` and `lib/words.js`.