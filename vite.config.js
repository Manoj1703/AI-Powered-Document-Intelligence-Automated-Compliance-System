import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(repoRoot, "docuagent-frontend"),
  server: {
    port: 5173,
    watch: {
      ignored: [
        "**/docuagent-backend/**",
        "**/.venv/**",
        "**/.venv*/**",
        "**/.tmp/**",
        "**/previous-version/**",
        "**/node_modules/**",
      ],
    },
  },
});
