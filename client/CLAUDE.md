# client — `@devdigest/web`

Next.js studio on `:3000`: repos, PR list, diff, review runs and findings, agent editor, settings.

## Stack
Next.js 15 (App Router) · React 19 · TanStack Query 5 · Tailwind 4 · next-intl 3 · zod 3 ·
vitest 2 + Testing Library + jsdom

## Commands (run from `client/`)
- Dev: `pnpm dev` · Typecheck: `pnpm typecheck` · Build: `pnpm build`
- Tests: `pnpm test` (fetch is mocked; no API or browser needed)

## Where things live
- `src/app/**/page.tsx`: routes. Pages are thin.
- `src/app/**/_components/<Name>/`: feature components colocated with their route, each with its own `*.test.tsx`.
- `src/lib/api.ts`: the only `fetch` wrapper (`apiFetch`, `ApiError`). `src/lib/hooks/*`: all data hooks.
- `src/components/`: cross-route pieces (app shell, diff viewer, page shell).
- `src/vendor/ui/`: design system (`@devdigest/ui`). `src/vendor/shared/`: Zod contracts (`@devdigest/shared`).
- `messages/en/*.json`: UI strings for next-intl.

## Conventions (non-default)
- Talk to the API only through a hook in `src/lib/hooks/*` that uses `apiFetch`. No raw `fetch` in components.
- Import UI only from the `@devdigest/ui` barrel. Never import a layer file inside `vendor/ui` directly.
- User-visible text goes in `messages/en/<area>.json`, not inline in components.
- Style through the CSS variables of `@devdigest/ui`, not hard-coded colors.
- New component = folder `_components/<Name>/` with the component and its `*.test.tsx`.

## Gotchas
- `src/vendor/shared` is a **copy** of the server's contracts and has drifted (for example, no `'openrouter'` provider id).
  When a contract changes, update both copies.
- Live run progress arrives over SSE (`EventSource` on `/runs/:id/events`) in `lib/hooks/reviews.ts`.
  The same hooks also poll (`refetchInterval`) while runs are active, and invalidate `reviews` when a run ends.
- `apiFetch` sets `content-type: application/json` only when a body is sent: Fastify rejects empty JSON bodies.
- `messages/en` and `vendor/ui` already contain strings and components for future milestones. They are not dead code.
- API base comes from `NEXT_PUBLIC_API_BASE` (default `http://localhost:3001`).

## Documentation (open when relevant)
- UI route map and which API each route uses → `README.md`
- Design system usage and layers → `src/vendor/ui/README.md`
- Browser journeys that cover the UI → `../e2e/README.md`
- Deep dives → `docs/` · Feature specs → `specs/` · Known pitfalls → `insights.md`
