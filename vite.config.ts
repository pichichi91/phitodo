import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  server: {
    port: 5173,
    // We need to proxy the Toggl API because it's on a different domain, and we need to avoid CORS issues.
    proxy: {
      "/api/toggl": {
        target: "https://api.track.toggl.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/toggl/, "")
      }
    }
  }
});
