import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(repoRoot, "docuagent-frontend");

export default defineConfig({
  root: frontendRoot,
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
