# Roadmap

## Implemented in 0.1.0

- React/Vite app, five routes and lazy loading.
- Seven-gate engine with DAG and port validation.
- 25 declarative puzzles and independent reference constructions.
- React Flow editor with finite inventory and mouse/touch movement.
- Drag, tap and selector wiring; visible deletion/disconnection actions.
- Exhaustive validation, per-case preview, hints, reset and star budgets.
- Versioned local progression and drafts with storage-failure recovery.
- Seven learning cards with SVG characters, symbols and interactive tables.
- Four responsive viewport checks, unit/component tests and Chromium E2E.
- CI workflow and Vercel SPA config.

## Repository and deployment

The verified source, tests, screenshots and documentation are stored in the
private [OsvaldoVar/electric-cards](https://github.com/OsvaldoVar/electric-cards)
repository on `main`. GitHub Actions verifies pushes and pull requests; see
[Actions](https://github.com/OsvaldoVar/electric-cards/actions) for the current
run status. Vercel deployment has not been requested or executed. Follow
[DEPLOYMENT.md](DEPLOYMENT.md) when a hosted release is needed.

## Next iteration

1. Physical Safari/iOS and Firefox checks, including zoom/drag and storage.
2. Optional guided first-puzzle tutorial and richer character illustrations.
3. Export/import local progress with the same version/validation rules.
4. Data-only level authoring and additional reference circuit fixtures.
5. Optional installable PWA after agreeing offline-update behavior.

Keep all future work within Boolean educational puzzles unless the project
scope is explicitly changed. Do not add accounts or a database for these tasks.
