import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const publicDir = resolve(projectRoot, "public");
const logoPath = resolve(publicDir, "logo.svg");
const tmpDir = mkdtempSync(join(tmpdir(), "gymtrack-icons-"));

const chromeBinary = [
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].find((candidate) => existsSync(candidate));

if (!existsSync(logoPath)) {
  throw new Error(`Logo source not found at ${logoPath}`);
}

if (!chromeBinary) {
  throw new Error("No supported Chrome binary found. Expected google-chrome or chromium.");
}

const logoUrl = pathToFileURL(logoPath).href;

const icons = [
  {
    fileName: "favicon.png",
    size: 64,
    inset: 0.86,
  },
  {
    fileName: "apple-touch-icon.png",
    size: 180,
    inset: 0.86,
  },
  {
    fileName: "icon-192.png",
    size: 192,
    inset: 0.82,
  },
  {
    fileName: "icon-512.png",
    size: 512,
    inset: 0.82,
  },
];

const htmlForIcon = (inset) => /* html */ `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root {
        color-scheme: dark;
        --icon-bg: #050816;
        --icon-size: ${Math.round(inset * 100)}%;
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
        background: var(--icon-bg);
      }

      body {
        display: grid;
        place-items: center;
      }

      .frame {
        width: var(--icon-size);
        height: var(--icon-size);
      }

      .frame img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <img src="${logoUrl}" alt="" />
    </div>
  </body>
</html>
`;

try {
  for (const icon of icons) {
    const htmlPath = join(tmpDir, `${icon.fileName}.html`);
    const outputPath = join(publicDir, icon.fileName);

    writeFileSync(htmlPath, htmlForIcon(icon.inset), "utf8");

    execFileSync(
      chromeBinary,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=1000",
        `--window-size=${icon.size},${icon.size}`,
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
