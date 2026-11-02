import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/frameworks/next-intl.ts",
    "src/frameworks/i18next.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  treeshake: true,
  // esbuild drops a bundled "use client" directive, so prepend it to the main
  // entry after build. Only index.* needs it (the widget is a Client Component);
  // the framework adapters stay universal so props can be built either side.
  async onSuccess() {
    const { readFileSync, writeFileSync, existsSync } = await import("node:fs");
    for (const f of ["dist/index.js", "dist/index.cjs"]) {
      if (!existsSync(f)) continue;
      const body = readFileSync(f, "utf8");
      if (!body.startsWith('"use client"')) {
        writeFileSync(f, '"use client";\n' + body);
      }
    }
  },
});
