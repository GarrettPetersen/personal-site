import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://garrettpetersen.com",
  output: "static",
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/desk") })],
  build: {
    format: "directory",
  },
});
