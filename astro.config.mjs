import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const site = process.env.ASTRO_SITE || "https://huangwenxuangod.github.io";
const base = process.env.ASTRO_BASE || "/";

export default defineConfig({
  site,
  base,
  integrations: [react()]
});
