# Testing

```sh
npm ci
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

Vitest covers operations, graph/circuit constraints, complete/partial preview,
every reference solution, inventory, stars and local state. Testing Library
covers component behavior. Playwright builds a level through visible controls,
uses both pointer and touch wiring, checks failure explanations and persisted
progress, and checks page overflow at four required viewports.

CI repeats lint, unit/component tests, production build and Chromium E2E.
Use `npm run test:watch` when changing the engine. E2E failure traces are kept
under `test-results/`, excluded from Git. Never commit node_modules or dist.

## Verification record

Verified on 2026-09-29 using Node.js 24.19.0, npm 11.9.0 and Chromium
153.0.8010.0. Every listed passing check was executed on the final implementation.

| Check                      | Result                                             |
| -------------------------- | -------------------------------------------------- |
| ESLint                     | Passed, no errors or warnings                      |
| Prettier check             | Passed                                             |
| Vitest / Testing Library   | 54 passed across 6 files                           |
| Vite production build      | Passed                                             |
| Playwright desktop + touch | 27 passed, 1 intentionally skipped                 |
| 360×800                    | Five routes checked; no page overflow              |
| 768×1024                   | Five routes checked; no page overflow              |
| 1366×768                   | Five routes checked; no page overflow              |
| 1920×1080                  | Five routes checked; no page overflow              |
| Visual inspection          | Home, puzzle on desktop/mobile and gate collection |

The one skipped E2E case is native touch wiring under the desktop project; the
same case ran and passed in the touch project. E2E tests used the production
build and covered completion, every case, reload, inventory refunds, stale
result clearing, reset, locked routes, learning simulators, cyclic/self-link
rejection, pointer/touch dragging, organizing nodes and wire geometry after
switching between screen layouts. HTTP development without randomUUID was
also tested successfully.

Playwright's browser CDN returned HTML instead of a ZIP in this execution
environment. QA used a temporary Chromium executable extracted from the
`@sparticuz/chromium` npm package, supplied through
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. This package is not a project dependency.
Normal developer/CI setup uses `npx playwright install chromium`. The override
is optional and does not change normal Playwright installation behavior.

Automated touch emulation does not establish behavior on every physical phone.
Safari and Firefox should receive a physical-device pass before a graded
release. The table records local verification. GitHub runs the CI workflow on
pushes and pull requests; the latest remote result is available in
[Actions](https://github.com/OsvaldoVar/electric-cards/actions). Vercel deployment
has not been executed.
