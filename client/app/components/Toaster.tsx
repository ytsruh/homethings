import { CircleAlert } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

/** Abstracted toast function */
export function toast(toast: Omit<ToastProps, "id">) {
	const type = toast.type || "default";
	return sonnerToast.custom((id) => (
		<Toaster
			id={id}
			title={toast.title}
			description={toast.description}
			type={type}
		/>
	));
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toaster(props: ToastProps) {
	const { title, description, type } = props;

	return (
		<Alert variant={type} className={`w-sm`}>
			<CircleAlert className={`size-4`} />
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription>{description}</AlertDescription>
		</Alert>
	);
}

interface ToastProps {
	id: string | number;
	title: string;
	description: string;
	type?: "default" | "destructive" | null;
}
