/* Guard: client code may import `@devdigest/shared` for types only.
   A value import bundles src/vendor/shared/index.ts, whose `./contracts/*.js`
   specifiers Next's webpack cannot resolve ("Module not found"). Vitest and tsc
   resolve them fine, so without this test the break only shows in the browser. */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(__dirname, "..");
const SKIP = new Set(["vendor", "node_modules"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

describe("@devdigest/shared imports", () => {
  it("are type-only outside vendor/", () => {
    const valueImport = /^\s*(import|export)\s+(?!type\b)[^;]*?from\s+["']@devdigest\/shared(\/[^"']*)?["']/ms;
    const offenders = walk(SRC).filter((file) =>
      readFileSync(file, "utf8")
        .split(/(?<=;)\s*\n/)
        .some((stmt) => valueImport.test(stmt)),
    );
    expect(offenders.map((f) => relative(SRC, f))).toEqual([]);
  });
});
