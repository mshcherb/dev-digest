import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../../../../../../messages/en/prReview.json";
import { SeverityCounters } from "./SeverityCounters";

afterEach(cleanup);

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("SeverityCounters", () => {
  it("renders the three levels with labels from messages and reports clicks", () => {
    const onToggle = vi.fn();
    renderWithIntl(
      <SeverityCounters counts={{ CRITICAL: 3, WARNING: 0, SUGGESTION: 1 }} active="CRITICAL" onToggle={onToggle} />,
    );
    expect(screen.getByRole("button", { name: "3 CRITICAL" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "0 WARNING" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "1 SUGGESTION" }));
    expect(onToggle).toHaveBeenCalledWith("SUGGESTION");
  });
});
