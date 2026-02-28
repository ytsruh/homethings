import type { Config } from "@react-router/dev/config";
import { getAllPostSlugs } from "./app/lib/posts";

export default {
	// Server-side render by default, to enable SPA mode set this to `false`
	ssr: false,
	// return a list of URLs to prerender at build time
	async prerender() {
		const slugs = getAllPostSlugs();
		const blogSlugs = slugs.map((slug) => `/blog/${slug.params.slug}`);
		return [
			"/",
			"/contact",
			"/projects",
			"/work-history",
			"/now",
			"/blog",
			...blogSlugs,
		];
	},
	future: {
	    v8_viteEnvironmentApi: false,
	  },
} satisfies Config;
