import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { RotateCcw, SendHorizontal, Square } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import PageHeader from "~/components/PageHeader";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const MODEL_STORAGE_KEY = "homethings-chat-model";

interface ChatModel {
	id: string;
	label: string;
	blurb: string;
}

function renderText(message: { parts: unknown }): string {
	const parts = message.parts as Array<{ type: string; text?: string }>;
	return parts
		.filter((part) => part.type === "text" && part.text)
		.map((part) => part.text as string)
		.join("\n");
}

export default function Chat() {
	const [input, setInput] = useState("");
	const [models, setModels] = useState<ChatModel[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>("");
	const modelInputId = useId();
	const messagesRef = useRef<HTMLDivElement>(null);
	const {
		messages,
		sendMessage,
		setMessages,
		status,
		error,
		stop,
		regenerate,
		clearError,
	} = useChat({
			transport: new DefaultChatTransport({
				api: `${API_BASE_URL}/api/chat`,
				credentials: "include",
			}),
		});

	const isGenerating = status === "submitted" || status === "streaming";

	useEffect(() => {
		let cancelled = false;
		async function loadModels() {
			try {
				const response = await fetch(`${API_BASE_URL}/api/chat/models`, {
					credentials: "include",
				});
				if (!response.ok) return;
				const data = (await response.json()) as {
					default: string;
					models: ChatModel[];
				};
				if (cancelled || !Array.isArray(data.models)) return;
				setModels(data.models);
				const stored = localStorage.getItem(MODEL_STORAGE_KEY);
				const valid = data.models.some((m) => m.id === stored);
				setSelectedModel(valid ? (stored as string) : data.default);
			} catch {
				// Model list is optional; the server falls back to its default.
			}
		}
		loadModels();
		return () => {
			cancelled = true;
		};
	}, []);

	function handleModelChange(model: string) {
		setSelectedModel(model);
		localStorage.setItem(MODEL_STORAGE_KEY, model);
	}

	function handleReset() {
		stop();
		clearError();
		setMessages([]);
		setInput("");
	}

	useEffect(() => {
		if (messages.length === 0 && status === "ready") return;
		const el = messagesRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [messages, status]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const text = input.trim();
		if (!text || isGenerating) return;
		clearError();
		setInput("");
		await sendMessage(
			{ text },
			selectedModel ? { body: { model: selectedModel } } : undefined,
		);
	}

	return (
		<>
			<title>Chat | Homethings</title>
			<meta name="description" content="Chat with Homethings assistant" />
			<div className="flex flex-col w-full max-w-3xl mx-auto h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-8rem)]">
				<PageHeader
					title="Chat"
					subtitle="Ask the Homethings assistant anything"
				/>

				<div className="flex items-center gap-2 py-2 shrink-0">
					<Label htmlFor={modelInputId} className="text-sm shrink-0">
						Model
					</Label>
					<Select
						value={selectedModel}
						onValueChange={handleModelChange}
						disabled={models.length === 0 || isGenerating}
					>
						<SelectTrigger id={modelInputId} className="w-full max-w-xs">
							<SelectValue placeholder="Loading models..." />
						</SelectTrigger>
						<SelectContent>
							{models.map((model) => (
								<SelectItem key={model.id} value={model.id}>
									{model.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{models.find((m) => m.id === selectedModel)?.blurb && (
						<span className="text-xs text-muted-foreground hidden sm:inline">
							{models.find((m) => m.id === selectedModel)?.blurb}
						</span>
					)}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleReset}
						disabled={messages.length === 0 && !error}
						title="Clear conversation and start over"
						className="ml-auto shrink-0"
					>
						<RotateCcw className="size-4" />
						<span className="hidden sm:inline">New chat</span>
					</Button>
				</div>

				<div
					ref={messagesRef}
					className="flex flex-col gap-4 py-2 pr-1 flex-1 min-h-0 overflow-y-auto"
					aria-live="polite"
				>
					{messages.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">
							Start a conversation below. History is not saved between visits.
						</p>
					)}
					{messages.map((message) => {
						const isUser = message.role === "user";
						return (
							<div
								key={message.id}
								className={cn(
									"flex w-full",
									isUser ? "justify-end" : "justify-start",
								)}
							>
								<div
									className={cn(
										"max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap",
										isUser
											? "bg-primary text-primary-foreground"
											: "bg-muted text-foreground",
									)}
								>
									{renderText(message) || (isGenerating ? "…" : "")}
								</div>
							</div>
						);
					})}
					{status === "submitted" && messages.at(-1)?.role === "user" && (
						<div className="flex justify-start">
							<div className="bg-muted rounded-lg px-4 py-2">
								<LoadingSpinner className="size-5" />
							</div>
						</div>
					)}
				</div>

				{error && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive flex items-center justify-between gap-2 my-2">
						<span>Something went wrong: {error.message}</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								clearError();
								regenerate();
							}}
						>
							Retry
						</Button>
					</div>
				)}

				<form
					onSubmit={handleSubmit}
					className="flex items-center gap-2 bg-background py-3 shrink-0"
				>
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message..."
						disabled={isGenerating}
						aria-label="Chat message"
					/>
					{isGenerating ? (
						<Button type="button" variant="outline" onClick={stop}>
							<Square className="size-4" />
							<span className="sr-only">Stop generating</span>
						</Button>
					) : (
						<Button type="submit" disabled={!input.trim()}>
							<SendHorizontal className="size-4" />
							<span className="sr-only">Send message</span>
						</Button>
					)}
				</form>
			</div>
		</>
	);
}
