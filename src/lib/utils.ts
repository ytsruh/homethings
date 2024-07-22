import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppPreferences } from "@/types";

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
