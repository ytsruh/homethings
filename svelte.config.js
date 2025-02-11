import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-cloudflare";

export default {
  preprocess: vitePreprocess(),
  kit: {
    alias: {
      "@/*": "./src/*",
      "@lib/*": "./src/lib/*",
      "@server/*": "./src/server/*",
    },
    adapter: adapter({
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
      platformProxy: {
        configPath: "wrangler.toml",
        environment: undefined,
        experimentalJsonConfig: false,
        persist: false,
      },
    }),
  },
};
