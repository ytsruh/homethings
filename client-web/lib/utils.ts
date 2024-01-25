import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function setLocalUser(data: any) {
  await localStorage.setItem("user", JSON.stringify(data));
}

export async function getLocalUser() {
  const data = await localStorage.getItem("user");
  if (data) {
    const formatted: any = JSON.parse(data);
    return formatted;
  }
  return {};
}

export async function removeLocalUser() {
  await localStorage.removeItem("user");
}

export async function getLocalToken() {
  return await sessionStorage.getItem("token");
}

export async function removeLocalToken() {
  return await sessionStorage.removeItem("token");
}
