/* FindingsPanel — severity counters/filter + hide-low-confidence + j/k navigation
   + FindingCard list, wiring the accept/dismiss action hook (A2). */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Toggle, EmptyState } from "@devdigest/ui";
import type { FindingRecord, Severity } from "@devdigest/shared";
import { FindingCard } from "../FindingCard";
import { SeverityCounters } from "../SeverityCounters";
import { useFindingAction } from "../../../../../../../lib/hooks/reviews";
import { KEY_TO_ACTION } from "./constants";
import { countBySeverity, filterBySeverity, visibleFindings } from "./helpers";
import { s } from "./styles";

export function FindingsPanel({
  findings,
  prId,
  repoFullName,
  headSha,
}: {
  findings: FindingRecord[];
  prId: string;
  repoFullName?: string | null;
  headSha?: string | null;
}) {
  const t = useTranslations("prReview");
  const action = useFindingAction();
  const [hideLow, setHideLow] = React.useState(false);
  const [severity, setSeverity] = React.useState<Severity | null>(null);
  const [focusIdx, setFocusIdx] = React.useState(0);

  // Counters reflect the list after "Hide low confidence" (before the severity
  // filter), so a level's number equals the cards shown when it is clicked.
  const base = React.useMemo(() => visibleFindings(findings, hideLow), [findings, hideLow]);
  const counts = React.useMemo(() => countBySeverity(base), [base]);
  const shown = React.useMemo(() => filterBySeverity(base, severity), [base, severity]);

  const toggleSeverity = React.useCallback((sev: Severity) => {
    setSeverity((cur) => (cur === sev ? null : sev));
    setFocusIdx(0);
  }, []);

  const toggleHideLow = React.useCallback((v: boolean) => {
    setHideLow(v);
    setFocusIdx(0);
  }, []);

  // Keep keyboard focus inside the (possibly shorter) list.
  React.useEffect(() => {
    setFocusIdx((i) => Math.min(i, Math.max(0, shown.length - 1)));
  }, [shown.length]);

  // j/k navigation + a/d shortcuts on the focused finding (keyboard).
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "j") setFocusIdx((i) => Math.max(0, Math.min(i + 1, shown.length - 1)));
      else if (e.key === "k") setFocusIdx((i) => Math.max(i - 1, 0));
      else if (KEY_TO_ACTION[e.key] && shown[focusIdx]) {
        action.mutate({ findingId: shown[focusIdx]!.id, action: KEY_TO_ACTION[e.key]!, prId });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shown, focusIdx, action, prId]);

  return (
    <div>
      <div style={s.toolbar}>
        <SeverityCounters counts={counts} active={severity} onToggle={toggleSeverity} />
        <div style={s.toggleGroup}>
          {t("panel.hideLowConfidence")}
          <Toggle on={hideLow} onChange={toggleHideLow} size={16} />
        </div>
      </div>

      {/* Remount the cards on any filter change so the first one opens again. */}
      <div key={`${severity ?? "all"}:${hideLow}`} style={s.list}>
        {shown.length === 0 ? (
          <EmptyState icon="Filter" title={t("panel.noMatchTitle")} body={t("panel.noMatchBody")} />
        ) : (
          shown.map((f, i) => (
            <FindingCard
              key={f.id}
              f={f}
              focused={i === focusIdx}
              defaultExpanded={i === 0}
              pending={action.isPending}
              repoFullName={repoFullName}
              headSha={headSha}
              onAction={(act) => action.mutate({ findingId: f.id, action: act, prId })}
            />
          ))
        )}
      </div>
    </div>
  );
}
