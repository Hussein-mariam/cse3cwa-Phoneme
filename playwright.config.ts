import { defineConfig } from "@playwright/test";

// tests run against the app in docker, so start it first with docker compose up
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost",
    browserName: "chromium",
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
