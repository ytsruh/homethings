import PageHeader from "~/components/PageHeader";
import {
	formatCurrency,
	formatPercent,
	getCurrentYearMonth,
} from "~/lib/utils";
import { getTotals } from "~/lib/wealth";
import type { Route } from "./+types/dashboard";

export async function clientLoader(_: Route.ClientLoaderArgs) {
	try {
		const totals = await getTotals(getCurrentYearMonth());
		return { totals };
	} catch (error) {
		console.error("Failed to load wealth totals:", error);
		return { totals: null };
	}
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { totals } = loaderData;

	return (
		<>
			<title>Dashboard | Homethings</title>
			<meta name="description" content="Welcome to Homethings" />
			<div className="space-y-6">
				<PageHeader
					title="Dashboard"
					subtitle="Welcome to Homethings"
				></PageHeader>

				{totals && (
					<div className="border rounded-lg p-4 bg-muted/50">
						<h3 className="text-lg font-semibold mb-4">Wealth Summary</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Total Assets</p>
								<p className="text-2xl text-theme">
									{formatCurrency(totals.totalAssets)}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Total Liabilities
								</p>
								<p className="text-2xl text-destructive">
									{formatCurrency(totals.totalLiabilities)}
								</p>
							</div>
							<div className="col-span-2 border-t pt-4">
								<p className="text-sm text-muted-foreground">Net Worth</p>
								<p className="text-3xl font-bold">
									{formatCurrency(totals.netWorth)}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Liquid Assets</p>
								<p className="text-xl">{formatCurrency(totals.liquidAssets)}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Liquid %</p>
								<p className="text-xl">{totals.liquidPercent.toFixed(1)}%</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">MoM Change</p>
								<p
									className={`text-xl ${
										totals.moMChange >= 0 ? "text-theme" : "text-destructive"
									}`}
								>
									{formatCurrency(totals.moMChange)} (
									{formatPercent(totals.moMPercent)})
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">YoY Change</p>
								<p
									className={`text-xl ${
										totals.yoYPercent >= 0 ? "text-theme" : "text-destructive"
									}`}
								>
									{formatPercent(totals.yoYPercent)}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
