import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useFetcher, useNavigate, useNavigation } from "react-router";
import { toast } from "sonner";
import PageHeader from "~/components/PageHeader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import {
	formatCurrency,
	formatMonthDisplay,
	formatPercent,
	getCurrentYearMonth,
	getNextMonth,
	getPreviousMonth,
} from "~/lib/utils";
import {
	createAccount,
	getAccounts,
	getAllMonthsData,
	getTotals,
	upsertValue,
	type WealthAccount,
} from "~/lib/wealth";

import type { Route } from "./+types/index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
	const url = new URL(request.url);
	const monthParam = url.searchParams.get("month");
	const defaultMonth = getCurrentYearMonth();

	const month = monthParam || defaultMonth;

	const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
	if (!monthRegex.test(month)) {
		throw { redirect: `/app/wealth?month=${defaultMonth}` };
	}

	try {
		const [accountsData, allMonthsData] = await Promise.all([
			getAccounts(),
			getAllMonthsData(),
		]);

		const months = allMonthsData.map((m) => m.yearMonth).sort();

		const valuesMap: Record<string, number> = {};
		const currentData = allMonthsData.find((m) => m.yearMonth === month);
		if (currentData) {
			for (const av of currentData.accounts) {
				if (av.value !== null && av.value !== undefined) {
					valuesMap[av.account.id] = av.value;
				}
			}
		}

		const totalsResponse = await getTotals(month);

		return {
			month,
			accounts: accountsData,
			accountValues: valuesMap,
			availableMonths: months,
			totals: totalsResponse,
		};
	} catch (error) {
		console.error("Failed to load wealth data:", error);
		throw { redirect: `/app/wealth?month=${defaultMonth}` };
	}
}

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const name = formData.get("name") as string;
	const type = formData.get("type") as "asset" | "liability";
	const isLiquid = formData.get("isLiquid") === "true";

	if (!name?.trim()) {
		return { error: "Name is required", intent: "createAccount" };
	}

	try {
		await createAccount({ name, type, isLiquid });
		return { success: true, intent: "createAccount" };
	} catch (error) {
		console.error("Failed to create account:", error);
		return { error: "Failed to create account", intent: "createAccount" };
	}
}

export default function WealthPage({ loaderData }: Route.ComponentProps) {
	const { month, accounts, accountValues, totals } = loaderData;
	const createFetcher = useFetcher();
	const navigation = useNavigation();
	const navigate = useNavigate();

	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const isSubmitting = createFetcher.state !== "idle";

	useEffect(() => {
		if (createFetcher.data?.success) {
			setIsCreateOpen(false);
		}
		if (createFetcher.data?.error) {
			toast.error(createFetcher.data.error);
		}
	}, [createFetcher.data]);

	const activeAccounts = accounts.filter((a) => !a.isClosed);
	const assetAccounts = activeAccounts.filter((a) => a.type === "asset");
	const liabilityAccounts = activeAccounts.filter(
		(a) => a.type === "liability",
	);
	const closedAccounts = accounts.filter((a) => a.isClosed);

	return (
		<>
			<title>Wealth | Homethings</title>
			<meta name="description" content="Track your net worth" />
			<div className="h-full w-full overflow-y-auto">
				<PageHeader title="Wealth" subtitle="Track your net worth over time" />

				<div className="flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 items-center justify-between">
					<div className="flex items-center justify-center gap-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								navigate(`/app/wealth?month=${getPreviousMonth(month)}`)
							}
						>
							←
						</Button>
						<span className="text-lg font-semibold min-w-[140px] text-center">
							{formatMonthDisplay(month)}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								navigate(`/app/wealth?month=${getNextMonth(month)}`)
							}
						>
							→
						</Button>
					</div>
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild>
							<Button>Add Account</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Account</DialogTitle>
								<DialogDescription>
									Create a new asset or liability account.
								</DialogDescription>
							</DialogHeader>
							<createFetcher.Form method="post" className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										name="name"
										placeholder="e.g., House, Car, Savings"
									/>
								</div>
								<div className="space-y-2 flex items-center justify-between">
									<Label htmlFor="type">Type</Label>
									<Select name="type" defaultValue="asset">
										<SelectTrigger id="type">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="asset">Asset</SelectItem>
											<SelectItem value="liability">Liability</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="liquid">Liquid Asset</Label>
										<p className="text-sm text-muted-foreground">
											Include in liquid assets calculation
										</p>
									</div>
									<Switch id="liquid" name="isLiquid" value="true" />
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsCreateOpen(false)}
										>
											Cancel
										</Button>
									</DialogClose>
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Creating..." : "Create"}
									</Button>
								</DialogFooter>
							</createFetcher.Form>
						</DialogContent>
					</Dialog>
				</div>

				{navigation.state === "loading" ? (
					<div className="text-center py-12 text-muted-foreground">
						Loading...
					</div>
				) : (
					<div className="flex flex-col gap-y-5 py-2">
						{totals && (
							<div className="border rounded-lg p-4 bg-muted/50">
								<h3 className="text-lg font-semibold mb-4">Summary</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">
											Total Assets
										</p>
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
										<p className="text-sm text-muted-foreground">
											Liquid Assets
										</p>
										<p className="text-xl">
											{formatCurrency(totals.liquidAssets)}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Liquid %</p>
										<p className="text-xl">
											{totals.liquidPercent.toFixed(1)}%
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">MoM Change</p>
										<p
											className={`text-xl ${
												totals.moMChange >= 0
													? "text-theme"
													: "text-destructive"
											}`}
										>
											{formatPercent(totals.moMPercent)}
											{totals.moMChange !== null ? (
												<span className="text-sm text-muted-foreground">
													{" "}
													({formatCurrency(totals.moMChange)})
												</span>
											) : (
												<span className="text-sm text-muted-foreground"> (no prior data)</span>
											)}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">YoY Change</p>
										<p
											className={`text-xl ${
												totals.yoYPercent !== null && totals.yoYPercent >= 0
													? "text-theme"
													: "text-destructive"
											}`}
										>
											{totals.yoYPercent !== null ? (
												formatPercent(totals.yoYPercent)
											) : (
												<span className="text-sm text-muted-foreground">no prior data</span>
											)}
										</p>
									</div>
								</div>
							</div>
						)}
						<AccountSection
							title="Assets"
							accounts={assetAccounts}
							accountValues={accountValues}
							month={month}
							defaultOpen
						/>
						<AccountSection
							title="Liabilities"
							accounts={liabilityAccounts}
							accountValues={accountValues}
							month={month}
							defaultOpen
						/>
						<AccountSection
							title="Closed Accounts"
							accounts={closedAccounts}
							accountValues={accountValues}
							month={month}
							defaultOpen={false}
							muted
						/>
					</div>
				)}
			</div>
		</>
	);
}

type EditingCell = { accountId: string; value: string } | null;

function EditableAccountRow({
	account,
	value,
	editingCell,
	setEditingCell,
	month,
}: {
	account: WealthAccount;
	value: number | undefined;
	editingCell: EditingCell;
	setEditingCell: React.Dispatch<React.SetStateAction<EditingCell>>;
	month: string;
}) {
	async function handleSaveValue(accountId: string) {
		if (!editingCell) return;
		const valueStr = editingCell.value.replace(/[^0-9.-]/g, "");
		const valueInPounds = parseFloat(valueStr);
		if (Number.isNaN(valueInPounds)) {
			setEditingCell(null);
			return;
		}
		const valueInPence = Math.round(valueInPounds * 100);
		try {
			await upsertValue(accountId, month, valueInPence);
			toast.success("Value saved");
			setEditingCell(null);
		} catch (error) {
			console.error("Failed to save value:", error);
			toast.error("Failed to save value");
		}
	}

	function handleKeyDown(e: React.KeyboardEvent, accountId: string) {
		if (e.key === "Enter") {
			handleSaveValue(accountId);
		} else if (e.key === "Escape") {
			setEditingCell(null);
		}
	}

	return (
		<tr className="border-b last:border-b-0">
			<td className="p-3 font-medium flex items-center gap-2">
				<Link
					to={`/app/wealth/${account.id}/edit`}
					className="hover:text-theme"
				>
					{account.name}
				</Link>
				{account.isLiquid && (
					<Badge className="text-xs text-muted-foreground" variant="secondary">
						Liquid
					</Badge>
				)}
			</td>
			<td className="p-3 text-right">
				{editingCell?.accountId === account.id ? (
					<Input
						type="text"
						className="w-32 text-right ml-auto"
						value={editingCell.value}
						onChange={(e) =>
							setEditingCell({
								accountId: account.id,
								value: e.target.value,
							})
						}
						onKeyDown={(e) => handleKeyDown(e, account.id)}
						onBlur={() => handleSaveValue(account.id)}
						autoFocus
					/>
				) : (
					<Button
						variant="ghost"
						className="font-mono w-full justify-end"
						onClick={() =>
							setEditingCell({
								accountId: account.id,
								value: value !== undefined ? String(value / 100) : "",
							})
						}
					>
						{value !== undefined ? formatCurrency(value) : "Enter value"}
					</Button>
				)}
			</td>
		</tr>
	);
}

function ClosedAccountRow({ account }: { account: WealthAccount }) {
	return (
		<tr className="border-b last:border-b-0">
			<td className="p-3 font-medium cursor-pointer hover:text-theme">
				<Link to={`/app/wealth/${account.id}/edit`}>{account.name}</Link>
			</td>
			<td className="p-3 text-right">
				<Link
					to={`/app/wealth/${account.id}/edit`}
					className="text-sm text-muted-foreground hover:text-theme"
				>
					Restore
				</Link>
			</td>
		</tr>
	);
}

function AccountSection({
	title,
	accounts,
	accountValues,
	month,
	defaultOpen = true,
	muted = false,
}: {
	title: string;
	accounts: WealthAccount[];
	accountValues: Record<string, number>;
	month: string;
	defaultOpen?: boolean;
	muted?: boolean;
}) {
	const [editingCell, setEditingCell] = useState<EditingCell>(null);

	if (accounts.length === 0) return null;

	return (
		<Collapsible defaultOpen={defaultOpen} className="border rounded-lg p-2">
			<CollapsibleTrigger asChild>
				<div className="flex items-center justify-between cursor-pointer hover:text-theme py-2">
					<span className={`text-xl ${muted ? "text-muted-foreground" : ""}`}>
						{title}
					</span>
					<ChevronDownIcon className={muted ? "text-muted-foreground" : ""} />
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div
					className={
						muted ? "text-muted-foreground opacity-60" : "text-muted-foreground"
					}
				>
					<table className="w-full">
						<tbody>
							{accounts.map((account) =>
								muted ? (
									<ClosedAccountRow key={account.id} account={account} />
								) : (
									<EditableAccountRow
										key={account.id}
										account={account}
										value={accountValues[account.id]}
										editingCell={editingCell}
										setEditingCell={setEditingCell}
										month={month}
									/>
								),
							)}
						</tbody>
					</table>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
