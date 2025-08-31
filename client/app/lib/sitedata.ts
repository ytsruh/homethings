interface Project {
  name: string;
  id: number;
  img: string;
  description: string;
  technologies: string[];
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
    img: "/img/homethings.webp",
    description:
      "The home & personal playground built using Pocketbase, Go & React. The app features a number of hobby projects including a personal note taking app, document storage, a personalised AI Chatbot as well as others. A CLI application is also included that extends some of the server functionality into the command line.",
    technologies: [
      "Go",
      "SQLite",
      "React",
      "Tailwind CSS",
      "Pocketbase",
      "Charm",
    ],
    link: {
      url: "https://homethings.ytsruh.com/",
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
    link: {
      url: "https://www.webiliti.com/",
      text: "Visit",
    },
    github: null,
  },
  {
    name: "Finly",
    id: 3,
    img: "/img/finly.png",
    description:
      "Finly is a market data app built using Go, Echo & SQLite. The app is an API that holds relevant market data from over 25+ sources and aggregates it into a single scalable format. HTMX is used to create a small logged in section to allow users to manage API keys.",
    technologies: [
      "Go / Golang",
      "Echo",
      "HTMX",
      "Tailwind CSS",
      "Railway",
      "SQLite",
    ],
    link: {
      url: "https://www.finly.cc",
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
    logo: "/img/lseg.webp",
    jobTitle: "Digital Strategy & Enablement Manager",
    date: "Dec '16 - Oct '18",
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
