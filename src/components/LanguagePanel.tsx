import React, { useRef, useEffect, useCallback } from "react";
import { getLocaleInfo } from "../flags.js";

interface LanguagePanelProps {
  locales: string[];
  currentLocale: string;
  onSelect: (locale: string) => void;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme: "light" | "dark";
  showFlags: boolean;
  showBranding: boolean;
  /** id referenced by the trigger's aria-controls */
  listboxId: string;
}

function LanguageOption({
  locale,
  isActive,
  isFocused,
  isDark,
  showFlags,
  onSelect,
  optionRef,
}: {
  locale: string;
  isActive: boolean;
  isFocused: boolean;
  isDark: boolean;
  showFlags: boolean;
  onSelect: (locale: string) => void;
  optionRef: (el: HTMLButtonElement | null) => void;
}) {
  const { flag, name } = getLocaleInfo(locale);

  const bgColor = isActive
    ? isDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.06)"
    : "transparent";

  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      // Roving tabindex: only the focused option is in the Tab order.
      tabIndex={isFocused ? 0 : -1}
      ref={optionRef}
      onClick={() => onSelect(locale)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 16px",
        border: "none",
        backgroundColor: bgColor,
        cursor: "pointer",
        fontSize: 14,
        color: isDark ? "#e5e5e5" : "#171717",
        textAlign: "start",
        transition: "background-color 0.15s ease",
      }}
    >
      {showFlags && (
        <span aria-hidden="true" style={{ fontSize: 18 }}>
          {flag}
        </span>
      )}
      <span lang={locale} style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>
        {name}
      </span>
      {isActive && (
        <span
          aria-hidden="true"
          style={{ fontSize: 12, color: isDark ? "#d4d4d4" : "#404040" }}
        >
          &#10003;
        </span>
      )}
    </button>
  );
}

export function LanguagePanel({
  locales,
  currentLocale,
  onSelect,
  position,
  theme,
  showFlags,
  showBranding,
  listboxId,
}: LanguagePanelProps) {
  const isDark = theme === "dark";
  const isTop = position.startsWith("top");
  const isLeft = position.endsWith("left");

  const optionEls = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, locales.indexOf(currentLocale));
  const [focusIndex, setFocusIndex] = React.useState(activeIndex);

  // Move DOM focus to the virtually-focused option (on open and on arrow nav).
  useEffect(() => {
    optionEls.current[focusIndex]?.focus();
  }, [focusIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const n = locales.length;
      if (n === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((i) => (i + 1) % n);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => (i - 1 + n) % n);
          break;
        case "Home":
          e.preventDefault();
          setFocusIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusIndex(n - 1);
          break;
        // Enter/Space are handled natively by the focused <button> (onClick).
      }
    },
    [locales.length],
  );

  const panelPosition: React.CSSProperties = {
    position: "fixed",
    zIndex: 9998,
    ...(isTop ? { top: 76 } : { bottom: 76 }),
    ...(isLeft ? { left: 20 } : { right: 20 }),
  };

  return (
    <div
      style={{
        ...panelPosition,
        width: 200,
        borderRadius: 12,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
        backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Only options live inside role="listbox" (branding is a sibling). */}
      <div
        id={listboxId}
        role="listbox"
        aria-label="Select language"
        onKeyDown={handleKeyDown}
        style={{
          maxHeight: "min(280px, calc(100vh - 120px))",
          overflowY: "auto",
          padding: "4px 0",
        }}
      >
        {locales.map((locale, i) => (
          <LanguageOption
            key={locale}
            locale={locale}
            isActive={locale === currentLocale}
            isFocused={i === focusIndex}
            isDark={isDark}
            showFlags={showFlags}
            onSelect={onSelect}
            optionRef={(el) => {
              optionEls.current[i] = el;
            }}
          />
        ))}
      </div>

      {showBranding && (
        <div
          style={{
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
            padding: "8px 16px",
            textAlign: "center",
          }}
        >
          <a
            href="https://transia.dev"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: isDark ? "#b5b5b5" : "#525252",
              textDecoration: "none",
              fontFamily: "monospace",
            }}
          >
            Powered by Transia
          </a>
        </div>
      )}
    </div>
  );
}
