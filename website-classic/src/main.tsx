import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { initializeSettings } from "./lib/shared-settings";

// Render once settings load, or after 2.5s if the API is slow or unreachable.
void Promise.race([initializeSettings(), new Promise((r) => setTimeout(r, 2500))]).finally(() => {
  const root = document.getElementById("root");
  if (root) createRoot(root).render(<App />);
});
