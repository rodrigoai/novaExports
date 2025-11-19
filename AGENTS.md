# Repository Guidelines

## Project Structure & Module Organization
- `index.js` boots the Express server, wires `dotenv`, and exposes `/api/orders`.
- `utils/api.js` encapsulates Nova Pay API calls (order pagination, checkout page mapping) while `utils/helpers.js` sanitizes payloads for the front end.
- Static assets live in `public/` (`input.css` → Tailwind source, `styles.css` → compiled CSS) and the payload/checkout fixtures live at `payload_example.json` and `checkout_pages_payload_example.json`.
- Keep supported documentation near the root (`Gemini.md`) so contributors can reference onboarding notes alongside the runnable code.

## Build, Test, and Development Commands
- `npm run tailwind:css`: compiles `public/input.css` into `public/styles.css` using Tailwind; required before serving the UI or running `npm run dev`.
- `npm run dev`: runs `tailwind:css` once and starts `nodemon index.js`; use this for local development so changes refresh automatically.
- `npm start`: fires up the production server (`node index.js`) after assets are ready; suitable for deployment previews or simple smoke checks.

## Coding Style & Naming Conventions
- Source files use ES modules (`import`/`export`) and prefer concise helper modules (`utils/*`). Keep indentation at two spaces and terminate statements consistently (semi-colons are present in current files).
- Strings default to single quotes (`'`) except where template literals are required for interpolation; keep object keys camelCased (e.g., `fetchAndProcessOrders`, `checkout_page_id` when reflecting API payloads).
- Lawn out new helpers in `utils/` so the server entry point stays thin; add targeted comments when logic deviates from standard Express handlers.

## Testing Guidelines
- There are no automated test suites yet; validate changes by running `npm run dev` and hitting `http://localhost:3000/api/orders?status=paid`.
- When adding tests in the future, keep fixtures under `payload_example*.json` and name them by behavior (e.g., `orders.pagination.json`).
- Capture HTTP responses in the browser console or via cURL to document regressions before merging.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) with a short scope when practical (e.g., `fix(api): guard missing NOVA_TOKEN`); this keeps the small repo history readable.
- Include a brief PR description referencing the feature or bug, list related issues if applicable, and note any manual verification steps (e.g., `npm run dev` + API smoke test).
- Attach screenshots or sample payload excerpts when UI or API output changes, and add `.env` reminder for reviewers needing Nova credentials.

## Environment & Security Tips
- Populate `.env` with `NOVA_TOKEN`/`NOVA_TENANT` before running the server and never commit that file.
- Existing log statements surface fetch failures; leave them in place so reviewers can trace API errors during manual checks.

## Vercel Deployment Configuration
- `vercel.json` routes every request to `index.js`, letting Express serve `/api` and the `public/` assets together through the Node Serverless entry point.
- Before a deploy, use `vercel env add NOVA_TOKEN production` (repeat for `preview` if you want staging data) and `vercel env add NOVA_TENANT production` so the CLI injects the secrets in Vercel’s dashboard; this keeps sensitive values out of the repo.
- Trigger your preview deploy via `vercel --confirm` and promote it with `vercel --prod`; if anything fails, inspect the CLI logs for the serverless function errors and adjust `index.js` output or the `public` assets accordingly.
- Populate `.env` with `NOVA_TOKEN`/`NOVA_TENANT` before running the server and never commit that file.
- Existing log statements surface fetch failures; leave them in place so reviewers can trace API errors during manual checks.
