import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { api } from "./server/mock.mjs";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "finance-mock-api",
      configureServer(server) {
        server.middlewares.use("/api", api);
      },
      configurePreviewServer(server) {
        server.middlewares.use("/api", api);
      },
    },
  ],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
    setupFiles: ["./src/test-setup.ts"],
  },
});
