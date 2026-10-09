# Phoneme Wordle Builder

Assessment 3 cse3cwa

Name: Mariam

Student number: 21582294

A website for Speech Pathology teachers. Teachers make word lists from phoneme
sounds, then build a Wordle or Word Search game that students can play in any
browser. Assessment 3 adds a dashboard, reports, alerts, monitoring and testing.
It also runs on AWS EC2.

## Running it

```
docker compose up --build
```

- Website: http://localhost
- Grafana: http://localhost:3001 (admin / admin)
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686

To add sample data: `docker compose exec app npm run simulate` (add `clear` to remove it)

## Pages

- **Word Lists**, **Wordle**, **Word Search**, **Activities** - make lists and games
- **Dashboard** - activity counts, most-used type, successes, failures, time on page, health and alerts
- **Reports** - usage over the last 14 days and recent failures
- **Home**, **About**, **Settings**

## Folders

app/ (pages and API), components/ (shared parts), lib/ (logic), prisma/ (database),
tests/ (Playwright and JMeter), lighthouse/ (reports)

## Test results

- **Playwright** - 2 tests pass, one for editing words and one for making and playing a Wordle
- **JMeter** - no errors up to 10,000 sessions. Generating a game is the slowest step
- **Lighthouse** - fixed low colour contrast and pages jumping while loading. Every page now scores 100

## Things worth knowing

- Each sound is saved as its own row, because some sounds like tʃ use two letters
- Every Generate adds a new row to a log, so the dashboard counts never get mixed up
