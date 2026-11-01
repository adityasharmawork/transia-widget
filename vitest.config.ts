import { defineConfig } from "vitest/config";

// The source uses NodeNext-style ".js" import specifiers; this plugin lets
// vitest resolve them to the real ".ts"/".tsx" sources during tests.
const jsToTs = {
  name: "js-to-ts",
  enforce: "pre" as const,
  async resolveId(source: string, importer: string | undefined) {
    if (importer && source.startsWith(".") && source.endsWith(".js")) {
      const base = source.slice(0, -3);
      for (const ext of [".tsx", ".ts"]) {
        const r = await (this as any).resolve(base + ext, importer, { skipSelf: true });
        if (r) return r;
      }
    }
    return null;
  },
};

export default defineConfig({
  plugins: [jsToTs],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
