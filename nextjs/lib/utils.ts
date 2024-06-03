import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string) {
  const text = new TextEncoder().encode(password);
  const myDigest = await crypto.subtle.digest({ name: "SHA-256" }, text);
  const digest = Array.from(new Uint8Array(myDigest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return digest;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  const text = new TextEncoder().encode(password);
  const myDigest = await crypto.subtle.digest({ name: "SHA-256" }, text);
  const digest = Array.from(new Uint8Array(myDigest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return digest === hashedPassword;
}
