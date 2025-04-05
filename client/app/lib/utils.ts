import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import PocketBase from "pocketbase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Create a single shared Pocketbase instance
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export const stripHtmlAndTruncate = (html: string) => {
  const stripped = html.replace(/<[^>]+>/g, "");
  return stripped.length > 25 ? `${stripped.slice(0, 25)}...` : stripped;
};
