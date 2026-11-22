/* FindingsCell — M1 FINDINGS column of the PR list.
   Cell: one SEV-colored icon + count per severity with findings (zero levels hidden).
   Hover or keyboard focus opens a popover «N findings» previewing the top findings
   (CRITICAL first) with «+K more». Basis: latest done run of each agent, summed
   server-side (server/src/modules/pulls/findings.ts). Never reviewed → «—». */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Icon, SEV, SeverityBadge } from "@devdigest/ui";
import type { PrFindings } from "@devdigest/shared";
import { EMPTY } from "@/lib/format";
import { SEVERITY_LEVELS } from "../../[number]/_components/FindingsPanel/helpers";
import { s } from "./styles";

export function FindingsCell({ findings }: { findings: PrFindings | null | undefined }) {
  const t = useTranslations("prReview.list.findings");
  const [open, setOpen] = React.useState(false);
  const tipId = React.useId();

  if (!findings) {
    return (
      <span className="mono" style={s.muted} data-testid="pr-findings">
        {EMPTY}
      </span>
    );
  }
  if (findings.total === 0) {
    return (
      <span className="mono" style={s.muted} data-testid="pr-findings" aria-label={t("title", { count: 0 })}>
        0
      </span>
    );
  }

  const { counts, preview, total } = findings;
  const more = total - preview.length;
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span
      style={s.anchor}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
      tabIndex={0}
      aria-label={t("aria", {
        count: total,
        critical: counts.CRITICAL,
        warning: counts.WARNING,
        suggestion: counts.SUGGESTION,
      })}
      aria-describedby={open ? tipId : undefined}
      data-testid="pr-findings"
    >
      {SEVERITY_LEVELS.filter((sev) => counts[sev] > 0).map((sev) => (
        <span key={sev} data-severity={sev}>
          <SeverityBadge severity={sev} compact count={counts[sev]} />
        </span>
      ))}
      {open && (
        <span role="tooltip" id={tipId} style={s.popover} onClick={(e) => e.stopPropagation()}>
          <span style={s.title}>
            <span>{t("title", { count: total })}</span>
            <span style={s.basis}>{t("basis")}</span>
          </span>
          {preview.map((f) => {
            const sev = SEV[f.severity];
            const SevIcon = Icon[sev.icon];
            return (
              <span key={f.id} style={s.item} data-testid="pr-findings-item">
                <span style={{ color: sev.c }} aria-label={f.severity}>
                  <SevIcon size={12.5} />
                </span>
                <span style={s.itemTitle}>{f.title}</span>
                <span className="mono" style={s.confidence} title={t("confidenceTitle")}>
                  {t("confidence", { value: Math.round(f.confidence * 100) })}
                </span>
                <span className="mono" style={s.location}>
                  {f.file}:{f.start_line}
                </span>
                {f.rationale && <span style={s.rationale}>{f.rationale}</span>}
              </span>
            );
          })}
          {more > 0 && <span style={s.more}>{t("more", { count: more })}</span>}
        </span>
      )}
    </span>
  );
}
