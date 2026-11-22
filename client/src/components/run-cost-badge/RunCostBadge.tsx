/* RunCostBadge — M1 run cost badge, two variants:
   - "inline":  one run's cost + tokens, e.g. "9,119 tok · $0.0013" (timeline card,
                tokens="total") or "$0.014 · 8.2K→1.3K" (verdict banner, tokens="flow").
   - "compact": a PR's total over all runs + run count, e.g. "$0.014 (3)"; hover or
                keyboard focus opens a tooltip listing every run (PR list COST column).
   Unknown cost (null) always renders "—", never "$0.00". */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { PrCost } from "@devdigest/shared";
import { EMPTY, formatTokenFlow, formatTokensTotal, formatUsd } from "@/lib/format";
import { AnchoredPopover } from "@/components/anchored-popover";
import { s } from "./styles";

type InlineProps = {
  variant: "inline";
  usd: number | null | undefined;
  tokensIn: number | null | undefined;
  tokensOut: number | null | undefined;
  /** "total" → "9,119 tok · $0.0013"; "flow" → "$0.0013 · 8.2K→1.3K". */
  tokens?: "total" | "flow";
};

type CompactProps = {
  variant: "compact";
  cost: PrCost | null | undefined;
};

export type RunCostBadgeProps = InlineProps | CompactProps;

export function RunCostBadge(props: RunCostBadgeProps) {
  return props.variant === "inline" ? <InlineCost {...props} /> : <CompactCost {...props} />;
}

function InlineCost({ usd, tokensIn, tokensOut, tokens = "flow" }: InlineProps) {
  const t = useTranslations("prReview");
  const cost = formatUsd(usd);
  const unknownTitle = usd == null ? t("cost.unknown") : undefined;
  // Failed runs persist 0/0 tokens; "0 tok · —" is noise, show just "—".
  const noUsage = !tokensIn && !tokensOut;
  if (tokens === "total") {
    const tok = noUsage ? EMPTY : formatTokensTotal(tokensIn, tokensOut);
    return (
      <span className="mono" style={s.inline} data-testid="run-cost" title={unknownTitle}>
        {tok !== EMPTY && <>{tok} · </>}
        {cost}
      </span>
    );
  }
  const flow = noUsage ? EMPTY : formatTokenFlow(tokensIn, tokensOut);
  return (
    <span className="mono" style={s.inline} data-testid="run-cost" title={unknownTitle}>
      {cost}
      {flow !== EMPTY && <> · {flow}</>}
    </span>
  );
}

function CompactCost({ cost }: CompactProps) {
  const t = useTranslations("prReview");
  const [open, setOpen] = React.useState(false);
  const tipId = React.useId();
  const anchorRef = React.useRef<HTMLSpanElement>(null);

  if (!cost || cost.runs_count === 0) {
    return (
      <span className="mono" style={s.muted} data-testid="pr-cost">
        {EMPTY}
      </span>
    );
  }

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span
      ref={anchorRef}
      style={s.anchor}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
      tabIndex={0}
      aria-describedby={open ? tipId : undefined}
      data-testid="pr-cost"
    >
      <span className="mono" style={cost.total_usd == null ? s.muted : s.total}>
        {formatUsd(cost.total_usd)}
      </span>{" "}
      <span className="mono" style={s.count}>
        ({cost.runs_count})
      </span>
      {open && (
        <AnchoredPopover
          anchorRef={anchorRef}
          align="end"
          role="tooltip"
          id={tipId}
          style={s.tooltip}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={s.tipTitle}>{t("cost.tooltipTitle")}</span>
          {cost.runs.map((r) => (
            <span key={r.run_id} style={s.tipRow}>
              <span style={s.tipAgent}>
                {r.agent_name ?? t("cost.agentFallback")}
                {r.model && (
                  <span className="mono" style={s.tipModel}>
                    {" "}
                    {r.model}
                  </span>
                )}
              </span>
              <span style={s.tipTime}>{r.ran_at ? new Date(r.ran_at).toLocaleString() : ""}</span>
              <span
                className="mono"
                style={r.cost_usd == null ? s.tipCostUnknown : s.tipCost}
                title={r.cost_usd == null ? t("cost.unknown") : undefined}
              >
                {formatUsd(r.cost_usd)}
              </span>
            </span>
          ))}
          <span style={s.tipFooter}>
            <span>
              {t("cost.total")} · {t("cost.runsCount", { count: cost.runs_count })}
            </span>
            <span className="mono">{formatUsd(cost.total_usd)}</span>
          </span>
        </AnchoredPopover>
      )}
    </span>
  );
}
