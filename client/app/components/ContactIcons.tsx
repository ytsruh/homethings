import { Github, Linkedin, Mail, Twitter } from "lucide-react";

export default function ContactIcons() {
	return (
		<div className="grid grid-cols-2 items-center justify-center gap-5 py-10 md:grid-cols-5">
			{/*<a
        href="mailto:chris@ytsruh.com"
        aria-label="Contact by email"
        className="flex items-center justify-center"
      >
        <Mail size="50" />
      </a>*/}
			<a
				href="https://www.twitter.com/the_chrishurst"
				target="_blank"
				aria-label="Find me on Twitter"
				className="flex items-center justify-center"
				rel="noopener"
			>
				<Twitter size="50" />
			</a>
			<a
				href="https://www.linkedin.com/in/chrishurst2/"
				target="_blank"
				aria-label="Find me on LinkedIn"
				className="flex items-center justify-center"
				rel="noopener"
			>
				<Linkedin size="50" />
			</a>
			<a
				href="https://github.com/ytsruh"
				target="_blank"
				aria-label="Find me on Github"
				className="flex items-center justify-center"
				rel="noopener"
			>
				<Github size="50" />
			</a>
		</div>
	);
}
