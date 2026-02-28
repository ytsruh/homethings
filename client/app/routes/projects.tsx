import { Link } from "react-router";
import PageTitle from "~/components/PageTitle";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { projects } from "~/lib/sitedata";
import type { Route } from "./+types/projects";

export function meta({}: Route.MetaArgs) {
	return [
		{
			title: "Chris Hurst | Projects",
			description:
				"A list of projects I've worked on, both client & server side. I have featured some of them below to show new technologies that have been used or where a project is deployed.",
		},
	];
}

export default function Projects() {
	return (
		<section className="w-full">
			<PageTitle
				title="Projects"
				description="I've worked on a number of JavaScript & Go projects, both client & server side. I have featured some of them below to show new technologies that have been used or where a project is deployed."
			/>
			<ul className="flex flex-col gap-5">
				{projects.map((project) => (
					<div
						key={project.id}
						className="flex w-full flex-col flex-wrap justify-center border border-secondary/50 rounded-xl p-16 xl:flex-row xl:flex-nowrap"
					>
						<div className="flex flex-wrap justify-center text-center md:basis-2/3 lg:block lg:text-left">
							<h3 className="text-2xl font-semibold text-white">
								{project.name}
							</h3>
							<div className="mb-8 mt-6 flex w-full flex-wrap justify-center gap-3 lg:w-auto lg:justify-start">
								{project.link && (
									<Button asChild variant="default">
										<Link to={project.link.url}>{project.link.text}</Link>
									</Button>
								)}
								{project.github && (
									<Button asChild variant="secondary">
										<Link to={project.github.url}>{project.github.text}</Link>
									</Button>
								)}
							</div>
							<div className="flex max-w-full flex-wrap items-center justify-between gap-2">
								{project.technologies.map((tech) => (
									<Badge
										key={tech}
										variant="outline"
										className="bg-theme border-theme text-white"
									>
										{tech}
									</Badge>
								))}
							</div>
							<p className="py-2">{project.description}</p>
						</div>
						<div className="m-6 flex md:basis-1/3 lg:mb-0">
							<img
								src={project.img}
								alt={project.name}
								className="w-full object-cover"
							/>
						</div>
					</div>
				))}
			</ul>
		</section>
	);
}
