# -------- Stage 1: Build --------
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# prisma.config.ts reads DATABASE_URL, and the real one only exists at run
# time. Generating the client does not connect to anything, so a placeholder
# is enough to get through the build. Compose supplies the real value later.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Prisma writes the client into lib/generated, and that folder is gitignored,
# so it has to be created here rather than copied in.
RUN npx prisma generate

RUN npm run build

# -------- Stage 2: Production --------
FROM node:lts-alpine

# tini makes Ctrl+C and docker stop shut the app down properly
RUN apk add --no-cache tini

ENV NODE_ENV=production

WORKDIR /app

# Copy only what is needed to run
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/lib ./lib

COPY entrypoint.sh /app/entrypoint.sh
COPY wait-for-postgres.sh /app/wait-for-postgres.sh
RUN chmod +x /app/entrypoint.sh /app/wait-for-postgres.sh

ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 3000

# The entrypoint waits for the database, applies migrations, seeds it, then
# starts the app.
CMD ["/bin/sh", "/app/entrypoint.sh"]
