import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Served from https://wpinrui.github.io/easy-reader/.
  base: "/easy-reader/",
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
});
