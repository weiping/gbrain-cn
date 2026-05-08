#!/bin/bash
# GBrain wrapper script - avoids PGLite WASM path issues
cd ~/.bun/install/global/node_modules/gbrain && exec bun run src/cli.ts "$@"
