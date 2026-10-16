import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
	type ChatDailyUsageRow,
	type ChatUsageByModel,
	getChatDailyUsage,
	getChatUsage,
} from "~/lib/chat";
import type { Route } from "./+types/usage";

export async function clientLoader() {
	try {
		const [lifetime, recent] = await Promise.all([
			getChatUsage(),
			getChatDailyUsage(30),
		]);
		return {
			lifetime,
			totals30: recent.totals,
			daily: recent.daily,
			days: recent.days,
			loadError: false,
		};
	} catch {
		return {
			lifetime: [] as ChatUsageByModel[],
			totals30: [] as ChatUsageByModel[],
			daily: [] as ChatDailyUsageRow[],
			days: 30,
			loadError: true,
		};
	}
}

function formatNum(n: number): string {
	return n.toLocaleString("en-US");
}

function shortModel(id: string): string {
	const parts = id.split("/");
	return parts[parts.length - 1] || id;
}

function sumTotals(rows: ChatUsageByModel[]) {
	return rows.reduce(
		(acc, r) => ({
			turns: acc.turns + r.turns,
			promptTokens: acc.promptTokens + r.promptTokens,
			completionTokens: acc.completionTokens + r.completionTokens,
			totalTokens: acc.totalTokens + r.totalTokens,
		}),
		{ turns: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 },
	);
}

function modelColor(index: number): string {
	return `var(--chart-${(index % 5) + 1})`;
}

// Pivot per-model per-day rows into one object per day with a total-token
// key per model, zero-filling days without usage so the trend is continuous.
// Dates are UTC YYYY-MM-DD to match the API bucketing.
type DailyChartRow = { date: string } & Record<string, number | string>;

function pivotDaily(daily: ChatDailyUsageRow[], days: number) {
	const dates: string[] = [];
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today.getTime() - i * 86400000);
		dates.push(d.toISOString().slice(0, 10));
	}
	const models = [...new Set(daily.map((r) => r.model))].sort();
	const byDay = new Map<string, DailyChartRow>();
	for (const date of dates) {
		const row: DailyChartRow = { date };
		for (const m of models) row[m] = 0;
		byDay.set(date, row);
	}
	for (const r of daily) {
		const row = byDay.get(r.date);
		if (row) row[r.model] = ((row[r.model] as number) ?? 0) + r.totalTokens;
	}
	const rows = dates.map((d) => byDay.get(d)).filter((r) => r !== undefined);
	return { rows, models };
}

function StatCards({ totals }: { totals: ReturnType<typeof sumTotals> }) {
	const stats = [
		{ label: "Responses", value: totals.turns },
		{ label: "Prompt tokens", value: totals.promptTokens },
		{ label: "Completion tokens", value: totals.completionTokens },
		{ label: "Total tokens", value: totals.totalTokens },
	];
	return (
		<div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
			{stats.map((s) => (
				<Card key={s.label} size="sm">
					<CardHeader>
						<CardDescription>{s.label}</CardDescription>
						<CardTitle className="text-2xl tabular-nums">
							{formatNum(s.value)}
						</CardTitle>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}

function UsageTable({ rows }: { rows: ChatUsageByModel[] }) {
	if (rows.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No usage recorded in this period yet.
			</p>
		);
	}
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Model</TableHead>
					<TableHead className="text-right">Responses</TableHead>
					<TableHead className="text-right">Prompt</TableHead>
					<TableHead className="text-right">Completion</TableHead>
					<TableHead className="text-right">Total</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map((r) => (
					<TableRow key={r.model}>
						<TableCell title={r.model} className="max-w-45 truncate">
							{shortModel(r.model)}
						</TableCell>
						<TableCell className="text-right tabular-nums">
							{formatNum(r.turns)}
						</TableCell>
						<TableCell className="text-right tabular-nums">
							{formatNum(r.promptTokens)}
						</TableCell>
						<TableCell className="text-right tabular-nums">
							{formatNum(r.completionTokens)}
						</TableCell>
						<TableCell className="text-right tabular-nums">
							{formatNum(r.totalTokens)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

const tokenSplitConfig = {
	promptTokens: { label: "Prompt", color: "var(--chart-1)" },
	completionTokens: { label: "Completion", color: "var(--chart-2)" },
} satisfies ChartConfig;

function LifetimeChart({ rows }: { rows: ChatUsageByModel[] }) {
	const data = useMemo(
		() =>
			[...rows]
				.sort((a, b) => b.totalTokens - a.totalTokens)
				.map((r) => ({
					model: shortModel(r.model),
					promptTokens: r.promptTokens,
					completionTokens: r.completionTokens,
				})),
		[rows],
	);
	if (data.length === 0) return null;
	return (
		<ChartContainer config={tokenSplitConfig} className="h-60 w-full">
			<BarChart accessibilityLayer data={data}>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="model"
					tickLine={false}
					tickMargin={10}
					axisLine={false}
					interval={0}
					tick={{ fontSize: 11 }}
				/>
				<YAxis tickLine={false} axisLine={false} width={50} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<ChartLegend content={<ChartLegendContent />} />
				<Bar
					dataKey="promptTokens"
					stackId="tokens"
					fill="var(--color-promptTokens)"
					radius={[0, 0, 0, 0]}
				/>
				<Bar
					dataKey="completionTokens"
					stackId="tokens"
					fill="var(--color-completionTokens)"
					radius={[4, 4, 0, 0]}
				/>
			</BarChart>
		</ChartContainer>
	);
}

function DailyChart({
	daily,
	days,
}: {
	daily: ChatDailyUsageRow[];
	days: number;
}) {
	const { rows, models } = useMemo(
		() => pivotDaily(daily, days),
		[daily, days],
	);
	const config = useMemo(() => {
		const c: ChartConfig = {};
		models.forEach((m, i) => {
			c[m] = { label: shortModel(m), color: modelColor(i) };
		});
		return c;
	}, [models]);
	if (models.length === 0) return null;
	return (
		<ChartContainer config={config} className="h-60 w-full">
			<BarChart accessibilityLayer data={rows}>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="date"
					tickLine={false}
					tickMargin={10}
					axisLine={false}
					tickFormatter={(v: string) => v.slice(5)}
					minTickGap={24}
				/>
				<YAxis tickLine={false} axisLine={false} width={50} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<ChartLegend content={<ChartLegendContent />} />
				{models.map((m, i) => (
					<Bar
						key={m}
						dataKey={m}
						name={m}
						stackId="daily"
						fill={modelColor(i)}
						radius={[0, 0, 0, 0]}
					/>
				))}
			</BarChart>
		</ChartContainer>
	);
}

export function HydrateFallback() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-48" />
			<div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
				{[0, 1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-20" />
				))}
			</div>
		</div>
	);
}

export default function Usage({ loaderData }: Route.ComponentProps) {
	const { lifetime, totals30, daily, days, loadError } = loaderData;
	const toasted = useRef(false);
	useEffect(() => {
		if (loadError && !toasted.current) {
			toasted.current = true;
			toast({
				title: "Couldn't load usage",
				description: "Chat usage stats are unavailable right now.",
				type: "destructive",
			});
		}
	}, [loadError]);
	const lifetimeTotals = useMemo(() => sumTotals(lifetime), [lifetime]);
	const recentTotals = useMemo(() => sumTotals(totals30), [totals30]);
	const isEmpty = lifetime.length === 0;

	return (
		<>
			<title>Usage | Homethings</title>
			<meta name="description" content="Your AI chat token usage" />
			<div className="space-y-8">
				<PageHeader
					title="Usage"
					subtitle="AI chat token usage"
				></PageHeader>

				{isEmpty ? (
					<Card>
						<CardHeader>
							<CardTitle>Chat usage</CardTitle>
							<CardDescription>
								No chat usage recorded yet. Start a conversation in{" "}
								<Link to="/app/chat" className="underline">
									Chat
								</Link>{" "}
								and token usage will appear here.
							</CardDescription>
						</CardHeader>
					</Card>
				) : (
					<Tabs defaultValue="recent">
						<TabsList>
							<TabsTrigger value="recent">Last {days} days</TabsTrigger>
							<TabsTrigger value="lifetime">Lifetime</TabsTrigger>
						</TabsList>
						<TabsContent value="recent">
							<section className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Rolling {days}-day window, days in UTC.
								</p>
								<StatCards totals={recentTotals} />
								<Card>
									<CardHeader>
										<CardTitle>By model</CardTitle>
									</CardHeader>
									<CardContent>
										<UsageTable rows={totals30} />
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Daily total tokens</CardTitle>
										<CardDescription>
											Stacked by model, zero-filled.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<DailyChart daily={daily} days={days} />
									</CardContent>
								</Card>
							</section>
						</TabsContent>
						<TabsContent value="lifetime">
							<section className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Total tokens across all time, per model.
								</p>
								<StatCards totals={lifetimeTotals} />
								<Card>
									<CardHeader>
										<CardTitle>By model</CardTitle>
									</CardHeader>
									<CardContent>
										<UsageTable rows={lifetime} />
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>Prompt vs completion</CardTitle>
										<CardDescription>
											Stacked tokens per model, all time.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<LifetimeChart rows={lifetime} />
									</CardContent>
								</Card>
							</section>
						</TabsContent>
					</Tabs>
				)}
			</div>
		</>
	);
}
