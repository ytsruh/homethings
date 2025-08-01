import type { Route } from "./+types/blog";
import PageTitle from "~/components/PageTitle";
import { getSortedPostsData } from "~/lib/posts";
import { formatDate } from "~/lib/utils";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Blog | ytsruh.com" },
    {
      name: "description",
      content: "A collection of thoughts, ideas & experiences.",
    },
  ];
}

export async function loader() {
  const allPostsData = await getSortedPostsData();
  return allPostsData;
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  return (
    <section>
      <PageTitle
        title="Blog"
        description="A collection of thoughts, ideas & experiences."
      />
      {/* <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loaderData.map(({ slug, title, date, description }) => (
          <li key={slug} className="flex flex-col border">
            <Link to={`/blog/${slug}`} className="title">
              {title}
            </Link>
            <p className="date">{formatDate(date)}</p>
            <p className="description">{description}</p>
          </li>
        ))}
      </ul> */}
      <h3 className="text-xl">Coming Soon...</h3>
    </section>
  );
}
