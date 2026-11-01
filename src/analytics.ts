const DEFAULT_API_URL = "https://transia.dev";
const MAX_QUEUE_SIZE = 500;
const BATCH_SIZE = 50; // the server accepts at most 50 events per request

interface WidgetEvent {
  projectId: string;
  eventType: string;
  locale: string;
  pageUrl: string;
}

let eventQueue: WidgetEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let unloadBound = false;
// De-duplicate "widget.loaded" per project for this page load. React StrictMode
// mounts effects twice in development, and the widget may remount; without this
// a single page view reported 2+ loads.
const loadedOnce = new Set<string>();

function getApiUrl(): string {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customUrl = (window as any).__TRANSIA_API_URL__ as string | undefined;
    if (customUrl && typeof customUrl === "string" && customUrl.startsWith("https://")) {
      return customUrl;
    }
  }
  return DEFAULT_API_URL;
}

function send(events: WidgetEvent[]): void {
  if (events.length === 0) return;
  const url = `${getApiUrl()}/api/analytics/event`;
  const body = JSON.stringify({ events });
  // Prefer sendBeacon: it survives page unload and, as a text/plain Blob, is a
  // CORS-simple request (no preflight). The server parses the JSON body
  // regardless of content-type.
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      if (navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }))) return;
    } catch {
      // fall through to fetch
    }
  }
  if (typeof fetch === "function") {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Best effort — never block the UI.
    });
  }
}

function flush(): void {
  // Send in server-sized chunks so nothing is silently dropped server-side.
  while (eventQueue.length > 0) {
    send(eventQueue.splice(0, BATCH_SIZE));
  }
}

function bindUnloadFlush(): void {
  if (unloadBound || typeof window === "undefined") return;
  unloadBound = true;
  const onHide = () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    flush();
  };
  // pagehide covers tab close / bfcache; visibilitychange covers mobile
  // backgrounding, where timers may never fire.
  window.addEventListener("pagehide", onHide);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHide();
  });
}

function scheduleFlush(): void {
  bindUnloadFlush();
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 2000);
}

// Debounce duplicate language_selected events from rapid clicks.
let lastLanguageEvent = { locale: "", timestamp: 0 };
const DEBOUNCE_MS = 500;

export function trackEvent(
  projectId: string,
  eventType: "widget.loaded" | "widget.language_selected",
  locale: string = "",
): void {
  if (eventType === "widget.loaded") {
    if (loadedOnce.has(projectId)) return;
    loadedOnce.add(projectId);
  }

  if (eventType === "widget.language_selected") {
    const now = Date.now();
    if (locale === lastLanguageEvent.locale && now - lastLanguageEvent.timestamp < DEBOUNCE_MS) {
      return;
    }
    lastLanguageEvent = { locale, timestamp: now };
  }

  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    eventQueue = eventQueue.slice(eventQueue.length - MAX_QUEUE_SIZE + 1);
  }

  eventQueue.push({
    projectId,
    eventType,
    locale,
    // Path only — never the query string or hash (which can carry tokens/PII).
    pageUrl: typeof window !== "undefined" ? window.location.pathname : "",
  });

  scheduleFlush();
}
