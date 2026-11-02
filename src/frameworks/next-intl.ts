// next-intl integration helper
//
// Usage in a Next.js (App Router) client component:
//
// "use client";
// import { TransiaWidget } from "transia-widget";
// import { createNextIntlProps } from "transia-widget/next-intl";
// import { useLocale } from "next-intl";
// import { useRouter, usePathname } from "@/i18n/routing";
//
// function LanguageSwitcher() {
//   const locale = useLocale();
//   const router = useRouter();
//   const pathname = usePathname();
//   const widgetProps = createNextIntlProps({
//     locales: ["en", "es", "fr"],
//     currentLocale: locale,
//     onLocaleChange: (next) => router.replace(pathname, { locale: next }),
//     projectId: "trn_pub_xxxxxxxx", // the project's public key
//   });
//   return <TransiaWidget {...widgetProps} />;
// }

import type { TransiaWidgetProps } from "../TransiaWidget.js";

interface NextIntlConfig {
  locales: string[];
  projectId?: string;
  position?: TransiaWidgetProps["position"];
  theme?: TransiaWidgetProps["theme"];
  showFlags?: boolean;
  showBranding?: boolean;
}

/**
 * Creates TransiaWidget props that integrate with next-intl.
 * Must be called within a next-intl provider context.
 *
 * Requires the caller to pass the current locale and router from next-intl:
 * - `useLocale()` for the current locale
 * - `useRouter()` and `usePathname()` for navigation
 */
export function createNextIntlProps(
  config: NextIntlConfig & {
    currentLocale: string;
    onLocaleChange: (locale: string) => void;
  }
): TransiaWidgetProps {
  return {
    locales: config.locales,
    currentLocale: config.currentLocale,
    onLocaleChange: config.onLocaleChange,
    position: config.position,
    theme: config.theme,
    showFlags: config.showFlags,
    showBranding: config.showBranding,
    projectId: config.projectId,
  };
}
