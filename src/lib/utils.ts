import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SelectUser } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setLocalPreferences(data: SelectUser) {
  localStorage.setItem("preferences", JSON.stringify(data));
}

export function getLocalPreferences() {
  const data = localStorage.getItem("preferences");
  if (data) {
    return JSON.parse(data) as SelectUser;
  }
  return {};
}

export function removeLocalPreferences() {
  localStorage.removeItem("preferences");
}
