/**
 * Self-heal query timeout for PGLite executeRaw (issue #223 class).
 *
 * PGLite is in-process WASM; under accumulated load or after a mid-write
 * SIGTERM leaves WAL/catalog dirty, a query's backing async op can wedge —
 * the JS thread parks in the event loop (kevent64 at 0% CPU) waiting for a
 * completion that never arrives. The self-heal ceiling races the query
 * against a timeout so the caller fails fast instead of hanging forever.
 */

import { describe, test, expect, afterEach } from 'bun:test';
import {
  PGLiteEngine,
  PGLiteQueryTimeoutError,
  _resetPgliteQueryTimeoutCacheForTests,
} from '../src/core/pglite-engine.ts';

describe('PGLite executeRaw self-heal timeout (issue #223 class)', () => {
  const prevEnv = process.env.GBRAIN_PGLITE_QUERY_TIMEOUT_MS;

  afterEach(() => {
    if (prevEnv === undefined) delete process.env.GBRAIN_PGLITE_QUERY_TIMEOUT_MS;
    else process.env.GBRAIN_PGLITE_QUERY_TIMEOUT_MS = prevEnv;
    _resetPgliteQueryTimeoutCacheForTests();
  });

  test('a wedged query (never resolves) is rejected after the timeout ceiling', async () => {
    process.env.GBRAIN_PGLITE_QUERY_TIMEOUT_MS = '50';
    _resetPgliteQueryTimeoutCacheForTests();

    const engine = new PGLiteEngine();
    // Fake a wedged PGLite handle: query() never settles — mimics the
    // kevent64 event-loop-park hang from dirty WASM/WAL state.
    (engine as unknown as { _db: { query: () => Promise<never> } })._db = {
      query: () => new Promise<never>(() => {}),
    };

    const t0 = Date.now();
    await expect(engine.executeRaw('SELECT 1 as x')).rejects.toBeInstanceOf(
      PGLiteQueryTimeoutError,
    );
    const elapsed = Date.now() - t0;
    // Fires close to the 50ms ceiling (allow scheduler slack either way).
    expect(elapsed).toBeGreaterThanOrEqual(40);
    expect(elapsed).toBeLessThan(2000);
  });

  test('a normally-fast query still resolves (timeout does not fire)', async () => {
    process.env.GBRAIN_PGLITE_QUERY_TIMEOUT_MS = '5000';
    _resetPgliteQueryTimeoutCacheForTests();

    const engine = new PGLiteEngine();
    (engine as unknown as { _db: { query: () => Promise<{ rows: { x: number }[] }> } })._db = {
      query: async () => ({ rows: [{ x: 42 }] }),
    };

    const rows = await engine.executeRaw<{ x: number }>('SELECT 42 as x');
    expect(rows).toEqual([{ x: 42 }]);
  });

  test('timeout=0 disables the ceiling (legacy fast path)', async () => {
    process.env.GBRAIN_PGLITE_QUERY_TIMEOUT_MS = '0';
    _resetPgliteQueryTimeoutCacheForTests();

    const engine = new PGLiteEngine();
    (engine as unknown as { _db: { query: () => Promise<{ rows: { ok: number }[] }> } })._db = {
      query: async () => ({ rows: [{ ok: 1 }] }),
    };

    // timeout<=0 + no signal → executeRaw returns the query promise directly.
    const rows = await engine.executeRaw('SELECT 1');
    expect(rows).toEqual([{ ok: 1 }]);
  });

  test('a real query error still propagates (not masked by the timeout)', async () => {
    process.env.GBRAIN_PGLITE_QUERY_TIMEOUT_MS = '5000';
    _resetPgliteQueryTimeoutCacheForTests();

    const engine = new PGLiteEngine();
    (engine as unknown as { _db: { query: () => Promise<never> } })._db = {
      query: async () => {
        throw new Error('syntax error');
      },
    };

    await expect(engine.executeRaw('SELECT bad')).rejects.toThrow('syntax error');
  });
});
