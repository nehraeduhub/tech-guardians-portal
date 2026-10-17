import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import type { Plugin, ResolvedConfig } from "vite";
import { componentTagger } from "lovable-tagger";

// Copies index.html into a folder for every page (and every PDF book), so
// links like /pdf-store or /manage open even when the host ignores the
// .htaccess single-page-app rule.
const SPA_PAGES = [
  "login", "manage", "admin", "about", "rj-nehra", "training", "products", "events", "blog", "tg-blogs",
  "cyber-crime-support", "pdf-store", "cyber-portal", "threat-intel", "cyber-news", "terms",
  "security-assessment", "cyber-range", "account", "my-account",
];
const spaEntryPages = (): Plugin => {
  let config: ResolvedConfig;
  return {
    name: "tg-spa-entry-pages",
    apply: "build",
    configResolved(c) { config = c; },
    closeBundle() {
      if (config.base !== "/") return;
      const out = path.resolve(config.root, config.build.outDir);
      const html = fs.readFileSync(path.join(out, "index.html"));
      const pages = [...SPA_PAGES];
      try {
        const books = JSON.parse(fs.readFileSync(path.join(config.root, "public/api/store-books.json"), "utf8"));
        for (const b of books) if (/^[a-z0-9-]+$/.test(b.id)) pages.push(`pdf-store/${b.id}`);
      } catch { /* no book list */ }
      for (const dir of pages) {
        fs.mkdirSync(path.join(out, dir), { recursive: true });
        fs.writeFileSync(path.join(out, dir, "index.html"), html);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Run `php -S localhost:8000 -t public` alongside `npm run dev`.
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  plugins: [react(), spaEntryPages(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
