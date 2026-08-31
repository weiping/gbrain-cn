/**
 * Self-heal query timeout for PGLite executeRaw (issue #223 class).
 *
 * PGLite is in-process WASM; under accumulated load or after a mid-write
 * SIGTERM leaves WAL/catalog dirty, a query's backing async op can wedge —
 * the JS thread parks in the event loop (kevent64 at 0% CPU) waiting for a
 * completion that never arrives. The self-heal ceiling races the query
 * against a timeout so the caller fails fast instead of hanging forever.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import {
  PGLiteEngine,
  PGLiteQueryTimeoutError,
  _resetPgliteQueryTimeoutCacheForTests,
} from '../src/core/pglite-engine.ts';
import { withEnv } from './helpers/with-env.ts';

describe('PGLite executeRaw self-heal timeout (issue #223 class)', () => {
  // R3/R4 (isolation lint): engines are constructed in beforeAll and
  // disconnected in afterAll. They never really connect — each test swaps
  // the _db handle for a mock — but the pattern keeps the lint's leak
  // guarantees intact if a future edit swaps in a real handle.
  let wedged: PGLiteEngine;
  let fast: PGLiteEngine;
  let erroring: PGLiteEngine;

  beforeAll(() => {
    wedged = new PGLiteEngine();
    fast = new PGLiteEngine();
    erroring = new PGLiteEngine();
  });

  afterAll(async () => {
    for (const e of [wedged, fast, erroring]) {
      try { await e.disconnect(); } catch { /* mocked handle — nothing to close */ }
    }
  });

  const mockHandle = (
    engine: PGLiteEngine,
    query: () => Promise<unknown>,
  ): void => {
    (engine as unknown as { _db: { query: () => Promise<unknown> } })._db = { query };
  };

  test('a wedged query (never resolves) is rejected after the timeout ceiling', async () => {
    await withEnv({ GBRAIN_PGLITE_QUERY_TIMEOUT_MS: '50' }, async () => {
      _resetPgliteQueryTimeoutCacheForTests();

      // Fake a wedged PGLite handle: query() never settles — mimics the
      // kevent64 event-loop-park hang from dirty WASM/WAL state.
      mockHandle(wedged, () => new Promise<never>(() => {}));

      const t0 = Date.now();
      await expect(wedged.executeRaw('SELECT 1 as x')).rejects.toBeInstanceOf(
        PGLiteQueryTimeoutError,
      );
      const elapsed = Date.now() - t0;
      // Fires close to the 50ms ceiling (allow scheduler slack either way).
      expect(elapsed).toBeGreaterThanOrEqual(40);
      expect(elapsed).toBeLessThan(2000);
    });
    _resetPgliteQueryTimeoutCacheForTests();
  });

  test('a normally-fast query still resolves (timeout does not fire)', async () => {
    await withEnv({ GBRAIN_PGLITE_QUERY_TIMEOUT_MS: '5000' }, async () => {
      _resetPgliteQueryTimeoutCacheForTests();

      mockHandle(fast, async () => ({ rows: [{ x: 42 }] }));

      const rows = await fast.executeRaw<{ x: number }>('SELECT 42 as x');
      expect(rows).toEqual([{ x: 42 }]);
    });
    _resetPgliteQueryTimeoutCacheForTests();
  });

  test('timeout=0 disables the ceiling (legacy fast path)', async () => {
    await withEnv({ GBRAIN_PGLITE_QUERY_TIMEOUT_MS: '0' }, async () => {
      _resetPgliteQueryTimeoutCacheForTests();

      // timeout<=0 + no signal → executeRaw returns the query promise directly.
      mockHandle(fast, async () => ({ rows: [{ ok: 1 }] }));

      const rows = await fast.executeRaw('SELECT 1');
      expect(rows).toEqual([{ ok: 1 }]);
    });
    _resetPgliteQueryTimeoutCacheForTests();
  });

  test('a real query error still propagates (not masked by the timeout)', async () => {
    await withEnv({ GBRAIN_PGLITE_QUERY_TIMEOUT_MS: '5000' }, async () => {
      _resetPgliteQueryTimeoutCacheForTests();

      mockHandle(erroring, async () => {
        throw new Error('syntax error');
      });

      await expect(erroring.executeRaw('SELECT bad')).rejects.toThrow('syntax error');
    });
    _resetPgliteQueryTimeoutCacheForTests();
  });
});
