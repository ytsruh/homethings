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

export default function BlogSingle({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<title>{`${loaderData.title} | ytsruh.com`}</title>
			<meta name="description" content={loaderData.description} />
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
					fullWidth
				/>
				<div className="flex flex-wrap items-center gap-4 py-3 text-sm text-zinc-400">
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
				<article>
					<Remark
						rehypeReactOptions={{
							components: {
								h1: (props: object) => (
									<h1
										className="text-3xl font-bold mt-8 mb-4 text-white"
										{...props}
									/>
								),
								h2: (props: object) => (
									<h2
										className="text-2xl font-bold mt-8 mb-4 text-white"
										{...props}
									/>
								),
								h3: (props: object) => (
									<h3
										className="text-xl font-semibold mt-6 mb-3 text-white"
										{...props}
									/>
								),
								h4: (props: object) => (
									<h4
										className="text-lg font-semibold mt-4 mb-2 text-white"
										{...props}
									/>
								),
								p: (props: object) => (
									<p
										className="mb-4 leading-relaxed text-zinc-300"
										{...props}
									/>
								),
								ul: (props: object) => (
									<ul
										className="list-disc list-inside mb-4 space-y-2 text-zinc-300"
										{...props}
									/>
								),
								ol: (props: object) => (
									<ol
										className="list-decimal list-inside mb-4 space-y-2 text-zinc-300"
										{...props}
									/>
								),
								li: (props: object) => (
									<li className="text-zinc-300" {...props} />
								),
								code: (props: object) => (
									<code
										className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-theme font-mono"
										{...props}
									/>
								),
								pre: (props: object) => (
									<pre
										className="bg-zinc-900 p-4 rounded-xl overflow-x-auto mb-4 border border-zinc-800"
										{...props}
									/>
								),
								blockquote: (props: object) => (
									<blockquote
										className="border-l-4 border-theme pl-4 italic text-zinc-400 my-4"
										{...props}
									/>
								),
								a: (props: object) => (
									<a className="text-theme hover:underline" {...props} />
								),
								strong: (props: object) => (
									<strong className="font-semibold text-white" {...props} />
								),
								em: (props: object) => (
									<em className="italic text-zinc-300" {...props} />
								),
								hr: (props: object) => (
									<hr className="my-8 border-zinc-800" {...props} />
								),
							},
						}}
					>
						{loaderData.content}
					</Remark>
				</article>
			</section>
		</>
	);
}
