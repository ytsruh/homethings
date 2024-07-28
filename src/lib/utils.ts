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

export function getToken() {
  const auth = sessionStorage.getItem("auth");
  if (!auth) {
    return "";
  }
  const parsed = JSON.parse(auth);
  return parsed.token as string;
}

export function createId() {
  return Math.random().toString(14);
}
