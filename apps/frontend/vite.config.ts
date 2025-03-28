import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { UserConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
const config: UserConfig = {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/create": "http://localhost:8000",
      "/upgrade-email": "http://localhost:8000",
      "/messages": "http://localhost:8000",
      "/inbox": "http://localhost:8000",
    },
  },
};

export default defineConfig(config);
