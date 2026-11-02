import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

async function load() { vi.resetModules(); return await import("../src/analytics"); }

let bodies: string[];
beforeEach(() => {
  bodies = [];
  vi.useFakeTimers();
  // Force the fetch path (deterministic, synchronous body) by disabling sendBeacon.
  (navigator as any).sendBeacon = undefined;
  (globalThis as any).fetch = vi.fn((_url: string, init: any) => {
    bodies.push(init.body as string);
    return Promise.resolve({ ok: true } as Response);
  });
});
afterEach(() => { vi.useRealTimers(); });

describe("trackEvent / analytics", () => {
  it("sends widget.loaded only once per project (StrictMode/remount safe)", async () => {
    const { trackEvent } = await load();
    trackEvent("trn_pub_a", "widget.loaded", "en");
    trackEvent("trn_pub_a", "widget.loaded", "en");
    vi.advanceTimersByTime(2000);
    expect(bodies).toHaveLength(1);
    const payload = JSON.parse(bodies[0]);
    expect(payload.events).toHaveLength(1);
    expect(payload.events[0].eventType).toBe("widget.loaded");
    expect(payload.events[0].pageUrl).not.toContain("?"); // path only, no query
  });

  it("flushes queued events on pagehide", async () => {
    const { trackEvent } = await load();
    trackEvent("trn_pub_b", "widget.language_selected", "es");
    expect(bodies).toHaveLength(0);                 // timer still pending
    window.dispatchEvent(new Event("pagehide"));    // user navigates away
    expect(bodies).toHaveLength(1);
    expect(JSON.parse(bodies[0]).events[0].locale).toBe("es");
  });

  it("batches into chunks of at most 50", async () => {
    const { trackEvent } = await load();
    for (let i = 0; i < 120; i++) trackEvent("trn_pub_c", "widget.language_selected", "l" + i);
    vi.advanceTimersByTime(2000);
    expect(bodies.length).toBe(3); // 50 + 50 + 20
    expect(JSON.parse(bodies[0]).events.length).toBe(50);
    expect(JSON.parse(bodies[2]).events.length).toBe(20);
  });
});
