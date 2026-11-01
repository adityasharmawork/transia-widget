import "@testing-library/jest-dom/vitest";

// jsdom does not implement matchMedia; the widget uses it for theme="auto".
if (typeof window !== "undefined" && !window.matchMedia) {
  // @ts-expect-error minimal stub for tests
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
