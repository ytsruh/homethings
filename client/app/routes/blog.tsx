import { useMemo, useState } from "react";
import { Link } from "react-router";
import PageTitle from "~/components/PageTitle";
import { getSortedPostsData } from "~/lib/posts";
import { formatDate } from "~/lib/utils";
import type { Route } from "./+types/blog";

export function loader() {
	const allPostsData = getSortedPostsData();
	return allPostsData;
}

export function meta() {
	return [
		{ title: "Blog | ytsruh.com" },
		{
			name: "description",
			content: "A collection of thoughts, ideas & experiences.",
		},
	];
}

export default function Blog({ loaderData }: Route.ComponentProps) {
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	const allTags = useMemo(() => {
		const tags = new Set<string>();
		for (const post of loaderData) {
			for (const tag of post.tags) {
				tags.add(tag);
			}
		}
		return Array.from(tags).sort();
	}, [loaderData]);

	const filteredPosts = useMemo(() => {
		if (!selectedTag) return loaderData;
		return loaderData.filter((post) => post.tags.includes(selectedTag));
	}, [loaderData, selectedTag]);

	return (
		<section>
			<PageTitle
				title="Blog"
				description="A collection of thoughts, ideas & experiences."
			/>
			<div className="mb-8 flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setSelectedTag(null)}
					className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
						selectedTag === null
							? "bg-theme text-white"
							: "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
					}`}
				>
					All
				</button>
				{allTags.map((tag) => (
					<button
						type="button"
						key={tag}
						onClick={() => setSelectedTag(tag)}
						className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
							selectedTag === tag
								? "bg-theme text-white"
								: "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
						}`}
					>
						{tag}
					</button>
				))}
			</div>
			<ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filteredPosts.map(
					({ slug, title, date, description, tags, featuredImage }) => (
						<li
							key={slug}
							className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-theme/5"
						>
							{featuredImage && (
								<Link to={`/blog/${slug}`} className="block overflow-hidden">
									<img
										src={featuredImage}
										alt={title}
										className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</Link>
							)}
							<div className="flex flex-1 flex-col p-5">
								<Link to={`/blog/${slug}`} className="group-hover:text-theme">
									<h3 className="mb-2 text-xl font-semibold transition-colors">
										{title}
									</h3>
								</Link>
								<p className="mb-3 text-sm text-zinc-400">{formatDate(date)}</p>
								<p className="mb-4 flex-1 text-zinc-300">{description}</p>
								<div className="flex flex-wrap gap-2">
									{tags.map((tag) => (
										<span
											key={tag}
											className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						</li>
					),
				)}
			</ul>
		</section>
	);
}
