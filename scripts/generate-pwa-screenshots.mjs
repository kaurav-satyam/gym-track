/**
 * Captures the PWA install / README screenshots from the real app.
 *
 *   yarn pwa:screenshots
 *
 * Starts the Vite dev server, opens it in headless Chrome with a fresh
 * profile, seeds a realistic demo week through the app's own repositories,
 * pins the clock to a fixed date (so output is reproducible) and writes PNGs
 * to public/screenshots/. Requires Chrome (or CHROME_PATH).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { createServer } from "vite";
import { findChrome } from "./lib/chrome.mjs";

const OUTPUT_DIR = resolve(process.cwd(), "public/screenshots");
const DEBUG_PORT = 9341;
// Thursday 19 Nov 2026, 18:40 local: mid-workout on leg day.
const FIXED_NOW = new Date(2026, 10, 19, 18, 40).getTime();

const SHOTS = [
  { file: "today-narrow.png", path: "/days/Thursday", viewport: "narrow" },
  { file: "progress-narrow.png", path: "/progress", viewport: "narrow" },
  { file: "exercise-narrow.png", path: "/exercises/:squat", viewport: "narrow" },
  { file: "today-wide.png", path: "/days/Thursday", viewport: "wide" },
];

const VIEWPORTS = {
  // 360x640 CSS px at 3x = 1080x1920 PNG.
  narrow: { width: 360, height: 640, deviceScaleFactor: 3, mobile: true },
  wide: { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false },
};

const server = await createServer({ logLevel: "error", server: { port: 5299, strictPort: true } });
await server.listen();
const baseUrl = "http://localhost:5299";
const profileDir = mkdtempSync(join(tmpdir(), "gymtrack-shots-"));
const chrome = spawn(
  findChrome(),
  ["--headless=new", `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profileDir}`, "about:blank"],
  { stdio: "ignore" },
);

try {
  const cdp = await connect();

  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "dark" }],
  });
  await cdp.send("Page.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: fixedClockScript(FIXED_NOW) });

  await cdp.navigate(`${baseUrl}/settings`);
  const ids = await cdp.evaluate(`(${seedDemoData.toString()})()`);

  for (const shot of SHOTS) {
    await cdp.send("Emulation.setDeviceMetricsOverride", VIEWPORTS[shot.viewport]);
    await cdp.navigate(baseUrl + shot.path.replace(":squat", String(ids.squat)));
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });

    writeFileSync(join(OUTPUT_DIR, shot.file), Buffer.from(data, "base64"));
    console.log(`Wrote public/screenshots/${shot.file}`);
  }

  cdp.close();
} finally {
  chrome.kill();
  await server.close();
  rmSync(profileDir, { recursive: true, force: true });
}

/** Minimal Chrome DevTools Protocol client over the page's WebSocket. */
async function connect() {
  let target;

  for (let attempt = 0; attempt < 50 && !target; attempt += 1) {
    await sleep(200);
    try {
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
      target = targets.find((candidate) => candidate.type === "page");
    } catch {
      // Chrome is still starting.
    }
  }

  if (!target) {
    throw new Error("Could not connect to headless Chrome.");
  }

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen) => (socket.onopen = resolveOpen));
  const pending = new Map();
  let nextId = 0;

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    pending.get(message.id)?.(message);
  };

  const send = (method, params = {}) =>
    new Promise((resolveSend, rejectSend) => {
      nextId += 1;
      pending.set(nextId, (message) =>
        message.error ? rejectSend(new Error(message.error.message)) : resolveSend(message.result),
      );
      socket.send(JSON.stringify({ id: nextId, method, params }));
    });

  return {
    send,
    close: () => socket.close(),
    async navigate(url) {
      await send("Page.navigate", { url });
      // Lazy route chunks + live queries settle well within this.
      await sleep(2000);
    },
    async evaluate(expression) {
      const { result, exceptionDetails } = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });

      if (exceptionDetails) {
        throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      }

      return result.value;
    },
  };
}

/** Makes `new Date()` / `Date.now()` start at `fixedNow` (and keep ticking). */
function fixedClockScript(fixedNow) {
  // Returns real Date instances (not a subclass) so IndexedDB and Dexie treat
  // them as dates.
  return `(() => {
    const RealDate = Date;
    const offset = ${fixedNow} - RealDate.now();
    function FixedDate(...args) {
      if (!new.target) return new RealDate(RealDate.now() + offset).toString();
      return args.length === 0 ? new RealDate(RealDate.now() + offset) : new RealDate(...args);
    }
    FixedDate.prototype = RealDate.prototype;
    // Libraries (e.g. Dexie's clone) recognise dates via \`constructor === Date\`.
    RealDate.prototype.constructor = FixedDate;
    FixedDate.now = () => RealDate.now() + offset;
    FixedDate.parse = RealDate.parse;
    FixedDate.UTC = RealDate.UTC;
    globalThis.Date = FixedDate;
  })();`;
}

/**
 * Runs inside the page (dev server), so it can import the app's modules.
 * Builds a 4-day split with three weeks of history and today half done.
 */
async function seedDemoData() {
  const { createExerciseTemplate } = await import("/src/data/repositories/exercise.repository.ts");
  const { logExerciseSetCompletion } = await import("/src/data/repositories/workout-log.repository.ts");
  const { WEEKDAYS } = await import("/src/domain/weekdays.ts");

  const plan = {
    Monday: [
      ["Barbell Bench Press", ["Chest", "Triceps", "Front Delts"], 70, 8],
      ["Incline Dumbbell Press", ["Upper Chest", "Front Delts"], 26, 10],
      ["Overhead Press", ["Front Delts", "Side Delts", "Triceps"], 45, 8],
      ["Tricep Pushdown", ["Triceps"], 30, 12],
    ],
    Tuesday: [
      ["Barbell Row", ["Upper Back", "Lats", "Rear Delts"], 65, 8],
      ["Lat Pulldown", ["Lats", "Biceps"], 60, 10],
      ["Barbell Curl", ["Biceps", "Forearms"], 30, 10],
    ],
    Thursday: [
      ["Barbell Squat", ["Quads", "Glutes"], 100, 5],
      ["Romanian Deadlift", ["Hamstrings", "Glutes", "Lower Back"], 90, 8],
      ["Walking Lunge", ["Quads", "Glutes"], 20, 12],
      ["Standing Calf Raise", ["Calves"], 60, 15],
    ],
    Saturday: [
      ["Weighted Pull-Up", ["Lats", "Biceps"], 10, 6],
      ["Dumbbell Shoulder Press", ["Front Delts", "Side Delts"], 22, 10],
      ["Cable Crunch", ["Abs"], 40, 12],
    ],
  };
  const today = new Date();
  const ids = {};

  for (const [day, exercises] of Object.entries(plan)) {
    for (const [title, muscleTags, weight, reps] of exercises) {
      const sets = [0, 1, 2].map(() => ({ id: crypto.randomUUID(), weight: weight || undefined, reps }));
      const id = await createExerciseTemplate({
        day,
        title,
        exerciseType: "reps",
        exerciseUnit: "kg",
        muscleTags,
        exerciseSets: sets,
      });

      if (title === "Barbell Squat") {
        ids.squat = id;
      }

      // Three previous weeks, getting a little heavier each week.
      for (let weeksAgo = 3; weeksAgo >= 0; weeksAgo -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + WEEKDAYS.indexOf(day) - weeksAgo * 7);
        date.setHours(18, 0, 0, 0);

        if (date > today) {
          continue;
        }

        const isToday = date.toDateString() === today.toDateString();
        // Today: first exercise done, second one started.
        const setsToLog = !isToday ? 3 : title === "Barbell Squat" ? 3 : title === "Romanian Deadlift" ? 1 : 0;
        const bump = weight ? (3 - weeksAgo) * 2.5 : 0;

        for (let index = 0; index < setsToLog; index += 1) {
          const completedAt = new Date(date.getTime() + index * 3 * 60_000);
          await logExerciseSetCompletion(
            id,
            { ...sets[index], weight: weight ? weight - 7.5 + bump : undefined },
            completedAt,
          );
        }
      }
    }
  }

  return ids;
}
