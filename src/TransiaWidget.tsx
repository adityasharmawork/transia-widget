import React, { useState, useEffect, useCallback, useRef, useMemo, useId } from "react";
import { FloatingButton } from "./components/FloatingButton.js";
import { LanguagePanel } from "./components/LanguagePanel.js";
import { trackEvent } from "./analytics.js";
import { sanitizeLocales, resolveActiveLocale } from "./locale.js";

export interface TransiaWidgetProps {
  locales: string[];
  currentLocale?: string;
  onLocaleChange: (locale: string) => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "auto" | "light" | "dark";
  showFlags?: boolean;
  showBranding?: boolean;
  projectId?: string;
}

function useResolvedTheme(theme: "auto" | "light" | "dark"): "light" | "dark" {
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme !== "auto") {
      setResolved(theme);
      return;
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setResolved(mq.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) =>
      setResolved(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return resolved;
}

export function TransiaWidget({
  locales: rawLocales,
  currentLocale,
  onLocaleChange,
  position = "bottom-right",
  theme = "auto",
  showFlags = true,
  showBranding = true,
  projectId,
}: TransiaWidgetProps) {
  // Keep only valid, de-duplicated BCP-47 tags (memoized so it's a stable dep).
  const locales = useMemo(
    () => sanitizeLocales(rawLocales),
    [rawLocales.join("\u0000")],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeLocale, setActiveLocale] = useState(
    () => resolveActiveLocale(locales, currentLocale) ?? "en",
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const resolvedTheme = useResolvedTheme(theme);

  // Sync external locale changes — resolve against the known list so a regional
  // variant (e.g. "en-US" when the list has "en") or an unknown tag never
  // selects a nonexistent option.
  useEffect(() => {
    const next = resolveActiveLocale(locales, currentLocale);
    if (next) setActiveLocale(next);
  }, [currentLocale, locales]);

  // Track widget load
  useEffect(() => {
    if (projectId) {
      trackEvent(projectId, "widget.loaded", activeLocale);
    }
  }, [projectId]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    // pointerdown covers mouse + touch (mousedown missed touch taps).
    function handleClick(e: Event) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    // Close on Escape and return focus to the trigger (WAI-ARIA listbox pattern).
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (locale: string) => {
      setActiveLocale(locale);
      setIsOpen(false);
      triggerRef.current?.focus(); // return focus to the trigger after choosing
      onLocaleChange(locale);

      if (projectId) {
        trackEvent(projectId, "widget.language_selected", locale);
      }
    },
    [onLocaleChange, projectId]
  );

  if (locales.length < 2) return null;

  return (
    <div ref={panelRef}>
      <FloatingButton
        currentLocale={activeLocale}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        position={position}
        theme={resolvedTheme}
        controlsId={listboxId}
        buttonRef={triggerRef}
      />

      {isOpen && (
        <LanguagePanel
          locales={locales}
          currentLocale={activeLocale}
          onSelect={handleSelect}
          position={position}
          theme={resolvedTheme}
          showFlags={showFlags}
          showBranding={showBranding}
          listboxId={listboxId}
        />
      )}
    </div>
  );
}
