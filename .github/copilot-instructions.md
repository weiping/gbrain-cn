# Copilot Instructions for gbrain

## Project context
GBrain is a TypeScript/Bun personal knowledge brain with PGLite (embedded Postgres) and optional Supabase backend.

## Code style
- TypeScript strict mode, immutable patterns preferred
- Bun runtime (not Node.js) — use `Bun.file`, `Bun.spawn`, etc.
- Files max 800 lines; functions max 50 lines
- No comments unless the WHY is non-obvious

## Testing
- Test files: `test/**/*.test.ts`, `test/**/*.serial.test.ts`
- Use the canonical PGLite block from CLAUDE.md for engine tests
- No `mock.module()` in parallel test files

## PR review focus
- Security: injection, trust boundaries (ctx.remote), SQL parameterization
- Source isolation: always check sourceId scoping in DB queries
- No hardcoded secrets; use config/env
