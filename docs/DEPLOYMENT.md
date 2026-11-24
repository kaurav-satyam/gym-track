# Deploying to Netlify

GymTrack is a static site: `yarn build` produces `dist/`, and there's no server or database to provision. Everything Netlify needs is in `netlify.toml`.

## One-time setup

1. Push the repo to GitHub, GitLab or Bitbucket.
2. In Netlify, choose **Add new site → Import an existing project** and pick the repo.
3. Leave the build settings empty. Netlify reads them from `netlify.toml`:

   | Setting | Value |
   | --- | --- |
   | Build command | `yarn test && yarn build` |
   | Publish directory | `dist` |
   | Node version | 22 (`[build.environment] NODE_VERSION`) |
   | Package manager | Yarn 1, detected from `yarn.lock` and `packageManager` in `package.json` |

4. Click **Deploy**. Every push to the production branch redeploys, and pull requests get Deploy Previews.

No environment variables are needed.

## What `netlify.toml` configures

| Section | Why |
| --- | --- |
| `[build]` | Runs the test suite first, so a failing test blocks the deploy. `yarn build` also type-checks (`tsc -b`). |
| SPA redirect `/* → /index.html (200)` | Deep links like `/days/Monday` load the app instead of a 404. Real files are served before the rewrite applies. |
| Security headers on `/*` | CSP (everything self-hosted), `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, and a permissions policy that disables camera, microphone and location. |
| `no-cache` on `index.html`, `sw.js`, `manifest.webmanifest` | Browsers always revalidate these, so a new deploy reaches users on their next load. |
| `immutable` on `/assets/*`, `/workbox-*.js` | These filenames are content-hashed, so they're cached for a year. |

If you add anything loaded from another origin (fonts, analytics, an API), extend the `Content-Security-Policy` header to allow it.

## How updates reach users

1. A deploy publishes new hashed assets and a new `sw.js`.
2. On the user's next visit, the browser fetches `sw.js` (it's `no-cache`) and sees a new precache list.
3. The service worker installs the new files in the background and activates (`registerType: "autoUpdate"`). The page then runs the new version.
4. User data in IndexedDB is untouched. Schema changes run as Dexie migrations (see [Architecture → How to](./ARCHITECTURE.md#how-to)).

## Deploying from your machine (optional)

```bash
npm i -g netlify-cli
netlify login
netlify link            # once, pick the site
yarn build
netlify deploy          # draft URL to check
netlify deploy --prod   # publish
```

## Checking a build locally

```bash
yarn build
yarn preview            # serves dist/ at http://localhost:4173
```

`vite preview` doesn't apply `netlify.toml` headers. To test the exact production behaviour (headers and redirects), use `netlify dev` or a Deploy Preview.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| A deep link shows Netlify's 404 page | The `[[redirects]]` block is missing or another redirect shadows it. |
| Users still see the old version | Check that `sw.js` and `index.html` are served with `Cache-Control: no-cache` (DevTools → Network). One reload after a deploy is normal for service workers. |
| Build fails with a Node version error | Vite 8 needs Node 20.19+ or 22.12+. Check `NODE_VERSION` in `netlify.toml`. |
| Something is blocked in the console with a CSP message | A new external resource needs to be allowed in the `Content-Security-Policy` header. |
| The exercise library is empty offline | `data/*.json` must stay in `includeAssets` in `vite.config.ts` so the service worker precaches it. |
