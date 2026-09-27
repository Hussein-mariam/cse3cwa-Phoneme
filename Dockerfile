FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# fake url just so prisma generate works, compose gives the real one
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN npx prisma generate

RUN npm run build

FROM node:lts-alpine

RUN apk add --no-cache tini

ENV NODE_ENV=production

WORKDIR /app

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

CMD ["/bin/sh", "/app/entrypoint.sh"]
