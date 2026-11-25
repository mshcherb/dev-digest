/**
 * Number formatters shared across routes (M1 run cost badge).
 * `null`/`undefined` always render as "—": an unknown cost is never "$0.00".
 */

export const EMPTY = "—";

/** USD with precision that keeps tiny LLM costs readable:
 *  < $0.01 → 4 decimals ($0.0013), < $1 → 3 ($0.014), otherwise 2 ($1.20). */
export function formatUsd(usd: number | null | undefined): string {
  if (usd == null || !Number.isFinite(usd)) return EMPTY;
  const abs = Math.abs(usd);
  const digits = abs === 0 ? 2 : abs < 0.01 ? 4 : abs < 1 ? 3 : 2;
  return `$${usd.toFixed(digits)}`;
}

/** Compact token count: 950, 8.2K, 12K, 1.2M. */
export function formatTokensCompact(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return EMPTY;
  const compact = (v: number, unit: string) => {
    const s = Math.abs(v) < 10 ? v.toFixed(1) : v.toFixed(0);
    return `${s.replace(/\.0$/, "")}${unit}`;
  };
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return compact(n / 1_000_000, "M");
  if (abs >= 1_000) return compact(n / 1_000, "K");
  return String(Math.round(n));
}

/** Token flow in→out, e.g. "8.2K→1.3K". */
export function formatTokenFlow(
  tokensIn: number | null | undefined,
  tokensOut: number | null | undefined,
): string {
  if (tokensIn == null || tokensOut == null) return EMPTY;
  return `${formatTokensCompact(tokensIn)}→${formatTokensCompact(tokensOut)}`;
}

/** Full token total with thousands separators, e.g. "9,119 tok". */
export function formatTokensTotal(
  tokensIn: number | null | undefined,
  tokensOut: number | null | undefined,
): string {
  if (tokensIn == null && tokensOut == null) return EMPTY;
  return `${((tokensIn ?? 0) + (tokensOut ?? 0)).toLocaleString("en-US")} tok`;
}
