/**
 * JobRunner — a job that ultimately fails must not crash the process.
 * RepoService.refresh/add enqueue fire-and-forget and never await `done`; before
 * the fix a failed clone (e.g. the seeded demo repo acme/payments-api, which is
 * not on GitHub) became an unhandled rejection and Node exited the API.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { JobRunner } from '../src/platform/jobs.js';
import type { Db } from '../src/db/client.js';

/** Minimal Drizzle-shaped fake: insert→values→returning, update→set→where. */
function fakeDb() {
  const updates: Record<string, unknown>[] = [];
  const db = {
    insert: () => ({ values: () => ({ returning: async () => [{ id: 'job-1' }] }) }),
    update: () => ({
      set: (v: Record<string, unknown>) => ({
        where: async () => {
          updates.push(v);
        },
      }),
    }),
  };
  return { db: db as unknown as Db, updates };
}

const unhandled: unknown[] = [];
const onUnhandled = (reason: unknown) => unhandled.push(reason);

afterEach(() => {
  process.off('unhandledRejection', onUnhandled);
  unhandled.length = 0;
});

describe('JobRunner failed job', () => {
  it('does not leave an unhandled rejection when nobody awaits `done`', async () => {
    process.on('unhandledRejection', onUnhandled);
    const { db, updates } = fakeDb();
    const onError = vi.fn();
    const jobs = new JobRunner(db, { retries: 0, onError });
    jobs.register('clone', async () => {
      throw new Error("fatal: repository 'https://github.com/acme/payments-api.git/' not found");
    });

    await jobs.enqueue('ws', 'clone', {}); // fire-and-forget, like RepoService.refresh
    await jobs.onIdle();
    await new Promise((r) => setTimeout(r, 20)); // let Node report unhandled rejections

    expect(unhandled).toEqual([]);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]![1]).toEqual({ id: 'job-1', kind: 'clone' });
    expect(updates.at(-1)).toMatchObject({ status: 'failed', error: expect.stringContaining('not found') });
  });

  it('still rejects `done` for callers that await it', async () => {
    const { db } = fakeDb();
    const jobs = new JobRunner(db, { retries: 0, onError: () => {} });
    jobs.register('clone', async () => {
      throw new Error('boom');
    });
    const job = await jobs.enqueue('ws', 'clone', {});
    await expect(job.done).rejects.toThrow('boom');
  });
});
