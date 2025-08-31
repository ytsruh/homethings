import type { Route } from "./+types/work-history";
import PageTitle from "~/components/PageTitle";
import { Badge } from "~/components/ui/badge";
import { work } from "~/lib/sitedata";

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "Chris Hurst | Work History",
      description:
        "A list of roles & companies I've worked for including short descriptions of each role.",
    },
  ];
}

export default function WorkHistory() {
  return (
    <section className="w-full">
      <PageTitle
        title="Work History"
        description="With over 10 years of expereince in digital marketing I am a strong and well rounded leader of teams. I have a range of experience working in digital agenices as well multinational companies in various disiplines of digital & marketing."
      />
      <ul className="flex flex-col gap-5">
        {work.map((job) => (
          <div
            key={job.name}
            className="flex w-full flex-row flex-wrap justify-center border border-secondary/50 rounded-xl p-16 lg:flex-nowrap lg:justify-start lg:space-x-32 lg:px-16 lg:py-16"
          >
            <div className="m-6 grid grid-cols-1 place-content-center md:basis-1/3 lg:mb-0">
              <img src={job.logo} alt={job.name} width="100%" />
            </div>
            <div className="flex flex-wrap justify-center text-center md:basis-2/3 lg:block lg:text-left">
              <h3 className="text-3xl font-semibold text-white">{job.name}</h3>
              <div className="mb-8 mt-6 flex w-full flex-wrap justify-center gap-3 lg:w-auto lg:justify-start">
                <Badge variant="default">{job.date}</Badge>
                <Badge variant="secondary" className="text-base">
                  {job.jobTitle}
                </Badge>
              </div>
              <p>{job.description}</p>
            </div>
          </div>
        ))}
      </ul>
    </section>
  );
}
