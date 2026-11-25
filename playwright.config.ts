import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: "browser.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5174",
    viewport: { width: 1100, height: 850 },
    video: "on",
    launchOptions: {
      slowMo: process.env.DEMO ? 250 : 0,
      executablePath: process.env.CHROMIUM_PATH,
    },
  },
  webServer: [
    {
      command: "node node_modules/tsx/dist/cli.mjs server/index.ts",
      url: "http://127.0.0.1:3001/api/books",
      reuseExistingServer: false,
    },
    {
      command:
        "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort",
      url: "http://127.0.0.1:5174",
      reuseExistingServer: false,
    },
  ],
});
