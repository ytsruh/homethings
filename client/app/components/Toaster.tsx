import { toast as toastManager } from "~/components/ui/toast";

/** Abstracted toast function (Base UI toast manager). */
export function toast(toast: Omit<ToastProps, "id">) {
	const type = toast.type || "default";
	return toastManager.add({
		title: toast.title,
		description: toast.description,
		type: type === "destructive" ? "error" : "info",
	});
}

interface ToastProps {
	id: string | number;
	title: string;
	description: string;
	type?: "default" | "destructive" | null;
}
