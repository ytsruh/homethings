import { Link } from "react-router";
import PageTitle from "~/components/PageTitle";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { projects } from "~/lib/sitedata";

export default function Projects() {
	return (
		<>
			<title>Chris Hurst | Projects</title>
			<meta
				name="description"
				content="A list of projects I've worked on, both client & server side. I have featured some of them below to show new technologies that have been used or where a project is deployed."
			/>
			<section className="w-full">
				<PageTitle
					title="Projects"
					description="I've worked on a number of JavaScript & Go projects, both client & server side. I have featured some of them below to show new technologies that have been used or where a project is deployed."
				/>
				<ul className="flex flex-col gap-6">
					{projects.map((project) => (
						<Card
							key={project.id}
							className="border-secondary/50 bg-secondary/10 p-6 transition-all duration-300 hover:border-theme/50 hover:shadow-lg hover:shadow-theme/10 md:p-10 lg:p-16"
						>
							<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
								<div className="flex flex-1 flex-col text-left">
									<CardHeader className="pb-2 px-0">
										<span className="mb-1 block h-1 w-12 bg-theme rounded-xl"></span>
										<h3 className="text-2xl font-semibold text-white md:text-3xl">
											{project.name}
										</h3>
									</CardHeader>
									<CardContent className="px-0 pb-0">
										<p className="mb-6 text-zinc-300">{project.description}</p>
										<div className="mb-6 flex flex-wrap gap-3">
											{project.technologies.map((tech) => (
												<Badge
													key={tech}
													className="bg-theme border-theme text-white"
												>
													{tech}
												</Badge>
											))}
										</div>
										<div className="flex flex-wrap gap-3">
											{project.link && (
												<Button asChild variant="default">
													<Link to={project.link.url}>{project.link.text}</Link>
												</Button>
											)}
											{project.github && (
												<Button asChild variant="secondary">
													<Link to={project.github.url}>
														{project.github.text}
													</Link>
												</Button>
											)}
										</div>
									</CardContent>
								</div>
								<div className="flex shrink-0 lg:w-5/12">
									<img
										src={project.img}
										alt={project.name}
										className="w-full h-48 object-cover rounded-lg md:h-64 lg:h-72"
									/>
								</div>
							</div>
						</Card>
					))}
				</ul>
			</section>
		</>
	);
}
