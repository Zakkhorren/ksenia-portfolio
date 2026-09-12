import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173/ksenia-portfolio/",
    headless: true,
    channel: process.platform === "win32" ? "msedge" : undefined,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun run preview --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/ksenia-portfolio/",
    env: { BASE_PATH: "/ksenia-portfolio" },
    reuseExistingServer: false,
  },
});
