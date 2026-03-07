import PageTitle from "~/components/PageTitle";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { work } from "~/lib/sitedata";

export default function WorkHistory() {
	return (
		<>
			<title>Chris Hurst | Work History</title>
			<meta
				name="description"
				content="A list of roles & companies I've worked for including short descriptions of each role."
			/>
			<section className="w-full">
				<PageTitle
					title="Work History"
					description="With over 10 years of expereince in digital marketing I am a strong and well rounded leader of teams. I have a range of experience working in digital agenices as well multinational companies in various disiplines of digital & marketing."
				/>
				<ul className="flex flex-col gap-6">
					{work.map((job) => (
						<Card
							key={job.name}
							className="border-secondary/50 bg-secondary/10 p-6 transition-all duration-300 hover:border-theme/50 hover:shadow-lg hover:shadow-theme/10 md:p-10 lg:p-16"
						>
							<div className="flex flex-col gap-6 md:flex-row md:items-start lg:gap-12">
								<div className="flex shrink-0 items-center justify-center md:justify-start">
									<img
										src={job.logo}
										alt={job.name}
										className="w-32 h-32 object-contain rounded-lg p-2 md:w-40 md:h-40 lg:w-48 lg:h-48"
									/>
								</div>
								<div className="flex flex-1 flex-col text-left">
									<CardHeader className="pb-2 px-0">
										<span className="mb-1 block h-1 w-12 bg-theme rounded-xl"></span>
										<h3 className="text-2xl font-semibold text-white md:text-3xl">
											{job.name}
										</h3>
										<div className="mt-4 flex flex-wrap gap-3">
											<Badge variant="secondary" className="text-base">
												{job.jobTitle}
											</Badge>
											<Badge className="bg-primary text-white">
												{job.date}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="px-0 pb-0">
										<p className="text-zinc-300">{job.description}</p>
									</CardContent>
								</div>
							</div>
						</Card>
					))}
				</ul>
			</section>
		</>
	);
}
