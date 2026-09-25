#!/bin/sh
# Waits until Postgres is accepting connections before carrying on.
# The app starts faster than the database, so without this the first
# migration fails on a fresh "docker compose up".

host="$1"
port="$2"
tries=0

until nc -z "$host" "$port" 2>/dev/null; do
  tries=$((tries + 1))
  if [ "$tries" -gt 60 ]; then
    echo "Gave up waiting for $host:$port"
    exit 1
  fi
  echo "Waiting for $host:$port ..."
  sleep 1
done

echo "$host:$port is up"
