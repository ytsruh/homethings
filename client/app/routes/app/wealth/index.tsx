import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
	formatCurrency,
	formatPercent,
	getCurrentYearMonth,
	getNextMonth,
	getPreviousMonth,
	formatMonthDisplay,
} from "~/lib/utils";
import {
	createAccount,
	getAccounts,
	getAllMonthsData,
	getTotals,
	type Totals,
	upsertValue,
	type WealthAccount,
} from "~/lib/wealth";

export default function WealthPage() {
	const navigate = useNavigate();
	const [currentMonth, setCurrentMonth] = useState(getCurrentYearMonth());
	const [accounts, setAccounts] = useState<WealthAccount[]>([]);
	const [accountValues, setAccountValues] = useState<Record<string, number>>(
		{},
	);
	const [totals, setTotals] = useState<Totals | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [editingCell, setEditingCell] = useState<{
		accountId: string;
		value: string;
	} | null>(null);
	const [availableMonths, setAvailableMonths] = useState<string[]>([]);

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newAccountName, setNewAccountName] = useState("");
	const [newAccountType, setNewAccountType] = useState<"asset" | "liability">(
		"asset",
	);
	const [newAccountLiquid, setNewAccountLiquid] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		loadData();
	}, [currentMonth]);

	async function loadData() {
		setIsLoading(true);
		try {
			const [accountsData, allMonthsData] = await Promise.all([
				getAccounts(),
				getAllMonthsData(),
			]);
			setAccounts(accountsData);

			const months = allMonthsData.map((m) => m.yearMonth).sort();
			setAvailableMonths(months);

			const valuesMap: Record<string, number> = {};
			const currentData = allMonthsData.find(
				(m) => m.yearMonth === currentMonth,
			);
			if (currentData) {
				for (const av of currentData.accounts) {
					if (av.value !== null && av.value !== undefined) {
						valuesMap[av.account.id] = av.value;
					}
				}
			}
			setAccountValues(valuesMap);

			const totalsResponse = await getTotals(currentMonth);
			setTotals(totalsResponse);
		} catch (error) {
			console.error("Failed to load data:", error);
			toast.error("Failed to load wealth data");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleCreateAccount() {
		if (!newAccountName.trim()) {
			toast.error("Name is required");
			return;
		}
		setIsCreating(true);
		try {
			await createAccount({
				name: newAccountName,
				type: newAccountType,
				isLiquid: newAccountLiquid,
			});
			toast.success("Account created");
			setIsCreateOpen(false);
			setNewAccountName("");
			setNewAccountType("asset");
			setNewAccountLiquid(false);
			await loadData();
		} catch (error) {
			console.error("Failed to create account:", error);
			toast.error("Failed to create account");
		} finally {
			setIsCreating(false);
		}
	}

	function startEditing(accountId: string, currentValue: number | undefined) {
		setEditingCell({
			accountId,
			value: currentValue !== undefined ? String(currentValue / 100) : "",
		});
	}

	async function handleSaveValue(accountId: string) {
		if (!editingCell) return;
		const valueStr = editingCell.value.replace(/[^0-9.-]/g, "");
		const valueInPounds = parseFloat(valueStr);
		if (isNaN(valueInPounds)) {
			setEditingCell(null);
			return;
		}
		const valueInPence = Math.round(valueInPounds * 100);
		try {
			await upsertValue(accountId, currentMonth, valueInPence);
			toast.success("Value saved");
			setEditingCell(null);
			await loadData();
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

	const activeAccounts = accounts.filter((a) => !a.isClosed);
	const assetAccounts = activeAccounts.filter((a) => a.type === "asset");
	const liabilityAccounts = activeAccounts.filter(
		(a) => a.type === "liability",
	);

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
							onClick={() => setCurrentMonth(getPreviousMonth(currentMonth))}
						>
							←
						</Button>
						<span className="text-lg font-semibold min-w-[140px] text-center">
							{formatMonthDisplay(currentMonth)}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentMonth(getNextMonth(currentMonth))}
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
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										placeholder="e.g., House, Car, Savings"
										value={newAccountName}
										onChange={(e) => setNewAccountName(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="type">Type</Label>
									<div className="flex gap-4">
										<Button
											type="button"
											variant={
												newAccountType === "asset" ? "default" : "outline"
											}
											onClick={() => setNewAccountType("asset")}
										>
											Asset
										</Button>
										<Button
											type="button"
											variant={
												newAccountType === "liability" ? "default" : "outline"
											}
											onClick={() => setNewAccountType("liability")}
										>
											Liability
										</Button>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="liquid">Liquid Asset</Label>
										<p className="text-sm text-muted-foreground">
											Include in liquid assets calculation
										</p>
									</div>
									<Switch
										id="liquid"
										checked={newAccountLiquid}
										onCheckedChange={setNewAccountLiquid}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsCreateOpen(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleCreateAccount} disabled={isCreating}>
									{isCreating ? "Creating..." : "Create"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{isLoading ? (
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
											{formatCurrency(totals.moMChange)} (
											{formatPercent(totals.moMPercent)})
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">YoY Change</p>
										<p
											className={`text-xl ${
												totals.yoYPercent >= 0
													? "text-theme"
													: "text-destructive"
											}`}
										>
											{formatPercent(totals.yoYPercent)}
										</p>
									</div>
								</div>
							</div>
						)}
						{assetAccounts.length > 0 && (
							<Collapsible defaultOpen className="border rounded-lg p-2">
								<CollapsibleTrigger asChild>
									<div className="flex items-center justify-between cursor-pointer hover:text-theme py-2">
										<span className="text-xl">Assets</span>
										<ChevronDownIcon />
									</div>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className="text-muted-foreground">
										<table className="w-full">
											<tbody>
												{assetAccounts.map((account) => (
													<tr
														key={account.id}
														className="border-b last:border-b-0"
													>
														<td
															className="p-3 font-medium cursor-pointer hover:text-theme flex items-center gap-2"
															onClick={() => navigate(`/app/wealth/${account.id}/edit`)}
														>
															{account.name}
															{account.isLiquid && (
																<Badge
																	className="text-xs text-muted-foreground"
																	variant="secondary"
																>
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
																	onKeyDown={(e) =>
																		handleKeyDown(e, account.id)
																	}
																	onBlur={() => handleSaveValue(account.id)}
																	autoFocus
																/>
															) : (
																<Button
																	variant="ghost"
																	className="font-mono w-full justify-end"
																	onClick={() =>
																		startEditing(
																			account.id,
																			accountValues[account.id],
																		)
																	}
																>
																	{accountValues[account.id] !== undefined
																		? formatCurrency(accountValues[account.id])
																		: "Enter value"}
																</Button>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</CollapsibleContent>
							</Collapsible>
						)}

						{liabilityAccounts.length > 0 && (
							<Collapsible defaultOpen className="border rounded-lg p-2">
								<CollapsibleTrigger asChild>
									<div className="flex items-center justify-between cursor-pointer hover:text-theme py-2">
										<span className="text-xl">Liabilities</span>
										<ChevronDownIcon />
									</div>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className="text-muted-foreground">
										<table className="w-full">
											<tbody>
												{liabilityAccounts.map((account) => (
													<tr
														key={account.id}
														className="border-b last:border-b-0"
													>
														<td
															className="p-3 font-medium cursor-pointer hover:text-theme"
															onClick={() => navigate(`/app/wealth/${account.id}/edit`)}
														>
															{account.name}
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
																	onKeyDown={(e) =>
																		handleKeyDown(e, account.id)
																	}
																	onBlur={() => handleSaveValue(account.id)}
																	autoFocus
																/>
															) : (
																<Button
																	variant="ghost"
																	className="font-mono w-full justify-end"
																	onClick={() =>
																		startEditing(
																			account.id,
																			accountValues[account.id],
																		)
																	}
																>
																	{accountValues[account.id] !== undefined
																		? formatCurrency(accountValues[account.id])
																		: "Enter value"}
																</Button>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</CollapsibleContent>
							</Collapsible>
						)}

						{accounts.filter((a) => a.isClosed).length > 0 && (
							<Collapsible className="border rounded-lg p-2">
								<CollapsibleTrigger asChild>
									<div className="flex items-center justify-between cursor-pointer text-muted-foreground hover:text-theme py-2">
										<span className="text-xl">Closed Accounts</span>
										<ChevronDownIcon className="" />
									</div>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className="text-muted-foreground opacity-60">
										<table className="w-full">
											<tbody>
												{accounts
													.filter((a) => a.isClosed)
													.map((account) => (
														<tr
															key={account.id}
															className="border-b last:border-b-0"
														>
															<td
																className="p-3 font-medium cursor-pointer hover:text-theme"
																onClick={() => navigate(`/app/wealth/${account.id}/edit`)}
															>
																{account.name}
															</td>
															<td className="p-3 text-right">
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => navigate(`/app/wealth/${account.id}/edit`)}
																>
																	Restore
																</Button>
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
								</CollapsibleContent>
							</Collapsible>
						)}
					</div>
				)}
			</div>
		</>
	);
}
