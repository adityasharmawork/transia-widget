// i18next integration helper
//
// Usage in an app with react-i18next:
//
// import { TransiaWidget } from "@transia/widget";
// import { useTransiaI18next } from "@transia/widget/i18next";
//
// function App() {
//   const widgetProps = useTransiaI18next({
//     locales: ["en", "es", "fr"],
//     projectId: "trn_proj_xxx",
//   });
//   return <TransiaWidget {...widgetProps} />;
// }

import type { TransiaWidgetProps } from "../TransiaWidget.js";

interface I18nextConfig {
  locales: string[];
  projectId?: string;
  position?: TransiaWidgetProps["position"];
  theme?: TransiaWidgetProps["theme"];
  showFlags?: boolean;
  showBranding?: boolean;
}

/**
 * Creates TransiaWidget props that integrate with i18next.
 *
 * Requires the caller to pass the current language and changeLanguage function:
 * - `i18n.language` for the current language
 * - `i18n.changeLanguage` for switching languages
 */
export function createI18nextProps(
  config: I18nextConfig & {
    currentLanguage: string;
    changeLanguage: (lng: string) => void | Promise<void>;
  }
): TransiaWidgetProps {
  return {
    locales: config.locales,
    currentLocale: config.currentLanguage,
    onLocaleChange: (locale: string) => {
      config.changeLanguage(locale);
    },
    position: config.position,
    theme: config.theme,
    showFlags: config.showFlags,
    showBranding: config.showBranding,
    projectId: config.projectId,
  };
}
