import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SelectUser } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
