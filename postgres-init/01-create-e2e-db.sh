#!/bin/sh
# Creates a second database for local E2E runs (cd e2e && npm test),
# so tests never touch the dev database's data.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE softogram_e2e;
EOSQL
