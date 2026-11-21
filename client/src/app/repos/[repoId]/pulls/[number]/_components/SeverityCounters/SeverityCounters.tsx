/* SeverityCounters — «N CRITICAL · N WARNING · N SUGGESTION» for one review run.
   Each level is a toggle: clicking it filters the run's FindingsPanel to that
   level, clicking the active one clears the filter. Colors/icons come from
   SEV via SeverityBadge; labels come from messages (prReview.panel.severity). */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SEV, SeverityBadge } from "@devdigest/ui";
import type { Severity } from "@devdigest/shared";
import { SEVERITY_LEVELS } from "../FindingsPanel/helpers";
import { s } from "./styles";

export function SeverityCounters({
  counts,
  active,
  onToggle,
}: {
  counts: Record<Severity, number>;
  /** The level the list is filtered to, or null when no severity filter is on. */
  active: Severity | null;
  onToggle: (severity: Severity) => void;
}) {
  const t = useTranslations("prReview");
  return (
    <div role="group" aria-label={t("panel.severityFilterAria")} style={s.group}>
      {SEVERITY_LEVELS.map((sev, i) => {
        const isActive = active === sev;
        const dimmed = active != null && !isActive;
        return (
          <React.Fragment key={sev}>
            {i > 0 && (
              <span aria-hidden="true" style={s.separator}>
                ·
              </span>
            )}
            <button
              type="button"
              aria-pressed={isActive}
              data-severity={sev}
              onClick={() => onToggle(sev)}
              style={{
                ...s.button,
                borderColor: isActive ? SEV[sev].c : "transparent",
                color: isActive ? SEV[sev].c : s.button.color,
                opacity: dimmed ? 0.5 : 1,
              }}
            >
              <SeverityBadge severity={sev} compact count={counts[sev]} />
              {/* whitespace-only flex item is not rendered; it keeps the a11y name "2 CRITICAL" */}
              {" "}
              {t(`panel.severity.${sev}`)}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
