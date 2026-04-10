import { defineConfig } from "vite";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const frontendCandidates = [
  resolve(repoRoot, "frontend"),
  resolve(repoRoot, "docuagent-frontend"),
];
const frontendRoot = frontendCandidates.find((candidate) => existsSync(candidate)) ?? repoRoot;

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
