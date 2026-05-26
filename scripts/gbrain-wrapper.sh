#!/bin/bash
# GBrain wrapper script - avoids PGLite WASM path issues
# Runs from the local development directory so Bun auto-loads .env
GBRAIN_DIR="/Users/liuweiping/gbrain"
cd "$GBRAIN_DIR" && exec bun run src/cli.ts "$@"
