# Tech Guardians — development guidance

Read `README.md` for local setup and deployment. This repository contains editable React/Vite source, static HTML pages in `public/`, local content JSON, and a PHP API in `public/api/` (no database; JSON files in `public/api/data/`).

Follow the project-specific rules in `AGENTS.md`. Keep publicly editable settings in the admin-protected PHP settings API; do not store payment records in publicly readable settings. Initialize settings before mounting React and poll every 15 seconds for cross-browser updates on static hosting.

The frontend calls the API through `src/lib/api.ts`. Do not put secrets in frontend code. Admin credentials are in `public/api/config.php` (bcrypt hash only). Static course pages are served from `public/courses/`, and their shared contact/price script is `public/js/tg-contact.js`.

Install with `npm ci`, run `php -S localhost:8000 -t public` and `npm run dev`, and use `npm run test` for tests. `npm run build` produces `dist/`; upload its **contents** including `.htaccess` to a PHP host, keeping the existing `api/data/` folder on redeploys.