import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function setLocalUser(data: User) {
  await localStorage.setItem("user", JSON.stringify(data));
}

export async function getLocalUser() {
  const data = await localStorage.getItem("user");
  if (data) {
    const formatted: User = JSON.parse(data);
    return formatted;
  }
  return {};
}

export async function removeLocalUser() {
  await localStorage.removeItem("user");
}
