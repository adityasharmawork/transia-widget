const DEFAULT_API_URL = "https://transia.dev";
const MAX_QUEUE_SIZE = 1000;

let eventQueue: Array<{
  projectId: string;
  eventType: string;
  locale: string;
  pageUrl: string;
}> = [];

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function getApiUrl(): string {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customUrl = (window as any).__TRANSIA_API_URL__ as string | undefined;
    // M3: Validate URL starts with https://
    if (customUrl && typeof customUrl === "string" && customUrl.startsWith("https://")) {
      return customUrl;
    }
  }
  return DEFAULT_API_URL;
}

async function flush(): Promise<void> {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = [];

  try {
    await fetch(`${getApiUrl()}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch {
    // Best effort — don't block the UI
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 2000);
}

// L4: Debounce duplicate language_selected events from rapid clicks
let lastLanguageEvent = { locale: "", timestamp: 0 };
const DEBOUNCE_MS = 500;

export function trackEvent(
  projectId: string,
  eventType: "widget.loaded" | "widget.language_selected",
  locale: string = "",
): void {
  // Debounce rapid language selection
  if (eventType === "widget.language_selected") {
    const now = Date.now();
    if (
      locale === lastLanguageEvent.locale &&
      now - lastLanguageEvent.timestamp < DEBOUNCE_MS
    ) {
      return;
    }
    lastLanguageEvent = { locale, timestamp: now };
  }

  // H6: Drop oldest events if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    eventQueue = eventQueue.slice(eventQueue.length - MAX_QUEUE_SIZE + 1);
  }

  eventQueue.push({
    projectId,
    eventType,
    locale,
    pageUrl: typeof window !== "undefined" ? window.location.pathname : "",
  });

  scheduleFlush();
}
