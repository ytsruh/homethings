import type { Route } from "./+types/blog-single";
import PageTitle from "~/components/PageTitle";
import { getPostData } from "~/lib/posts";
import { formatDate } from "~/lib/utils";

export function meta() {
  return [
    { title: "Blog | ytsruh.com" },
    { name: "description", content: "A collection of thoughts, ideas & experiences." },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const postData = await getPostData(params.slug);
  return postData;
}

export default function BlogSingle({ loaderData }: Route.ComponentProps) {
  return (
    <section>
      <PageTitle title={loaderData.title} description={loaderData.description} />
      <p className="py-5 text-sm text-secondary">Published: {formatDate(loaderData.date)}</p>
      <article className="prose prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: loaderData.content }} />
      </article>
    </section>
  );
}
