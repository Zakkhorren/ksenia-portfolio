import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

const base = (process.env.BASE_PATH || "").replace(/\/$/, "") + "/";
export default defineConfig({
  base,
  plugins: [solid()],
  build: { target: "es2022", outDir: "dist", emptyOutDir: true },
});
