import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const outputDir = resolve(projectRoot, "public/screenshots");
const brandLogoUrl = pathToFileURL(resolve(projectRoot, "public", "logo.svg")).href;
const tmpDir = mkdtempSync(join(tmpdir(), "gymtrack-pwa-"));

const chromeBinary = [
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].find((candidate) => existsSync(candidate));

if (!chromeBinary) {
  throw new Error("No supported Chrome binary found. Expected google-chrome or chromium.");
}

mkdirSync(outputDir, { recursive: true });

const baseStyles = /* html */ `
  :root {
    color-scheme: dark;
    --app-bg: #050816;
    --app-glow-primary: rgba(56, 189, 248, 0.18);
    --app-glow-secondary: rgba(163, 230, 53, 0.1);
    --surface-panel: rgba(8, 15, 30, 0.82);
    --surface-row: rgba(15, 23, 42, 0.76);
    --surface-border: rgba(148, 163, 184, 0.16);
    --surface-border-strong: rgba(226, 232, 240, 0.18);
    --text-strong: #f8fafc;
    --text-soft: #cbd5e1;
    --text-muted: #94a3b8;
    --success: #22c55e;
    --accent: #7dd3fc;
    --accent-soft: rgba(125, 211, 252, 0.14);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: Inter, "Segoe UI", system-ui, sans-serif;
    background:
      radial-gradient(circle at top left, var(--app-glow-primary), transparent 28%),
      radial-gradient(circle at top right, var(--app-glow-secondary), transparent 22%),
      linear-gradient(180deg, #071120 0%, var(--app-bg) 100%);
    color: var(--text-strong);
  }

  .canvas {
    position: relative;
    width: 100vw;
    height: 100vh;
    padding: 34px;
  }

  .canvas::before,
  .canvas::after {
    content: "";
    position: absolute;
    inset: auto;
    border-radius: 999px;
    filter: blur(60px);
    opacity: 0.55;
    pointer-events: none;
  }

  .canvas::before {
    width: 320px;
    height: 320px;
    top: 0;
    right: 0;
    background: rgba(14, 165, 233, 0.18);
  }

  .canvas::after {
    width: 260px;
    height: 260px;
    left: 0;
    bottom: 0;
    background: rgba(34, 197, 94, 0.12);
  }

  .stage {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 42px;
    border: 1px solid var(--surface-border-strong);
    background:
      radial-gradient(circle at 14% 0%, rgba(56, 189, 248, 0.14), transparent 32%),
      linear-gradient(180deg, rgba(8, 15, 30, 0.96) 0%, rgba(5, 8, 22, 0.98) 100%);
    box-shadow:
      0 40px 120px rgba(2, 6, 23, 0.48),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .portrait-stage {
    display: flex;
    flex-direction: column;
    padding: 36px;
  }

  .wide-stage {
    padding: 30px;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    overflow: hidden;
    flex: none;
  }

  .brand-mark img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .hero {
    margin-top: 26px;
  }

  .eyebrow {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  h1 {
    margin: 16px 0 12px;
    font-size: 68px;
    line-height: 0.98;
    letter-spacing: -0.04em;
    font-weight: 700;
  }

  .desc {
    max-width: 820px;
    font-size: 28px;
    line-height: 1.45;
    color: var(--text-soft);
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 22px;
  }

  .chip {
    padding: 12px 18px;
    border-radius: 999px;
    border: 1px solid var(--surface-border);
    background: rgba(15, 23, 42, 0.72);
    color: var(--text-soft);
    font-size: 21px;
    line-height: 1;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 30px;
  }

  .grow {
    flex: 1;
    min-height: 0;
  }

  .panel,
  .day-card,
  .row-card,
  .metric,
  .log-row,
  .stat-card {
    border: 1px solid var(--surface-border);
    background: var(--surface-panel);
    box-shadow: 0 20px 60px rgba(3, 7, 18, 0.28);
  }

  .day-card,
  .panel {
    border-radius: 28px;
  }

  .row-card,
  .metric,
  .log-row,
  .stat-card,
  .subtle-card {
    border-radius: 22px;
    background: var(--surface-row);
    border: 1px solid var(--surface-border);
  }

  .day-card {
    padding: 24px;
  }

  .day-card-top,
  .exercise-head,
  .history-head,
  .banner-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .mini-label {
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--text-muted);
  }

  .day-title,
  .section-title,
  .exercise-title,
  .history-title {
    margin: 10px 0 0;
    font-size: 36px;
    font-weight: 650;
    letter-spacing: -0.03em;
  }

  .helper {
    margin: 8px 0 0;
    font-size: 22px;
    line-height: 1.4;
    color: var(--text-muted);
  }

  .icon-circle,
  .mini-icon,
  .action-pill,
  .state-pill,
  .complete-pill,
  .ghost-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--surface-border);
  }

  .icon-circle {
    width: 46px;
    height: 46px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-soft);
    font-size: 20px;
  }

  .metrics-grid,
  .stats-grid {
    display: grid;
    gap: 14px;
    margin-top: 18px;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric {
    padding: 16px 18px;
  }

  .metric-label,
  .stat-label {
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
  }

  .metric-value,
  .stat-value {
    margin-top: 10px;
    font-size: 30px;
    font-weight: 650;
  }

  .progress-wrap {
    margin-top: 18px;
  }

  .progress-track {
    height: 12px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.14);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #38bdf8 0%, #22c55e 100%);
  }

  .progress-label {
    margin-top: 12px;
    font-size: 18px;
    color: var(--text-soft);
  }

  .banner {
    margin-top: 22px;
    padding: 22px 24px;
    border-radius: 28px;
    border: 1px solid rgba(125, 211, 252, 0.18);
    background: linear-gradient(135deg, rgba(125, 211, 252, 0.12), rgba(34, 197, 94, 0.08));
    box-shadow: 0 20px 50px rgba(3, 7, 18, 0.22);
  }

  .banner-title {
    font-size: 28px;
    font-weight: 650;
    letter-spacing: -0.03em;
  }

  .banner-copy {
    margin-top: 8px;
    font-size: 20px;
    line-height: 1.45;
    color: var(--text-soft);
    max-width: 760px;
  }

  .banner-badge {
    padding: 12px 18px;
    border-radius: 999px;
    background: rgba(248, 250, 252, 0.08);
    color: #e2e8f0;
    font-size: 18px;
    line-height: 1;
  }

  .add-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    border-radius: 24px;
    border: 1px dashed rgba(148, 163, 184, 0.24);
    background: rgba(8, 15, 30, 0.66);
    margin-top: 22px;
  }

  .add-title {
    font-size: 26px;
    font-weight: 600;
  }

  .add-subtitle {
    font-size: 18px;
    color: var(--text-muted);
    margin-top: 6px;
  }

  .add-button,
  .cta-button {
    padding: 14px 18px;
    border-radius: 18px;
    background: rgba(248, 250, 252, 0.94);
    color: #020617;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .exercise-card {
    padding: 20px;
  }

  .exercise-title {
    font-size: 30px;
  }

  .exercise-meta {
    margin-top: 8px;
    font-size: 18px;
    color: var(--text-muted);
  }

  .exercise-actions {
    display: flex;
    gap: 10px;
  }

  .action-pill,
  .state-pill,
  .complete-pill,
  .ghost-pill {
    min-width: 42px;
    height: 42px;
    padding: 0 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-soft);
    font-size: 18px;
    line-height: 1;
  }

  .complete-pill {
    background: rgba(34, 197, 94, 0.18);
    border-color: rgba(34, 197, 94, 0.3);
    color: #dcfce7;
  }

  .set-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 18px;
  }

  .set-row {
    display: grid;
    grid-template-columns: 48px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 22px;
    border: 1px solid var(--surface-border);
    background: var(--surface-row);
  }

  .set-index {
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
    text-align: center;
  }

  .set-values {
    display: flex;
    gap: 10px;
    min-width: 0;
  }

  .field {
    min-width: 0;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(5, 8, 22, 0.44);
    color: var(--text-strong);
    font-size: 20px;
    font-weight: 600;
  }

  .field-subtle {
    color: var(--text-muted);
    font-weight: 500;
  }

  .row-actions {
    display: flex;
    gap: 8px;
  }

  .history-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }

  .stat-card {
    padding: 16px 18px;
  }

  .history-log-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 18px;
  }

  .log-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
  }

  .log-strong {
    font-size: 22px;
    font-weight: 650;
  }

  .log-soft,
  .log-time {
    font-size: 17px;
    color: var(--text-muted);
  }

  .desktop-grid {
    display: grid;
    grid-template-columns: 1.04fr 1fr 0.92fr;
    gap: 22px;
    height: calc(100% - 62px);
    margin-top: 22px;
  }

  .column {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .desktop-hero {
    padding: 24px;
  }

  .desktop-hero h1 {
    margin-top: 14px;
    font-size: 56px;
  }

  .desktop-hero .desc {
    font-size: 22px;
    max-width: 100%;
  }

  .desktop-hero .chip {
    font-size: 16px;
    padding: 10px 14px;
  }

  .desktop-days {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  .desktop-day {
    padding: 18px 20px;
  }

  .desktop-day .day-title {
    font-size: 28px;
  }

  .desktop-day .helper {
    font-size: 17px;
  }

  .desktop-day .metric-value,
  .desktop-day .progress-label {
    font-size: 18px;
  }

  .desktop-panel {
    padding: 22px;
  }

  .desktop-panel .section-title,
  .desktop-panel .history-title {
    font-size: 30px;
  }

  .desktop-panel .helper {
    font-size: 18px;
  }

  .desktop-panel .add-title {
    font-size: 22px;
  }

  .desktop-panel .add-subtitle {
    font-size: 16px;
  }

  .desktop-panel .add-button,
  .desktop-panel .cta-button {
    font-size: 16px;
    padding: 12px 16px;
    border-radius: 14px;
  }

  .desktop-panel .exercise-title {
    font-size: 24px;
  }

  .desktop-panel .exercise-meta,
  .desktop-panel .log-soft,
  .desktop-panel .log-time {
    font-size: 15px;
  }

  .desktop-panel .field,
  .desktop-panel .log-strong,
  .desktop-panel .stat-value {
    font-size: 18px;
  }

  .desktop-panel .set-index,
  .desktop-panel .metric-label,
  .desktop-panel .stat-label,
  .desktop-panel .mini-label {
    font-size: 13px;
  }

  .desktop-panel .metric-value {
    font-size: 24px;
  }
`;

function documentTemplate(bodyClass, bodyMarkup) {
  return /* html */ `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GymTrack PWA Screenshot</title>
    <style>${baseStyles}</style>
  </head>
  <body class="${bodyClass}">
    ${bodyMarkup}
  </body>
</html>`;
}

function dayCard({ day, helper, exercises, duration, progress, progressLabel, icon = "↗" }) {
  return /* html */ `
    <article class="day-card">
      <div class="day-card-top">
        <div>
          <div class="mini-label">Day plan</div>
          <h2 class="day-title">${day}</h2>
          <p class="helper">${helper}</p>
        </div>
        <div class="icon-circle">${icon}</div>
      </div>

      <div class="metrics-grid">
        <div class="metric">
          <div class="metric-label">Exercises</div>
          <div class="metric-value">${exercises}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Duration</div>
          <div class="metric-value">${duration}</div>
        </div>
      </div>

      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress};"></div>
        </div>
        <div class="progress-label">${progressLabel}</div>
      </div>
    </article>
  `;
}

function setRow(index, primary, secondary, completed = false) {
  return /* html */ `
    <div class="set-row">
      <div class="set-index">${String(index).padStart(2, "0")}</div>
      <div class="set-values">
        <div class="field">${primary}</div>
        <div class="field ${secondary.includes("Timed") ? "field-subtle" : ""}">${secondary}</div>
      </div>
      <div class="row-actions">
        <div class="${completed ? "complete-pill" : "state-pill"}">${completed ? "✓" : "○"}</div>
        <div class="ghost-pill">⋯</div>
      </div>
    </div>
  `;
}

function historyRow(primary, secondary, time) {
  return /* html */ `
    <div class="log-row">
      <div>
        <div class="log-strong">${primary}</div>
        <div class="log-soft">${secondary}</div>
      </div>
      <div class="log-time">${time}</div>
    </div>
  `;
}

const screenshots = [
  {
    fileName: "install-home-narrow.png",
    width: 1080,
    height: 1920,
    html: documentTemplate(
      "portrait",
      /* html */ `
        <div class="canvas">
          <main class="stage portrait-stage">
            <div class="topbar">
              <div class="brand-lockup">
                <div class="brand-mark"><img src="${brandLogoUrl}" alt="" /></div>
                <span>GymTrack</span>
              </div>
              <span>Mon 07:30</span>
            </div>

            <section class="hero">
              <div class="eyebrow">Gym Track</div>
              <h1>Weekly split</h1>
              <p class="desc">Choose a day, manage exercises, update planned sets, and keep each workout log in sync.</p>
              <div class="chip-row">
                <div class="chip">Offline first</div>
                <div class="chip">Workout logs</div>
                <div class="chip">Fast set tracking</div>
              </div>
            </section>

            <section class="stack grow">
              ${dayCard({
                day: "Monday",
                helper: "Chest, shoulders, and triceps focused push session.",
                exercises: "5",
                duration: "65m",
                progress: "72%",
                progressLabel: "13/18 sets complete",
              })}
              ${dayCard({
                day: "Tuesday",
                helper: "Pull work with rows, curls, and upper-back volume.",
                exercises: "4",
                duration: "52m",
                progress: "38%",
                progressLabel: "5/13 sets complete",
              })}
              ${dayCard({
                day: "Friday",
                helper: "Lower-body focus with squats, hinges, and calves.",
                exercises: "6",
                duration: "74m",
                progress: "88%",
                progressLabel: "21/24 sets complete",
              })}
            </section>

            <section class="banner">
              <div class="banner-row">
                <div>
                  <div class="banner-title">Track every session in one place</div>
                  <div class="banner-copy">Plan your split, log completed sets, and keep your gym routine available even when the connection is weak.</div>
                </div>
                <div class="banner-badge">Install-ready</div>
              </div>
            </section>
          </main>
        </div>
      `,
    ),
  },
  {
    fileName: "install-session-narrow.png",
    width: 1080,
    height: 1920,
    html: documentTemplate(
      "portrait",
      /* html */ `
        <div class="canvas">
          <main class="stage portrait-stage">
            <div class="topbar">
              <div class="brand-lockup">
                <div class="brand-mark"><img src="${brandLogoUrl}" alt="" /></div>
                <span>GymTrack</span>
              </div>
              <span>Mon 18:40</span>
            </div>

            <section class="hero">
              <div class="eyebrow">Workout day</div>
              <h1>Monday</h1>
              <p class="desc">4 exercises planned for this session. Add a movement, edit set targets, and mark each set complete as you train.</p>
            </section>

            <div class="add-bar">
              <div>
                <div class="add-title">Add exercise</div>
                <div class="add-subtitle">Build today&apos;s session in seconds.</div>
              </div>
              <div class="add-button">+ New</div>
            </div>

            <section class="stack grow">
              <article class="panel exercise-card">
                <div class="exercise-head">
                  <div>
                    <div class="mini-label">Strength block</div>
                    <h2 class="exercise-title">Bench Press</h2>
                    <div class="exercise-meta">Reps • kg • 4 planned sets</div>
                  </div>
                  <div class="exercise-actions">
                    <div class="action-pill">◷</div>
                    <div class="action-pill">⌄</div>
                  </div>
                </div>
                <div class="set-list">
                  ${setRow(1, "80 kg", "8 reps", true)}
                  ${setRow(2, "82.5 kg", "6 reps", true)}
                  ${setRow(3, "82.5 kg", "6 reps")}
                  ${setRow(4, "77.5 kg", "10 reps")}
                </div>
              </article>

              <article class="panel exercise-card">
                <div class="exercise-head">
                  <div>
                    <div class="mini-label">Accessory</div>
                    <h2 class="exercise-title">Incline Dumbbell Press</h2>
                    <div class="exercise-meta">Reps • kg • 3 planned sets</div>
                  </div>
                  <div class="exercise-actions">
                    <div class="action-pill">◎</div>
                    <div class="action-pill">⌃</div>
                  </div>
                </div>
                <div class="set-list">
                  ${setRow(1, "26 kg", "10 reps", true)}
                  ${setRow(2, "26 kg", "9 reps")}
                  ${setRow(3, "24 kg", "12 reps")}
                </div>
              </article>

              <article class="panel exercise-card">
                <div class="exercise-head">
                  <div>
                    <div class="mini-label">Core finisher</div>
                    <h2 class="exercise-title">Plank Hold</h2>
                    <div class="exercise-meta">Timed • sec • 2 planned sets</div>
                  </div>
                  <div class="exercise-actions">
                    <div class="action-pill">◷</div>
                    <div class="action-pill">⌄</div>
                  </div>
                </div>
              </article>
            </section>
          </main>
        </div>
      `,
    ),
  },
  {
    fileName: "install-overview-wide.png",
    width: 1600,
    height: 900,
    html: documentTemplate(
      "wide",
      /* html */ `
        <div class="canvas">
          <main class="stage wide-stage">
            <div class="topbar">
              <div class="brand-lockup">
                <div class="brand-mark"><img src="${brandLogoUrl}" alt="" /></div>
                <span>GymTrack</span>
              </div>
              <span>Desktop overview</span>
            </div>

            <section class="desktop-grid">
              <div class="column">
                <article class="panel desktop-hero">
                  <div class="eyebrow">Gym Track</div>
                  <h1>Plan, log, review.</h1>
                  <p class="desc">Keep your weekly split visible, update exercises fast, and review every completed set from the same app window.</p>
                  <div class="chip-row">
                    <div class="chip">Weekly split</div>
                    <div class="chip">Exercise history</div>
                    <div class="chip">Standalone PWA</div>
                  </div>
                </article>

                <div class="desktop-days grow">
                  <article class="day-card desktop-day">
                    <div class="day-card-top">
                      <div>
                        <div class="mini-label">Day plan</div>
                        <div class="day-title">Monday</div>
                        <p class="helper">Pressing session with 18 tracked sets.</p>
                      </div>
                      <div class="icon-circle">↗</div>
                    </div>
                    <div class="metrics-grid">
                      <div class="metric">
                        <div class="metric-label">Exercises</div>
                        <div class="metric-value">5</div>
                      </div>
                      <div class="metric">
                        <div class="metric-label">Duration</div>
                        <div class="metric-value">65m</div>
                      </div>
                    </div>
                    <div class="progress-wrap">
                      <div class="progress-track"><div class="progress-fill" style="width:72%"></div></div>
                      <div class="progress-label">13/18 sets complete</div>
                    </div>
                  </article>

                  <article class="day-card desktop-day">
                    <div class="day-card-top">
                      <div>
                        <div class="mini-label">Day plan</div>
                        <div class="day-title">Friday</div>
                        <p class="helper">Lower body volume with strong finish.</p>
                      </div>
                      <div class="icon-circle">↗</div>
                    </div>
                    <div class="metrics-grid">
                      <div class="metric">
                        <div class="metric-label">Exercises</div>
                        <div class="metric-value">6</div>
                      </div>
                      <div class="metric">
                        <div class="metric-label">Duration</div>
                        <div class="metric-value">74m</div>
                      </div>
                    </div>
                    <div class="progress-wrap">
                      <div class="progress-track"><div class="progress-fill" style="width:88%"></div></div>
                      <div class="progress-label">21/24 sets complete</div>
                    </div>
                  </article>
                </div>
              </div>

              <div class="column">
                <article class="panel desktop-panel grow">
                  <div class="exercise-head">
                    <div>
                      <div class="mini-label">Workout day</div>
                      <div class="section-title">Monday session</div>
                      <p class="helper">Edit planned sets, log each completion, and move through the session without leaving the page.</p>
                    </div>
                    <div class="cta-button">+ Add exercise</div>
                  </div>

                  <div class="stack" style="margin-top: 18px;">
                    <article class="panel exercise-card" style="padding: 18px;">
                      <div class="exercise-head">
                        <div>
                          <div class="mini-label">Strength block</div>
                          <div class="exercise-title">Bench Press</div>
                          <div class="exercise-meta">Reps • kg • 4 planned sets</div>
                        </div>
                        <div class="exercise-actions">
                          <div class="action-pill">◷</div>
                          <div class="action-pill">⌄</div>
                        </div>
                      </div>
                      <div class="set-list">
                        ${setRow(1, "80 kg", "8 reps", true)}
                        ${setRow(2, "82.5 kg", "6 reps", true)}
                        ${setRow(3, "82.5 kg", "6 reps")}
                      </div>
                    </article>

                    <article class="panel exercise-card" style="padding: 18px;">
                      <div class="exercise-head">
                        <div>
                          <div class="mini-label">Accessory</div>
                          <div class="exercise-title">Cable Fly</div>
                          <div class="exercise-meta">Reps • kg • 3 planned sets</div>
                        </div>
                        <div class="exercise-actions">
                          <div class="action-pill">◎</div>
                          <div class="action-pill">⌃</div>
                        </div>
                      </div>
                      <div class="set-list">
                        ${setRow(1, "17.5 kg", "12 reps", true)}
                        ${setRow(2, "17.5 kg", "12 reps")}
                        ${setRow(3, "15 kg", "15 reps")}
                      </div>
                    </article>
                  </div>
                </article>
              </div>

              <div class="column">
                <article class="panel desktop-panel grow">
                  <div class="history-head">
                    <div>
                      <div class="mini-label">Exercise history</div>
                      <div class="history-title">Bench Press</div>
                      <p class="helper">Review completed sets over time and compare them against planned work.</p>
                    </div>
                    <div class="banner-badge">History</div>
                  </div>

                  <div class="history-grid">
                    <div class="stat-card">
                      <div class="stat-label">Completed Sets</div>
                      <div class="stat-value">18</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-label">Planned Sets</div>
                      <div class="stat-value">4</div>
                    </div>
                  </div>

                  <div class="history-log-list">
                    ${historyRow("82.5 kg", "6 reps", "07:42 PM")}
                    ${historyRow("80 kg", "8 reps", "07:35 PM")}
                    ${historyRow("77.5 kg", "10 reps", "Last Friday")}
                    ${historyRow("75 kg", "10 reps", "Last Monday")}
                    ${historyRow("72.5 kg", "12 reps", "Previous week")}
                  </div>

                  <section class="banner" style="margin-top: auto; padding: 18px 20px;">
                    <div class="banner-title" style="font-size: 24px;">Built for standalone use</div>
                    <div class="banner-copy" style="font-size: 17px; max-width: none;">Install GymTrack for fast access, cleaner focus in the gym, and a richer app-like launch experience.</div>
                  </section>
                </article>
              </div>
            </section>
          </main>
        </div>
      `,
    ),
  },
];

try {
  for (const screenshot of screenshots) {
    const htmlPath = join(tmpDir, `${screenshot.fileName}.html`);
    const outputPath = join(outputDir, screenshot.fileName);

    writeFileSync(htmlPath, screenshot.html, "utf8");

    execFileSync(
      chromeBinary,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=1000",
        `--window-size=${screenshot.width},${screenshot.height}`,
        `--screenshot=${outputPath}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: "inherit" },
    );

    console.log(`Generated ${outputPath}`);
  }
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
