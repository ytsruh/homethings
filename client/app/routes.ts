import {
	index,
	layout,
	prefix,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		index("routes/home.tsx"),
		route("projects", "routes/projects.tsx"),
		route("projects/gophers", "routes/gophers.tsx"),
		route("work-history", "routes/work-history.tsx"),
		route("blog", "routes/blog.tsx"),
		route("blog/:slug", "routes/blog-single.tsx"),
		route("now", "routes/now.tsx"),
		route("contact", "routes/contact.tsx"),
	]),

	route("login", "routes/login.tsx"),

	...prefix("app", [
		layout("routes/app/layout.tsx", [
			index("routes/app/dashboard.tsx"),
			route("logout", "routes/app/logout.tsx"),
			route("chat", "routes/app/chat.tsx"),
			route("images", "routes/app/images.tsx"),
			route("files", "routes/app/files.tsx"),
			route("notes", "routes/app/notes/index.tsx"),
			route("notes/:noteId", "routes/app/notes/single.tsx"),
			route("recipes", "routes/app/recipes/index.tsx"),
			route("recipes/:recipeId", "routes/app/recipes/single.tsx"),
			route("recipes/:recipeId/edit", "routes/app/recipes/edit.tsx"),
			route("recipes/:recipeId/delete", "routes/app/recipes/delete.tsx"),
			route("profile", "routes/app/profile.tsx"),
			route("feedback", "routes/app/feedback.tsx"),
		]),
	]),
] satisfies RouteConfig;
