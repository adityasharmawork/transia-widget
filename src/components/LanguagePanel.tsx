import React, { useState, useCallback } from "react";
import { getLocaleInfo } from "../flags.js";

interface LanguagePanelProps {
  locales: string[];
  currentLocale: string;
  onSelect: (locale: string) => void;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme: "light" | "dark";
  showFlags: boolean;
  showBranding: boolean;
}

function LanguageOption({
  locale,
  isActive,
  isDark,
  showFlags,
  onSelect,
}: {
  locale: string;
  isActive: boolean;
  isDark: boolean;
  showFlags: boolean;
  onSelect: (locale: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { flag, name } = getLocaleInfo(locale);

  let bgColor = "transparent";
  if (isActive) {
    bgColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  } else if (isHovered) {
    bgColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
  }

  return (
    <button
      role="option"
      aria-selected={isActive}
      onClick={() => onSelect(locale)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        textAlign: "left",
        transition: "background-color 0.15s ease",
      }}
    >
      {showFlags && (
        <span style={{ fontSize: 18 }}>{flag}</span>
      )}
      <span
        style={{
          flex: 1,
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {name}
      </span>
      {isActive && (
        <span
          style={{
            fontSize: 12,
            color: isDark ? "#737373" : "#a3a3a3",
          }}
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
}: LanguagePanelProps) {
  const isDark = theme === "dark";
  const isTop = position.startsWith("top");
  const isLeft = position.endsWith("left");

  const panelPosition: React.CSSProperties = {
    position: "fixed",
    zIndex: 9998,
    ...(isTop ? { top: 76 } : { bottom: 76 }),
    ...(isLeft ? { left: 20 } : { right: 20 }),
  };

  // L1: Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = locales.indexOf(currentLocale);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = locales[(currentIndex + 1) % locales.length];
        onSelect(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = locales[(currentIndex - 1 + locales.length) % locales.length];
        onSelect(prev);
      }
    },
    [locales, currentLocale, onSelect],
  );

  return (
    <div
      role="listbox"
      aria-label="Select language"
      onKeyDown={handleKeyDown}
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
      <div
        style={{
          maxHeight: 280,
          overflowY: "auto",
          padding: "4px 0",
        }}
      >
        {locales.map((locale) => (
          <LanguageOption
            key={locale}
            locale={locale}
            isActive={locale === currentLocale}
            isDark={isDark}
            showFlags={showFlags}
            onSelect={onSelect}
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
              color: isDark ? "#525252" : "#a3a3a3",
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
