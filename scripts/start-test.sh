#!/usr/bin/env bash
set -e

./scripts/start-db.sh

npx ts-node --files src/tests/helpers/createTestDb.ts

npm run test:integration