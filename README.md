# Phoneme Wordle Builder

Assessment 2 cse3cwa

Name: Mariam
Student number: 21582294

A website for Speech Pathology teachers. The teacher builds word lists out of
phoneme symbols, sets how hard an activity should be, checks it works in the
preview, then downloads it as a single HTML file that students can play in any
browser.

Assessment 1 was the frontend only, with the words written into a file. In
Assessment 2 the words, the sounds and the saved activities all live in a
Postgres database, and the downloadable file is built on the server from what
is stored there.

## Running it with Docker

This is the way the marker should run it. Docker starts the app and the
database together, and the app waits for the database, applies the migrations
and seeds it before it starts.

```
docker compose up --build
```

Then open http://localhost

To stop it:

```
docker compose down
```

Adding `-v` to that also deletes the database volume, so the next start seeds a
fresh database.

## Running it without Docker

You need Postgres running on your own machine and a `.env` file with a
`DATABASE_URL` in it, for example:

```
DATABASE_URL="postgresql://user:password@localhost:5432/phonemedb"
```

Then:

```
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Then open http://localhost:3000

`prisma generate` is separate on purpose. `migrate` only changes the database,
it does not write the client code the app imports, so both have to run.

## Pages

- **Home** - what the site does
- **Word Lists** - create, rename and delete lists, and add, edit and delete the words in them. This is the page that shows all four CRUD operations
- **Wordle** - build a phoneme Wordle from a list, preview it, save it and download it
- **Word Search** - build a phoneme word search from a list, preview it, save it and download it
- **Activities** - every saved configuration, which can be generated again, edited or deleted
- **About** - what the project is, my details, and the walkthrough video
- **Settings** - light or dark theme and text size, saved in cookies

## API routes

| Method | Route | What it does |
| --- | --- | --- |
| GET | `/health` | returns 200 with `database: connected`, or 503 if the database is down |
| GET | `/api/phonemes` | every sound in the inventory |
| GET, POST | `/api/lists` | all word lists, or make a new one |
| GET, PUT, DELETE | `/api/lists/[id]` | one list, rename it, or delete it and its words |
| GET, POST | `/api/words` | words in a list (`?listId=`), or add a word |
| GET, PUT, DELETE | `/api/words/[id]` | one word, edit it, or delete it |
| GET, POST | `/api/activities` | saved activities, or save a new one |
| GET, PUT, DELETE | `/api/activities/[id]` | one activity, edit it, or delete it |
| GET | `/api/activities/[id]/download` | builds the playable HTML file from the database |

Anything that goes wrong comes back as `{ "error": "a plain English message" }`
with a matching status code: 400 for bad input, 404 for something that is not
there, 409 for a duplicate name, 500 for anything unexpected.

## Folders

- app/ - the pages and the API. A folder name becomes a URL, page.js is the page and route.ts is the API endpoint. layout.js wraps every page so the header, nav and footer are written once.
- components/ - parts used in more than one place: Grid, Keypad, Nav, Footer, AddWord and Theme.
- lib/ - the logic, with no React in it. prisma.ts opens the database, validate.ts checks input, score.js marks a guess, wordsearch.js builds the grid, and the two export files build the downloadable pages.
- prisma/ - the schema, the migration and the seed data.
- public/ - the walkthrough video.

## The database

Six tables. `Phoneme` is the sound inventory. `WordList` holds a named list and
`Word` holds the words in it. `WordPhoneme` is one row per sound in a word,
with its position. `Activity` is a saved builder configuration and
`GenerationLog` records every attempt to generate a file.

## Things worth knowing about the code

Sounds are stored as one row each in `WordPhoneme`, not as one string in the
`Word` table. Some sounds are written with two characters, so splitting a
string would give the wrong number of tiles. Storing them as rows with a
position means a two-character symbol stays one unit. The word "chin" is four
letters but three rows.

Marking a guess takes two passes. The first finds sounds in the right place and
crosses them off a copy of the answer, the second looks for the leftovers. The
crossing off is what makes words with a repeated sound, like "tent", work.

The validation in lib/validate.ts runs on the server even though the forms
already check the same things. The forms only stop honest mistakes, and
anything can send a request straight to the API, so the server has to check
again.

The download route reads the activity and its words out of the database,
turns the sound rows back into arrays, and hands them to the same export
functions the frontend used in Assessment 1. Because the words are read at the
moment you press Generate, editing a list and generating again gives an
updated file without changing any settings.
