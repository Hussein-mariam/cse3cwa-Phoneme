#!/bin/sh
set -e

# 1. Don't touch the database until it is actually listening.
/app/wait-for-postgres.sh postgres 5432

# 2. Create the tables. "migrate deploy" only applies existing migrations,
#    which is the safe version to run automatically.
npx prisma migrate deploy

# 3. Put the phonemes and starting word lists in. The seed skips anything
#    already there, so restarting the container does not duplicate data.
npx tsx prisma/seed.ts

# 4. Start the built app.
npm start
