import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SelectUser } from "@/db/schema";

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

export async function setLocalUser(data: SelectUser) {
  await localStorage.setItem("user", JSON.stringify(data));
}

export async function removeLocalUser() {
  await localStorage.removeItem("user");
}

export const filterUserData = async (data: SelectUser) => {
  return {
    name: data.name,
    email: data.email,
    profileImage: data.profileImage,
    showDocuments: data.showDocuments,
    showBooks: data.showBooks,
  };
};

export const filterOutPassword = (array: Array<SelectUser>) => {
  const filtered = array.map((data: SelectUser) => {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      accountId: data.accountId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
  return filtered;
};
