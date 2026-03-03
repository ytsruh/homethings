interface Project {
	name: string;
	id: number;
	img: string;
	description: string;
	technologies: string[];
	featured: boolean;
	link: {
		url: string;
		text: string;
	} | null;
	github: {
		url: string;
		text: string;
	} | null;
}

export const projects: Project[] = [
	{
		name: "Homethings",
		id: 1,
		img: "/img/homethings.png",
		description:
			"The home & personal playground built using Typescript. The app features a number of hobby projects including a personal note taking app, document storage, a personalised AI Chatbot as well as others. The app also doubles as this site.",
		technologies: [
			"Typescript",
			"React",
			"Tailwind CSS",
			"HonoJS",
			"SQLite",
			"Cloudflare",
		],
		featured: true,
		link: {
			url: "https://www.ytsruh.com/login",
			text: "Visit",
		},
		github: {
			url: "https://github.com/ytsruh/homethings",
			text: "Github",
		},
	},
	{
		name: "Webiliti",
		id: 2,
		img: "/img/webiliti.webp",
		description:
			"The web testing app built using TypeScript & React. The Hono app has the majority of the functionality, there are api routes to handle a few specific browser based tasks and the main app CRUD functionality including auth. The app runs a number of browser based tests on a given page to allow a user to track web performance over time.",
		technologies: [
			"Typescript",
			"React",
			"Tailwind CSS",
			"HonoJS",
			"Cloudflare",
			"SQlite",
		],
		featured: true,
		link: {
			url: "https://www.webiliti.com/",
			text: "Visit",
		},
		github: null,
	},
	{
		name: "Envoy",
		id: 3,
		img: "/img/envoy.png",
		description:
			"Envoy is an envinroment storage app built using Go, Echo & SQLite. The server acts as an API with CRUD functionality for environment variables. A CLI application is also included that extends some of the server functionality into the command line and acts as the client for interacting with the API.",
		technologies: ["Go / Golang", "Echo", "Tailwind CSS", "Railway", "SQLite"],
		featured: true,
		link: {
			url: "https://envoy.webiliti.com",
			text: "Visit",
		},
		github: null,
	},
];

interface Job {
	name: string;
	logo: string;
	jobTitle: string;
	date: string;
	description: string;
}

export const work: Job[] = [
	{
		name: "London Stock Exchange Group",
		logo: "/img/lseg.jpg",
		jobTitle: "Digital Strategy & Enablement Manager",
		date: "Sep '21 - Current",
		description:
			"Acting as product owner for all marketing websites in the group. Working with multiple development teams to support, maintain & enhance the Adobe & Drupal platforms.",
	},
	{
		name: "Refinitiv",
		logo: "/img/refinitiv.webp",
		jobTitle: "Senior Manager, Digital Localisation",
		date: "Oct '18 - Sep '21",
		description:
			"Responsible for management of 6 local language websites built using Adobe Experience Manager. Secondary responsibility for website performance channels such as SEO, Paid Search & Social.",
	},
	{
		name: "Thomson Reuters",
		logo: "/img/thomson-reuters.webp",
		jobTitle: "Head of Digital - Middle East",
		date: "Dec '16 - Oct '18",
		description:
			"Lead & revenue generating responsibility for the MENA region of Thomson Reuters using all available digital channels. Digital analytics and reporting dashboard integrated into CRM and sales dashboards.",
	},
	{
		name: "Latitude Digital Marketing",
		logo: "/img/latitude.webp",
		jobTitle: "Account Manager - Middle East",
		date: "Jun '12 - Dec '15",
		description:
			"Responsible for account management for a selection of key strategic accounts in the region across Travel, Ecommerce & Financial sectors. Advising clients on all Paid & Organic Digital channels to increase business & website performance.",
	},
];
