// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";

export default defineConfig({
  output: "static",
  adapter: cloudflare(),
  integrations: [tailwind(), alpinejs()],
});
