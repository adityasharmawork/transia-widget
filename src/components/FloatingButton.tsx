import React, { useState } from "react";
import { getLocaleInfo } from "../flags.js";

interface FloatingButtonProps {
  currentLocale: string;
  isOpen: boolean;
  onClick: () => void;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme: "light" | "dark";
  /** id of the listbox this button controls (aria-controls) */
  controlsId: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

const positionStyles: Record<string, React.CSSProperties> = {
  "bottom-right": { bottom: 20, right: 20 },
  "bottom-left": { bottom: 20, left: 20 },
  "top-right": { top: 20, right: 20 },
  "top-left": { top: 20, left: 20 },
};

export function FloatingButton({
  currentLocale,
  isOpen,
  onClick,
  position,
  theme,
  controlsId,
  buttonRef,
}: FloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { flag, name } = getLocaleInfo(currentLocale);
  const isDark = theme === "dark";

  const transform = isHovered ? "scale(1.05)" : isOpen ? "scale(0.95)" : "scale(1)";
  const boxShadow = isHovered
    ? "0 6px 20px rgba(0,0,0,0.2)"
    : "0 4px 12px rgba(0,0,0,0.15)";

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={onClick}
      aria-label={`Switch language (current: ${name})`}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={isOpen ? controlsId : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "fixed",
        zIndex: 9999,
        ...positionStyles[position],
        width: 48,
        height: 48,
        borderRadius: 24,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
        backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
        boxShadow,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform,
      }}
    >
      <span aria-hidden="true">{flag}</span>
    </button>
  );
}
