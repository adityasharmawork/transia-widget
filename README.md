# transia-widget

Floating language switcher widget for [Transia](https://transia.dev)-powered multilingual websites.

## Installation

```bash
npm install transia-widget
```

## Quick Start

The easiest way to add the widget is via the Transia CLI:

```bash
npm install -g transia
transia widget
```

This generates a ready-to-use `TransiaLanguageSwitcher` component and injects it into your layout automatically.

## Manual Usage

```tsx
import { TransiaWidget } from "transia-widget";

<TransiaWidget
  locales={["en", "es", "fr"]}
  currentLocale="en"
  onLocaleChange={(locale) => console.log(locale)}
/>
```

### Framework Helpers

**Next.js (next-intl):**

```tsx
import { TransiaWidget } from "transia-widget";
import { createNextIntlProps } from "transia-widget/next-intl";
```

**React (i18next):**

```tsx
import { TransiaWidget } from "transia-widget";
import { createI18nextProps } from "transia-widget/i18next";
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locales` | `string[]` | required | Available locale codes |
| `currentLocale` | `string?` | auto | Currently active locale |
| `onLocaleChange` | `(locale: string) => void` | required | Language change callback |
| `position` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `"bottom-right"` | Widget position |
| `theme` | `"auto" \| "light" \| "dark"` | `"auto"` | Color scheme |
| `showFlags` | `boolean` | `true` | Show flag emoji icons |
| `showBranding` | `boolean` | `true` | Show Powered by Transia footer |
| `projectId` | `string?` | - | Public key for analytics |

## Requirements

- React 18+
- React DOM 18+

## License

MIT
