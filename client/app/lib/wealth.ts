const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getApiUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = (await response.json().catch(() => ({
			error: "An unexpected error occurred",
		}))) as { error: string };
		throw new Error(error.error || "Request failed");
	}
	return response.json() as Promise<T>;
}

export interface WealthAccount {
	id: string;
	name: string;
	type: "asset" | "liability";
	isLiquid: boolean;
	isClosed: boolean;
	createdAt: string;
}

export interface AccountWithValue {
	account: WealthAccount;
	value: AccountValue | null;
}

export interface AccountValue {
	id: string;
	accountId: string;
	yearMonth: string;
	value: number;
	createdAt: string;
}

export interface Totals {
	totalAssets: number;
	totalLiabilities: number;
	netWorth: number;
	liquidAssets: number;
	liquidPercent: number;
	moMChange: number;
	moMPercent: number;
	yoYPercent: number;
}

export type CreateAccountInput = {
	name: string;
	type: "asset" | "liability";
	isLiquid: boolean;
};

export type UpdateAccountInput = {
	name?: string;
	type?: "asset" | "liability";
	isLiquid?: boolean;
	isClosed?: boolean;
};

export async function getAccounts(): Promise<WealthAccount[]> {
	const response = await fetch(getApiUrl("/api/wealth/accounts"), {
		method: "GET",
		credentials: "include",
	});
	return handleResponse<WealthAccount[]>(response);
}

export async function createAccount(
	input: CreateAccountInput,
): Promise<WealthAccount> {
	const response = await fetch(getApiUrl("/api/wealth/accounts"), {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return handleResponse<WealthAccount>(response);
}

export async function updateAccount(
	id: string,
	input: UpdateAccountInput,
): Promise<WealthAccount> {
	const response = await fetch(getApiUrl(`/api/wealth/accounts/${id}`), {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	return handleResponse<WealthAccount>(response);
}

export async function deleteAccount(id: string): Promise<{ message: string }> {
	const response = await fetch(getApiUrl(`/api/wealth/accounts/${id}`), {
		method: "DELETE",
		credentials: "include",
	});
	return handleResponse<{ message: string }>(response);
}

export async function getValuesByMonth(
	yearMonth: string,
): Promise<AccountWithValue[]> {
	const response = await fetch(
		getApiUrl(`/api/wealth/values/${yearMonth}`),
		{
			method: "GET",
			credentials: "include",
		},
	);
	return handleResponse<AccountWithValue[]>(response);
}

export async function upsertValue(
	accountId: string,
	yearMonth: string,
	value: number,
): Promise<AccountValue> {
	const response = await fetch(getApiUrl("/api/wealth/values"), {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ accountId, yearMonth, value }),
	});
	return handleResponse<AccountValue>(response);
}

export async function getTotals(yearMonth: string): Promise<Totals> {
	const response = await fetch(getApiUrl(`/api/wealth/totals/${yearMonth}`), {
		method: "GET",
		credentials: "include",
	});
	return handleResponse<Totals>(response);
}

export type MonthData = {
	yearMonth: string;
	accounts: { account: WealthAccount; value: number | null }[];
};

export async function getAllMonthsData(): Promise<MonthData[]> {
	const response = await fetch(getApiUrl("/api/wealth/all-months"), {
		method: "GET",
		credentials: "include",
	});
	return handleResponse<MonthData[]>(response);
}