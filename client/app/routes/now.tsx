import type { Route } from "./+types/now";
import PageTitle from "~/components/PageTitle";
import { Tag } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "Chris Hurst | Now Page",
      description:
        "A page that shows what I'm currently working on and what my plans are for the year.",
    },
  ];
}

export default function Now() {
  return (
    <section className="w-full">
      <PageTitle
        title="Now"
        description="A now page. An overview of whats going on right now and what the plans are for the year."
      />
      <ul className="space-y-4 py-5">
        <li className="flex items-center">
          <div className="icon mr-5">
            <Tag size="36" />
          </div>
          <p>
            Working at{" "}
            <a
              href="http://www.lseg.com"
              className="text-theme hover:text-theme/75"
              target="_blank"
            >
              LSEG
            </a>{" "}
            in the digital team
          </p>
        </li>
        <li className="flex items-center">
          <div className="icon mr-5">
            <Tag size="36" />
          </div>
          <p>Improving my fitness</p>
        </li>
        <li className="flex items-center">
          <div className="icon mr-5">
            <Tag size="36" />
          </div>
          <p>Improving my Go skills</p>
        </li>
      </ul>
      <div className="grid grid-cols-1 gap-5 py-5 md:grid-cols-2 md:py-10 lg:grid-cols-3">
        <div>
          <span className="mb-1 block h-2 w-12 bg-theme rounded-xl"></span>
          <h2 className="text-3xl font-bold">Project</h2>
          <p className="py-2">
            My main goal in 2025 is to build out Webiliti into a viable & usable
            project. I'm also using it as an opportunity to build my TS skills
            and to solve some interesting problems in the Digital world.
          </p>
        </div>
        <div>
          <span className="mb-1 block h-2 w-12 bg-theme rounded-xl"></span>
          <h2 className="text-3xl font-bold">Go</h2>
          <p className="py-2">
            Building my skills in Go by building a number of small systems type
            projects such as a SSH server, a database & a number of CLI's /
            TUI's.
          </p>
        </div>
        <div>
          <span className="mb-1 block h-2 w-12 bg-theme rounded-xl"></span>
          <h2 className="text-3xl font-bold">Fitness</h2>
          <p className="py-2">
            My fitness goal this year is to run a 10k in under 60 minutes.
            Despite doing numerous 5k's and beating 30 mins in 2024, I was not
            able to beat 60 mins.
          </p>
        </div>
      </div>
      <p className="py-10 text-lg">
        What is a now page? Click{" "}
        <a
          className="text-theme hover:text-theme/75"
          href="https://nownownow.com/about"
        >
          here
        </a>{" "}
        to find out.
      </p>
    </section>
  );
}
