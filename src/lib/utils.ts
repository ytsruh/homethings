import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppPreferences } from "@/types";
import { QueryClient } from "@tanstack/react-query";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setLocalPreferences(data: AppPreferences) {
  localStorage.setItem("preferences", JSON.stringify(data));
}

export function getLocalPreferences() {
  const data = localStorage.getItem("preferences");
  if (data) {
    return JSON.parse(data) as AppPreferences;
  }
  return {} as AppPreferences;
}

export function removeLocalPreferences() {
  localStorage.removeItem("preferences");
}

export const queryClient = new QueryClient();

export function getToken(): string {
  const auth = sessionStorage.getItem("auth");
  if (!auth) {
    return "";
  }
  const parsed = JSON.parse(auth);
  return parsed.token as string;
}

// Helper function to convert Date or JSON date string to { year, month } object
export function dateToYearMonth(date: Date | string): { year: number; month: number } {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date input");
  }
  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1, // JavaScript months are 0-indexed
  };
}

// Helper function to convert year and month to Date
export function yearMonthToDate(year: number, month: number): Date {
  return new Date(year, month - 1, 1); // Subtract 1 from month for JavaScript's 0-indexing
}
