import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return date.toLocaleDateString("en-US", options);
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: "GBP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value / 100);
}

export function formatPercent(value: number): string {
	return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function getCurrentYearMonth(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

export function getNextMonth(yearMonth: string): string {
	const [year, month] = yearMonth.split("-").map(Number);
	if (month === 12) {
		return `${year + 1}-01`;
	}
	return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function getPreviousMonth(yearMonth: string): string {
	const [year, month] = yearMonth.split("-").map(Number);
	if (month === 1) {
		return `${year - 1}-12`;
	}
	return `${year}-${String(month - 1).padStart(2, "0")}`;
}

export function formatMonthDisplay(yearMonth: string): string {
	const [year, month] = yearMonth.split("-");
	const date = new Date(Number(year), Number(month) - 1);
	return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
