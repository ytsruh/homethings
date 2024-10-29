import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-cloudflare";

export default {
  preprocess: vitePreprocess(),
  kit: {
    alias: {
      "@/*": "./src/*",
      "@lib/*": "./src/lib/*",
    },
    adapter: adapter({
      // See below for an explanation of these options
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
