import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { TransiaWidget } from "../src/TransiaWidget";

beforeEach(() => cleanup());

describe("widget RTL (W-19)", () => {
  it("marks the trigger rtl when the active locale is RTL", () => {
    render(<TransiaWidget locales={["ar", "en"]} currentLocale="ar" onLocaleChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /switch language/i })).toHaveAttribute("dir", "rtl");
  });

  it("marks the trigger ltr when the active locale is LTR", () => {
    render(<TransiaWidget locales={["en", "ar"]} currentLocale="en" onLocaleChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /switch language/i })).toHaveAttribute("dir", "ltr");
  });

  it("mirrors the open panel's listbox to rtl for an RTL active locale", async () => {
    const user = userEvent.setup();
    render(<TransiaWidget locales={["ar", "en"]} currentLocale="ar" onLocaleChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /switch language/i }));
    expect(screen.getByRole("listbox")).toHaveAttribute("dir", "rtl");
  });

  it("keeps the open panel's listbox ltr for an LTR active locale", async () => {
    const user = userEvent.setup();
    render(<TransiaWidget locales={["en", "ar"]} currentLocale="en" onLocaleChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /switch language/i }));
    expect(screen.getByRole("listbox")).toHaveAttribute("dir", "ltr");
  });

  it("gives each option label its OWN direction in a mixed-script list", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TransiaWidget locales={["en", "ar", "he"]} currentLocale="en" onLocaleChange={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: /switch language/i }));
    expect(container.querySelector('span[lang="en"]')).toHaveAttribute("dir", "ltr");
    expect(container.querySelector('span[lang="ar"]')).toHaveAttribute("dir", "rtl");
    expect(container.querySelector('span[lang="he"]')).toHaveAttribute("dir", "rtl");
  });

  it("still selects a language when the widget is RTL (regression guard)", async () => {
    const user = userEvent.setup();
    const onLocaleChange = vi.fn();
    render(<TransiaWidget locales={["ar", "en"]} currentLocale="ar" onLocaleChange={onLocaleChange} />);
    await user.click(screen.getByRole("button", { name: /switch language/i }));
    const listbox = screen.getByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: /english/i }));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });
});
