// i18next integration helper
//
// Usage in an app with react-i18next:
//
// import { TransiaWidget } from "transia-widget";
// import { createI18nextProps } from "transia-widget/i18next";
// import { useTranslation } from "react-i18next";
//
// function LanguageSwitcher() {
//   const { i18n } = useTranslation();
//   const widgetProps = createI18nextProps({
//     locales: ["en", "es", "fr"],
//     currentLanguage: i18n.language,
//     changeLanguage: (lng) => i18n.changeLanguage(lng),
//     projectId: "trn_pub_xxxxxxxx", // the project's public key
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
