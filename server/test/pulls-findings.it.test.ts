/**
 * M1 — PR-list FINDINGS column against real Postgres: the "latest done run of
 * each agent" basis must only consider runs that still have a review, so
 * DELETE /reviews/:id falls back to the agent's previous reviewed run, and a PR
 * whose only review was deleted shows "—" (findings: null), not 0.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startPg, dockerAvailable, type PgFixture } from './helpers/pg.js';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/platform/config.js';
import { seed } from '../src/db/seed.js';
import { MockGitHubClient } from '../src/adapters/mocks.js';
import * as t from '../src/db/schema.js';
import type { PrMeta } from '@devdigest/shared';

const hasDocker = await dockerAvailable();
const d = hasDocker ? describe : describe.skip;

const config = () => loadConfig({ ...process.env, NODE_ENV: 'test' } as NodeJS.ProcessEnv);

type Db = PgFixture['handle']['db'];

let repoSeq = 0;
async function setupRepo(db: Db, workspaceId: string) {
  const name = `findings-${repoSeq++}`;
  const [repo] = await db
    .insert(t.repos)
    .values({ workspaceId, owner: 'acme', name, fullName: `acme/${name}` })
    .returning();
  const [agent] = await db
    .insert(t.agents)
    .values({ workspaceId, name: `Agent ${name}`, provider: 'openai', model: 'gpt-x', systemPrompt: 'x' })
    .returning();
  return { repo: repo!, agent: agent! };
}

async function insertPr(db: Db, workspaceId: string, repoId: string, number: number) {
  const [pr] = await db
    .insert(t.pullRequests)
    .values({
      workspaceId,
      repoId,
      number,
      title: `PR ${number}`,
      author: 'dev',
      branch: `feat/${number}`,
      base: 'main',
      headSha: 'deadbeef',
      additions: 1,
      deletions: 0,
      filesCount: 1,
      status: 'open',
    })
    .returning();
  return pr!;
}

/** One done run + its review with `n` WARNING findings; returns the review id. */
async function insertReviewedRun(
  db: Db,
  workspaceId: string,
  prId: string,
  agentId: string,
  ranAt: Date,
  n: number,
) {
  const [run] = await db
    .insert(t.agentRuns)
    .values({ workspaceId, agentId, prId, ranAt, status: 'done', findingsCount: n })
    .returning();
  const [review] = await db
    .insert(t.reviews)
    .values({ workspaceId, prId, agentId, runId: run!.id, kind: 'review', score: 70, createdAt: ranAt })
    .returning();
  for (let i = 0; i < n; i++) {
    await db.insert(t.findings).values({
      reviewId: review!.id,
      file: 'src/a.ts',
      startLine: 10 + i,
      endLine: 10 + i,
      severity: 'WARNING',
      category: 'bug',
      title: `finding ${i}`,
      rationale: 'because',
      confidence: 0.8,
    });
  }
  return review!.id;
}

d('PR list FINDINGS column (Testcontainers pg)', () => {
  let pg: PgFixture;
  let workspaceId: string;

  beforeAll(async () => {
    pg = await startPg();
    await seed(pg.handle.db);
    const [ws] = await pg.handle.db.select().from(t.workspaces);
    workspaceId = ws!.id;
  });
  afterAll(async () => {
    await pg?.stop();
  });

  const app = () =>
    buildApp({
      config: config(),
      db: pg.handle.db,
      overrides: { github: new MockGitHubClient({ pulls: [] }) },
    });

  async function listFindings(a: Awaited<ReturnType<typeof app>>, repoId: string, prId: string) {
    const res = await a.inject({ method: 'GET', url: `/repos/${repoId}/pulls` });
    expect(res.statusCode).toBe(200);
    return (res.json() as PrMeta[]).find((p) => p.id === prId)!.findings;
  }

  it('falls back to the previous reviewed run when the newest review is deleted', async () => {
    const db = pg.handle.db;
    const { repo, agent } = await setupRepo(db, workspaceId);
    const pr = await insertPr(db, workspaceId, repo.id, 1);
    await insertReviewedRun(db, workspaceId, pr.id, agent.id, new Date('2026-01-01T00:00:00Z'), 3);
    const newest = await insertReviewedRun(db, workspaceId, pr.id, agent.id, new Date('2026-01-02T00:00:00Z'), 2);

    const a = await app();
    expect((await listFindings(a, repo.id, pr.id))?.total).toBe(2);

    const del = await a.inject({ method: 'DELETE', url: `/reviews/${newest}` });
    expect(del.statusCode).toBe(200);

    const after = await listFindings(a, repo.id, pr.id);
    expect(after?.total).toBe(3);
    expect(after?.counts.WARNING).toBe(3);
  });

  it('shows no findings (null → "—") when the only review is deleted', async () => {
    const db = pg.handle.db;
    const { repo, agent } = await setupRepo(db, workspaceId);
    const pr = await insertPr(db, workspaceId, repo.id, 2);
    const only = await insertReviewedRun(db, workspaceId, pr.id, agent.id, new Date('2026-01-01T00:00:00Z'), 1);

    const a = await app();
    expect((await listFindings(a, repo.id, pr.id))?.total).toBe(1);

    await a.inject({ method: 'DELETE', url: `/reviews/${only}` });
    expect(await listFindings(a, repo.id, pr.id)).toBeNull();
  });
});
