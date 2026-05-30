import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
  // return a list of URLs to prerender at build time
  async prerender() {
    return ["/", "/contact", "/projects", "/work-history", "/now"];
  },
} satisfies Config;
