import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import type { Plugin, ResolvedConfig } from "vite";
import { componentTagger } from "lovable-tagger";

// Copies index.html into /login, /manage and /admin so the admin pages open
// even when the host ignores the .htaccess single-page-app rule.
const adminEntryPages = (): Plugin => {
  let config: ResolvedConfig;
  return {
    name: "tg-admin-entry-pages",
    apply: "build",
    configResolved(c) { config = c; },
    closeBundle() {
      if (config.base !== "/") return;
      const out = path.resolve(config.root, config.build.outDir);
      const html = fs.readFileSync(path.join(out, "index.html"));
      for (const dir of ["login", "manage", "admin"]) {
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
  plugins: [react(), adminEntryPages(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
