import React, { useState, useEffect, useCallback, useRef } from "react";
import { FloatingButton } from "./components/FloatingButton.js";
import { LanguagePanel } from "./components/LanguagePanel.js";
import { trackEvent } from "./analytics.js";

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

const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

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
  // M4: Filter to valid locale entries
  const locales = rawLocales.filter(
    (l) => typeof l === "string" && LOCALE_RE.test(l)
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeLocale, setActiveLocale] = useState(() => {
    // M4: Ensure currentLocale is in the array
    if (currentLocale && locales.includes(currentLocale)) return currentLocale;
    return locales[0] ?? "en";
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const resolvedTheme = useResolvedTheme(theme);

  // Sync external locale changes
  useEffect(() => {
    if (currentLocale) {
      setActiveLocale(currentLocale);
    }
  }, [currentLocale]);

  // Track widget load
  useEffect(() => {
    if (projectId) {
      trackEvent(projectId, "widget.loaded", activeLocale);
    }
  }, [projectId]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    // Close on Escape
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (locale: string) => {
      setActiveLocale(locale);
      setIsOpen(false);
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
        />
      )}
    </div>
  );
}
