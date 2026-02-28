import type { ReactNode } from "react";

export default function PageHeader({
	title,
	subtitle,
	actions,
}: {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
}) {
	return (
		<div className="py-4 hidden md:block">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl">{title}</h1>
					{subtitle && (
						<h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">
							{subtitle}
						</h2>
					)}
				</div>
				{actions}
			</div>
		</div>
	);
}
