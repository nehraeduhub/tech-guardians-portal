# Tech Guardians — Complete Website Package

A complete, production-ready React + Vite + TypeScript + Tailwind CSS website for **Tech Guardians**, including the main web app, portal pages, standalone landing pages, and all source assets.

This ZIP is the **editable source**, not an installed dependency folder or a pre-built Hostinger upload. It includes the app, served static pages and assets, content data, the PHP API (`public/api/`), dependency lockfiles, and configuration. It does not include saved settings from a live server (`api/data/`) or any private third-party credentials.

---

## What's Included

- **React 18 SPA** — full TypeScript source code (`src/`)
- **Static HTML pages** — course pages, booking pages, forensic engine (`public/`)
- **Public assets** — images, PDFs, videos, JSON content, logos, icons
- **PHP API** — admin login, shared site settings and news feeds (`public/api/`), no database needed
- **Config files** — Vite, Tailwind, TypeScript, ESLint, PostCSS, Vitest
- **Development notes** — `AGENTS.md`, `CLAUDE.md`, `.env.example` and npm lockfile
- **Build scripts** — ready to run locally and deploy

---

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 + shadcn/ui components
- **Animations:** Framer Motion
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Backend:** PHP 8 (`public/api/`), data stored as JSON files — no database
- **Package Manager:** npm (also works with Bun)

---

## Open in VS Code — Local Setup

Open this folder in VS Code or Claude Code. For project-specific development notes, read `AGENTS.md` and `CLAUDE.md`.

### 1. Extract the ZIP

Extract `tech-guardians-source.zip` to a folder, e.g.:

```bash
# Windows (PowerShell)
Expand-Archive -Path tech-guardians-source.zip -DestinationPath C:\projects\tech-guardians

# macOS / Linux
unzip tech-guardians-source.zip -d tech-guardians
```

### 2. Open in VS Code

```bash
code tech-guardians
```

Or open the folder via **File → Open Folder** in VS Code.

### 3. Install Dependencies

No `.env` is needed. The site talks to the PHP API at `/api` on the same domain. To use the API locally, start PHP in a second terminal (`npm run dev` forwards `/api` to it):

```bash
php -S localhost:8000 -t public
```

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 4. Run the Development Server

```bash
npm run dev
```

The site will be available at:

```
http://localhost:8080
```

Vite will automatically reload the browser when you edit any file.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start local development at `localhost:8080` |
| Build | `npm run build` | Create production build in `dist/` |
| Preview | `npm run preview` | Preview the production build locally |
| Test | `npm run test` | Run Vitest tests |
| Lint | `npm run lint` | Run ESLint |

---

## Key Folders & Files

```
/                         # Project root
├── public/               # Static assets served as-is
│   ├── courses/          # Course landing & payment pages
│   ├── forensic-engine.html   # Cyber & Forensic Intelligence Hub
│   ├── content/          # JSON data (courses, blogs, PDFs, media)
│   ├── pdfs/             # PDF library files
│   └── js/               # Shared scripts for standalone pages
├── src/                  # React application source
│   ├── components/       # React components (sections, UI, cards)
│   ├── pages/          # Route pages (Home, About, Threat Intel, etc.)
│   ├── lib/            # Utilities, navigation, site content
│   ├── hooks/          # Custom React hooks
│   └── assets/         # Image assets imported by components
├── public/api/           # PHP API: auth, settings, news (data/ holds JSON files)
├── .env.example          # Optional VITE_API_BASE override
├── CLAUDE.md             # Development guide for Claude Code
├── package-lock.json     # npm dependency versions
├── bun.lock              # Bun dependency versions
├── index.html            # Main HTML entry point
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind theme configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies & scripts
```

---

## How to Edit the Website

### Edit homepage sections

Open `src/pages/Index.tsx` and edit the imported components:

- `HeroSection.tsx` — hero text and typing animation
- `CoursesSection.tsx` — course cards
- `NewsEventsSection.tsx` — news and events
- `AwarenessSection.tsx` — awareness CTA
- `EnrollFormSection.tsx` — enrollment form

### Edit colors / theme

Open `src/index.css` and update the CSS variables in the `:root` block, or edit `tailwind.config.ts` for Tailwind theme tokens.

### Edit navigation / footer

- `src/lib/site-nav.ts` — navigation links
- `src/components/Navbar.tsx` — header navigation
- `src/components/Footer.tsx` — footer links and social links

### Edit standalone pages

- `public/forensic-engine.html` — Cyber & Forensic Intelligence Hub
- `public/courses/awareness-booking.html` — Awareness booking & payment
- `public/courses/payment.html` — Course payment page

### Edit portal pages (React routes)

- `src/pages/ThreatIntel.tsx` — Threat Intelligence Portal (`/threat-intel`)
- `src/pages/CyberNewsPortal.tsx` — Cyber News Portal (`/cyber-news`)
- `src/pages/About.tsx` — About Us page (`/about`)

### Add new routes

1. Create a new component in `src/pages/`.
2. Import it in `src/App.tsx`.
3. Add a `<Route path="/your-path" element={<YourPage />} />` inside the `<Routes>` block.

---

## Build for Production

```bash
npm run build
```

This creates a `dist/` folder with all static files ready for hosting.

### Hostinger Deployment (Shared Hosting)

1. Run `npm run build` to generate the `dist/` folder.
2. Upload the **contents** of `dist/` to your Hostinger public_html folder using:
   - File Manager (upload & extract)
   - FTP / SFTP client
   - Git deployment
3. Include the provided `public/.htaccess` (Vite copies it to `dist/`) in the upload. It contains the rewrite rule for client-side routes:

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

4. Make sure `api/data/` and `uploads/` are writable by PHP (755 or 775 on Hostinger is normal). Settings, enrollments, the admin password and the news cache are saved in `api/data/`; images the admin uploads go to `uploads/`.
5. Visit your domain. All routes should now work. Sign in at `/login` with the admin username and password, then change the password under **Manage → Admin Password**.

When you upload a new build later, **do not delete or overwrite `api/data/` or `uploads/`**. They hold your saved settings, enrollments, admin password and uploaded images.

### Admin controls

After signing in at `/login`:

- **Manage → Sections & Pages** — show, hide and reorder all 29 homepage sections (plus your custom ones), and switch whole pages off. A hidden page leaves the menus and shows "not found".
- **Manage → Custom Sections** — add, edit, delete, reorder and show/hide your own homepage sections (title, text, image, button).
- **Manage → PDF Library / Media Gallery / YouTube Videos**, plus Events, Courses, Blogs, Trainings At, Organization Services — add, edit, delete and show/hide items.
- **Manage → Homepage Text** — hero headline, text and photo, top bar and footer text.
- **Edit website visually** (button in Manage, or the **Edit this page** button on any page while signed in) — click any text, button, link, image or section on any page, including the static course pages, to change it, hide it, unhide it or reset it. Menu, header and footer edits apply on every page.

Visual edits are stored in the `tg_overrides` setting; everything else in its own setting key in `api/data/settings.json`.

### How live updates work

Everything the admin changes on the Manage page (WhatsApp number, events, courses, blogs and blog photos, trainers, services, featured video, menu visibility) is saved on the server right away. Every open page checks for changes every 15 seconds and updates itself without a reload, including the static course pages. New enrollments from the payment page appear in **Manage → Payment History** within 15 seconds.

---

## Backend Notes

- The backend is a small PHP API in `public/api/` (copied to `dist/api/` on build). There is no database: data is kept in JSON files in `api/data/`, which `.htaccess` blocks from the web.
  - `auth.php` — admin sign-in with a PHP session, sign-out, and password change. Five failed logins from one IP lock it out for 15 minutes.
  - `settings.php` — public site settings (WhatsApp number, events, courses, blogs, ...). Anyone can read them; only a signed-in admin can save.
  - `news.php?feed=global|india` — cyber news and threat intel from public RSS feeds and NVD, cached for 5 minutes.
  - `payments.php` — the payment page saves each enrollment and screenshot here. Only a signed-in admin can read them (Manage → Payment History, or the history button on the payment page). Limited to 10 submissions per hour per IP.
  - `upload.php` — admin-only image upload; files are saved in `/uploads/`, which never runs scripts.
- The admin username and the default password hash are in `public/api/config.php`. A password changed from the Manage page is saved in `api/data/admin.json` and replaces the default. If you forget it, delete `api/data/admin.json` to go back to the password in `config.php`, or put a new hash there (`php -r 'echo password_hash("NewPassword", PASSWORD_DEFAULT);'`).
- Requires PHP 8 with the `curl` extension (standard on Hostinger).
- Admin edits are polled every 15 seconds by open pages; static course pages read the same settings. Payment records are never stored in public settings; they live in `api/data/payments.json`, readable only by the admin.
- The existing payment-sheet URL is in `src/lib/site-settings.ts`; access to that external sheet depends on its separate Google Apps Script permissions and availability.

---

## Need Help?

- Open the project in VS Code.
- Run `npm install` then `npm run dev`.
- Edit files in `src/components/` and `src/pages/` to see changes live.

---

© 2026 Tech Guardians. All rights reserved.
