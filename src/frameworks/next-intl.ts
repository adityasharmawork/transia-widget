// next-intl integration helper
//
// Usage in a Next.js app with next-intl:
//
// import { TransiaWidget } from "@transia/widget";
// import { useTransiaNextIntl } from "@transia/widget/next-intl";
//
// function Layout({ children }) {
//   const widgetProps = useTransiaNextIntl({
//     locales: ["en", "es", "fr"],
//     projectId: "trn_proj_xxx",
//   });
//   return (
//     <>
//       {children}
//       <TransiaWidget {...widgetProps} />
//     </>
//   );
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
