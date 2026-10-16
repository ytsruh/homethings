import { MessageSquare, NotebookPen, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router";
import PageHeader from "~/components/PageHeader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { getStats, type Stats } from "~/lib/stats";
import type { Route } from "./+types/dashboard";

const emptyStats: Stats = {
	notes: { open: 0, completed: 0 },
	recipes: { total: 0 },
};

export async function clientLoader() {
	try {
		const stats = await getStats();
		return { stats };
	} catch {
		return { stats: emptyStats };
	}
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { stats } = loaderData;

	return (
		<>
			<title>Dashboard | Homethings</title>
			<meta name="description" content="Welcome to Homethings" />
			<div className="space-y-6">
				<PageHeader
					title="Dashboard"
					subtitle="Welcome to Homethings"
				></PageHeader>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Card className="@container/card">
						<CardHeader>
							<CardDescription>Open Notes</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{stats.notes.open.toLocaleString("en-US")}
							</CardTitle>
							<CardAction>
								<Badge variant="outline">
									<NotebookPen />
									Notes
								</Badge>
							</CardAction>
						</CardHeader>
						<CardFooter>
							<Button
								variant="outline"
								size="sm"
								render={<Link to="/app/notes" />}
							>
								View notes
							</Button>
						</CardFooter>
					</Card>
					<Card className="@container/card">
						<CardHeader>
							<CardDescription>Recipes Created</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{stats.recipes.total.toLocaleString("en-US")}
							</CardTitle>
							<CardAction>
								<Badge variant="outline">
									<UtensilsCrossed />
									Recipes
								</Badge>
							</CardAction>
						</CardHeader>
						<CardFooter>
							<Button
								variant="outline"
								size="sm"
								render={<Link to="/app/recipes" />}
							>
								View recipes
							</Button>
						</CardFooter>
					</Card>
					<Card className="@container/card">
						<CardHeader>
							<CardDescription>Chat Usage</CardDescription>
							<CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
								Tokens
							</CardTitle>
							<CardAction>
								<Badge variant="outline">
									<MessageSquare />
									AI
								</Badge>
							</CardAction>
						</CardHeader>
						<CardFooter>
							<Button
								variant="outline"
								size="sm"
								render={<Link to="/app/usage" />}
							>
								View usage
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</>
	);
}
