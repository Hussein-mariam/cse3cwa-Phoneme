# Phoneme Wordle Builder

Assessment 2 cse3cwa

Name: Mariam
Student number: 21582294

A website for Speech Pathology teachers. The teacher makes word lists out of
phoneme symbols, builds a Wordle or Word Search from a list, and downloads it
as a single HTML file that students can play in any browser. The lists and
saved activities are stored in a Postgres database.

## Running it

```
docker compose up --build
```

Then open http://localhost

## Pages

- **Home** - what the site does
- **Word Lists** - add, edit and delete word lists and words
- **Wordle** and **Word Search** - build an activity from a list and download it
- **Activities** - saved activities, which can be generated again, changed or deleted
- **About** - what the project is and my details
- **Settings** - theme and text size, saved in cookies

## Folders

- app/ - the pages, the API routes (app/api) and the health check (app/health)
- components/ - parts used on more than one page, like the Keypad and Nav
- lib/ - the logic, like the database helpers, validation, scoring, the word search grid and the export files
- prisma/ - the database tables, migrations and starting data

## Things worth knowing 

Each sound is stored as its own row in the database, not as one string. Some
sounds are written with two characters, like tʃ, so splitting a string would
give the wrong number of tiles. "chin" is four letters but three sounds.

Marking a guess takes two passes. The first finds sounds in the right place and
crosses them off, the second looks for the leftovers. That is what makes words
with a repeated sound, like "tent", work.
