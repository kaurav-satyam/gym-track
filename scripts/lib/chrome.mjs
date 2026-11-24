import { existsSync } from "node:fs";

/**
 * Finds a Chrome/Chromium binary. Set CHROME_PATH to override.
 */
export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));

  if (!found) {
    throw new Error("Chrome not found. Install Google Chrome or set CHROME_PATH.");
  }

  return found;
}
