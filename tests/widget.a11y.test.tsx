import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { TransiaWidget } from "../src/TransiaWidget";

beforeEach(() => cleanup());

function setup(onLocaleChange = vi.fn()) {
  const user = userEvent.setup();
  render(
    <TransiaWidget
      locales={["en", "es", "fr"]}
      currentLocale="en"
      onLocaleChange={onLocaleChange}
    />,
  );
  return { user, onLocaleChange };
}

describe("widget accessibility", () => {
  it("trigger exposes a listbox popup and the current language", () => {
    setup();
    const trigger = screen.getByRole("button", { name: /switch language \(current: English\)/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("type", "button");
  });

  it("opens on click and moves focus into the active option", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /switch language/i }));
    const listbox = screen.getByRole("listbox");
    const active = within(listbox).getByRole("option", { selected: true });
    expect(active).toHaveTextContent("English");
    expect(active).toHaveFocus();
  });

  it("ArrowDown MOVES focus (does not select); Enter selects the focused option", async () => {
    const onLocaleChange = vi.fn();
    const { user } = setup(onLocaleChange);
    await user.click(screen.getByRole("button", { name: /switch language/i }));
    await user.keyboard("{ArrowDown}");               // en -> es (focus only)
    expect(onLocaleChange).not.toHaveBeenCalled();     // W-01: arrow must NOT select
    const options = screen.getAllByRole("option");
    expect(options[1]).toHaveFocus();                  // Spanish focused
    await user.keyboard("{Enter}");                    // now select
    expect(onLocaleChange).toHaveBeenCalledWith("es");
  });

  it("Escape closes and returns focus to the trigger", async () => {
    const { user } = setup();
    const trigger = screen.getByRole("button", { name: /switch language/i });
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('the "Powered by" link is NOT inside the listbox (W-02)', async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /switch language/i }));
    const listbox = screen.getByRole("listbox");
    const link = screen.getByRole("link", { name: /powered by transia/i });
    expect(listbox.contains(link)).toBe(false);
  });

  it("renders en-US (regional variant) as English and still shows the widget (W-03/W-08)", async () => {
    render(<TransiaWidget locales={["en", "es"]} currentLocale="en-US" onLocaleChange={vi.fn()} />);
    const trigger = screen.getAllByRole("button", { name: /switch language \(current: English\)/i })[0];
    expect(trigger).toBeInTheDocument();
  });
});
