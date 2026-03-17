interface PageTitleProps {
	title: string;
	description: string;
	fullWidth?: boolean;
}

export default function PageTitle({
	title,
	description,
	fullWidth = false,
}: PageTitleProps) {
	return (
		<>
			<div className="mb-1 block h-2 w-12 bg-theme rounded-xl"></div>
			<h2 className="text-3xl font-bold">{title}</h2>
			<p
				className={`my-6 ${fullWidth ? "" : "w-full max-w-3xl"} text-lg text-zinc-300`}
			>
				{description}
			</p>
		</>
	);
}
