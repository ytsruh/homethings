import { ChevronLeft } from "lucide-react";
import { Remark } from "react-remark";
import { Link } from "react-router";
import PageTitle from "~/components/PageTitle";
import { getPostData } from "~/lib/posts";
import { formatDate } from "~/lib/utils";
import type { Route } from "./+types/blog-single";

export function loader({ params }: Route.LoaderArgs) {
	const postData = getPostData(params.slug);
	return postData;
}

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: `${data?.title} | ytsruh.com` },
		{
			name: "description",
			content:
				data?.description ?? "A collection of thoughts, ideas & experiences.",
		},
	];
}

export default function BlogSingle({ loaderData }: Route.ComponentProps) {
	return (
		<section>
			<Link
				to="/blog"
				className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-theme transition-colors"
			>
				<ChevronLeft />
				Back to Blog
			</Link>
			{loaderData.featuredImage && (
				<img
					src={loaderData.featuredImage}
					alt={loaderData.title}
					className="mb-8 h-64 w-full rounded-2xl object-cover md:h-80"
				/>
			)}
			<PageTitle
				title={loaderData.title}
				description={loaderData.description}
			/>
			<div className="flex flex-wrap items-center gap-4 py-5 text-sm text-zinc-400">
				<span>Published: {formatDate(loaderData.date)}</span>
				{loaderData.tags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{loaderData.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</div>
			<article className="prose prose-invert max-w-none">
				<Remark>{loaderData.content}</Remark>
			</article>
		</section>
	);
}
