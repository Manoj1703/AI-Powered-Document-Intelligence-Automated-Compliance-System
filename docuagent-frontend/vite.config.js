import { defineConfig, loadEnv } from "vite";

function parseAllowedHosts(value) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : true;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    String(env.VITE_BACKEND_PROXY_TARGET || env.VITE_API_BASE_URL || "http://127.0.0.1:8003").trim();

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      allowedHosts: parseAllowedHosts(env.VITE_ALLOWED_HOSTS),
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
