import { Brain, Briefcase, Dumbbell, Earth, Guitar } from "lucide-react";
import PageTitle from "~/components/PageTitle";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function Now() {
	return (
		<>
			<title>Chris Hurst | Now Page</title>
			<meta
				name="description"
				content="A page that shows what I'm currently working on and what my plans are for the year."
			/>
			<section className="w-full">
				<PageTitle
					title="Now"
					description="A now page. An overview of whats going on right now and what the plans are for the year."
				/>
				<ul className="space-y-4 py-5">
					<li className="flex items-center">
						<div className="icon mr-5 text-theme">
							<Briefcase size="36" />
						</div>
						<p className="text-zinc-300">
							Working at{" "}
							<a
								href="http://www.lseg.com"
								className="text-theme hover:text-theme/75"
								target="_blank"
								rel="noopener"
							>
								LSEG
							</a>{" "}
							in the digital team
						</p>
					</li>
					<li className="flex items-center">
						<div className="icon mr-5 text-theme">
							<Dumbbell size="36" />
						</div>
						<p>Improving my fitness</p>
					</li>
					<li className="flex items-center">
						<div className="icon mr-5 text-theme">
							<Brain size="36" />
						</div>
						<p>Improving my Go skills</p>
					</li>
					<li className="flex items-center">
						<div className="icon mr-5 text-theme">
							<Guitar size="36" />
						</div>
						<p>Learning to play Guitar</p>
					</li>
					<li className="flex items-center">
						<div className="icon mr-5 text-theme">
							<Earth size="36" />
						</div>
						<p>Learning Spanish</p>
					</li>
				</ul>
				<div className="grid grid-cols-1 gap-5 py-10 md:grid-cols-2 lg:grid-cols-3">
					<Card className="border-secondary/50 bg-secondary/10 transition-all duration-300 hover:border-theme hover:shadow-lg hover:shadow-theme/10">
						<CardHeader className="pb-2">
							<span className="mb-1 block h-1 w-12 bg-theme rounded-xl"></span>
							<h2 className="text-2xl font-bold text-zinc-300">Project</h2>
						</CardHeader>
						<CardContent>
							<p className="text-zinc-300">
								My main goal in 2025 is to build out Webiliti into a viable &
								usable project, whilst improving my TypeScript and AI skills.
							</p>
						</CardContent>
					</Card>
					<Card className="border-secondary/50 bg-secondary/10 transition-all duration-300 hover:border-theme hover:shadow-lg hover:shadow-theme/10">
						<CardHeader className="pb-2">
							<span className="mb-1 block h-1 w-12 bg-theme rounded-xl"></span>
							<h2 className="text-2xl font-bold text-zinc-300">Fitness</h2>
						</CardHeader>
						<CardContent>
							<p className="text-zinc-300">
								My fitness goal this year is to run a 10k in under 60 minutes.
								I've entered Warrington Running Festival 10k.
							</p>
						</CardContent>
					</Card>
					<Card className="border-secondary/50 bg-secondary/10 transition-all duration-300 hover:border-theme hover:shadow-lg hover:shadow-theme/10">
						<CardHeader className="pb-2">
							<span className="mb-1 block h-1 w-12 bg-theme rounded-xl"></span>
							<h2 className="text-2xl font-bold text-zinc-300">Go</h2>
						</CardHeader>
						<CardContent>
							<p className="text-zinc-300">
								Building my skills in Go by building a number of small systems
								type projects such as a SSH server, a database & a number of
								CLI's / TUI's.
							</p>
						</CardContent>
					</Card>
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
		</>
	);
}
