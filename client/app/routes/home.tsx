import { Eye } from "lucide-react";
import { Link } from "react-router";
import ContactIcons from "~/components/ContactIcons";
import { Badge } from "~/components/ui/badge";
import { projects } from "~/lib/sitedata";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{
			title: "Chris Hurst | Digital Marketer & TypeScript / Go Developer",
			description: "Chris Hurst's personal website",
		},
	];
}

export default function Home() {
	return (
		<section className="flex w-full flex-col gap-y-5">
			{/* HERO SECTION*/}
			<div
				id="hero"
				className="container mx-auto flex w-full items-center justify-between"
			>
				<div className="flex flex-wrap md:flex-nowrap">
					<div className="flex flex-row items-center">
						<div className="basis-full lg:basis-1/2">
							<h1 className="text-center text-5xl font-bold md:text-left md:text-6xl lg:text-7xl">
								Chris Hurst
							</h1>
							<h2 className="text-center text-3xl font-bold md:text-left md:text-4xl lg:text-5xl">
								Digital Marketer & TypeScript / Go Developer
							</h2>
							<div className="flex w-full justify-center md:justify-start">
								<Link
									to="/projects"
									className="mt-12 flex items-center space-x-2 bg-theme rounded-xl px-6 py-4 font-bold text-white"
								>
									<Eye size={24} />
									<span>View my Projects</span>
								</Link>
							</div>
						</div>

						<div className="hidden lg:block lg:basis-1/2">
							<img
								src="/img/computer.webp"
								alt="Computer screen"
								className="-z-1 right-0 mt-12"
							/>
						</div>
					</div>
				</div>
			</div>
			{/* END HERO SECTION*/}
			{/* MY PROJECTS SECTION */}
			<div className="container mx-auto flex w-full items-center justify-between">
				<section className="w-full">
					<span className="mb-1 block h-2 w-12 bg-theme rounded-xl"></span>
					<h2 id="projects" className="text-3xl font-bold">
						Projects
					</h2>
					<p className="my-6 w-full text-lg">
						I've worked on a number of projects, both client & server side. I
						have featured some of them below to show new technologies that have
						been used or where a project is deployed.
					</p>
					<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{projects.map((project) => (
							<div key={project.id}>
								<h3 className="py-5 text-center text-2xl text-white">
									{project.name}
								</h3>
								<img
									src={project.img}
									className="h-36 w-full bg-nav object-cover xl:h-56"
									alt={project.description}
								/>
							</div>
						))}
					</div>
				</section>
			</div>
			{/* END PROJECTS SECTION */}
			{/* WORK SECTION */}
			<div className="container mx-auto flex w-full items-center justify-between py-10">
				<section className="w-full">
					<span className="mb-1 block h-2 w-12 bg-theme rounded-xl"></span>
					<h2 id="work" className="text-3xl font-bold">
						Work History
					</h2>
					<p className="my-6 w-full text-lg">
						With over 10 years of expereince in digital marketing I am a strong
						and well rounded leader of teams. I have a range of experience
						working in digital agenices as well multinational companies in
						various disiplines of digital & marketing.
					</p>
					<div className="my-16 space-y-12">
						{/* work */}
						<div className="flex w-full flex-row flex-wrap justify-center border border-secondary/50 rounded-xl p-16 lg:flex-nowrap lg:justify-start lg:space-x-32 lg:px-16 lg:py-16">
							{/* logo */}
							<div className="m-6 grid grid-cols-1 place-content-center md:basis-1/3 lg:mb-0">
								<img
									src="/img/lseg.webp"
									alt="London Stock Exchange Logo"
									width="100%"
								/>
							</div>
							{/* info */}
							<div className="flex flex-wrap justify-center text-center md:basis-2/3 lg:block lg:text-left">
								<h3 className="text-3xl font-semibold text-white">
									London Stock Exchange Group
								</h3>
								<div className="mb-8 mt-6 flex w-full flex-wrap justify-center gap-3 lg:w-auto lg:justify-start">
									<Badge variant="default">Oct '21 - Current</Badge>
									<Badge variant="secondary" className="text-base">
										Digital Strategy & Enablement Manager
									</Badge>
								</div>
							</div>
						</div>

						{/* work */}
						<div className="flex w-full flex-row flex-wrap justify-center border border-secondary/50 rounded-xl p-16 lg:flex-nowrap lg:justify-start lg:space-x-32 lg:px-16 lg:py-20">
							{/* logo */}
							<div className="m-6 grid grid-cols-1 place-content-center md:basis-1/3 lg:mb-0">
								<img
									src="/img/refinitiv.webp"
									alt="Refinitiv Logo"
									width="100%"
								/>
							</div>
							{/* info */}
							<div className="flex flex-wrap justify-center text-center md:basis-2/3 lg:block lg:text-left">
								<h3 className="text-3xl font-semibold text-white">Refinitiv</h3>
								<div className="mb-8 mt-6 flex w-full flex-wrap justify-center gap-3 lg:w-auto lg:justify-start">
									<Badge variant="default">Jan '19 - Oct '21</Badge>
									<Badge variant="secondary" className="text-base">
										Digital Localisation Manager
									</Badge>
								</div>
							</div>
						</div>

						{/* work */}
						<div className="flex w-full flex-row flex-wrap justify-center border border-secondary/50 rounded-xl p-16 lg:flex-nowrap lg:justify-start lg:space-x-32 lg:px-16 lg:py-20">
							{/* logo */}
							<div className="m-6 grid grid-cols-1 place-content-center md:basis-1/3 lg:mb-0">
								<img
									src="/img/thomson-reuters.webp"
									alt="Thomson Reuters Logo"
									width="100%"
								/>
							</div>
							{/* info */}
							<div className="flex flex-wrap justify-center text-center md:basis-2/3 lg:block lg:text-left">
								<h3 className="text-3xl font-semibold text-white">
									Thomson Reuters
								</h3>
								<div className="mb-8 mt-6 flex w-full flex-wrap justify-center gap-3 lg:w-auto lg:justify-start">
									<Badge variant="default">Dec '16 - Jan '19</Badge>
									<Badge variant="secondary" className="text-base">
										Head of Digital - Middle East
									</Badge>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
			{/* END WORK SECTION */}
			{/* CONTACT ME SECTION */}
			<div className="container mx-auto flex w-full items-center justify-between">
				<section className="w-full">
					<span className="mb-1 block h-2 w-12 bg-theme rounded-xl"></span>
					<h2 id="contact" className="text-3xl font-bold">
						Contact me
					</h2>
					<p className="my-6 w-full text-lg">
						Feel free to to contact me through any of the below methods.
					</p>
					<ContactIcons />
				</section>
			</div>
			{/* END CONTACT ME SECTION */}
		</section>
	);
}
