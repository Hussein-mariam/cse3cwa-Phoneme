#!/bin/sh
set -e

/app/wait-for-postgres.sh postgres 5432

npx prisma migrate deploy

npx tsx prisma/seed.ts

npm start
