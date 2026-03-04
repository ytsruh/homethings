import PageTitle from "~/components/PageTitle";

const gophers = [
	{ src: "/img/gophers/gopher-beach.png", alt: "Gopher at the beach" },
	{ src: "/img/gophers/gopher-blimp.png", alt: "Gopher in a blimp" },
	{ src: "/img/gophers/gopher-builder.png", alt: "Gopher builder" },
	{ src: "/img/gophers/gopher-desk.png", alt: "Gopher at desk" },
	{ src: "/img/gophers/gopher-farm.png", alt: "Gopher farm" },
	{ src: "/img/gophers/gopher-forge.png", alt: "Gopher at forge" },
	{ src: "/img/gophers/gopher-globe.png", alt: "Gopher with globe" },
	{ src: "/img/gophers/gopher-horse.png", alt: "Gopher on horse" },
	{ src: "/img/gophers/gopher-kitchen.png", alt: "Gopher in kitchen" },
	{ src: "/img/gophers/gopher-mexican.png", alt: "Gopher in Mexican theme" },
	{ src: "/img/gophers/gopher-ninja.png", alt: "Gopher ninja" },
	{ src: "/img/gophers/gopher-paper.png", alt: "Gopher with paper" },
	{ src: "/img/gophers/gopher-parachute.png", alt: "Gopher with parachute" },
	{ src: "/img/gophers/gopher-party.png", alt: "Gopher at party" },
	{ src: "/img/gophers/gopher-pirate.png", alt: "Gopher pirate" },
	{ src: "/img/gophers/gopher-plumbing.jpg", alt: "Gopher plumber" },
	{ src: "/img/gophers/gopher-rooftop.png", alt: "Gopher on rooftop" },
	{ src: "/img/gophers/gopher-server.png", alt: "Gopher as server" },
	{ src: "/img/gophers/gopher-sleep.png", alt: "Gopher sleeping" },
	{ src: "/img/gophers/gopher-superhero.png", alt: "Gopher superhero" },
	{ src: "/img/gophers/gopher-surf.png", alt: "Gopher surfing" },
	{ src: "/img/gophers/gopher-weights.jpg", alt: "Gopher with weights" },
	{ src: "/img/gophers/gophy.png", alt: "Gophy" },
];

export default function ProjectsGophers() {
	return (
		<>
			<title>Chris Hurst | Gophers</title>
			<meta
				name="description"
				content="A collection of Go gopher mascots in various themes"
			/>
			<section className="w-full">
				<PageTitle
					title="Gophers"
					description="A collection of Go gopher mascots in various themes"
				/>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{gophers.map((gopher) => (
						<div
							key={gopher.src}
							className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-theme/50 hover:shadow-lg hover:shadow-theme/10"
						>
							<img
								src={gopher.src}
								alt={gopher.alt}
								className="aspect-square w-full object-cover"
							/>
						</div>
					))}
				</div>
			</section>
		</>
	);
}
