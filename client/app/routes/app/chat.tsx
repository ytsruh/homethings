import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	type ChatMessage,
	getAvailableModels,
	streamChatMessage,
} from "~/lib/chat";

export function meta() {
	return [
		{ title: "Chat | Homethings" },
		{ name: "description", content: "Chat with AI" },
	];
}

export async function clientLoader() {
	try {
		const { models, default: defaultModel } = await getAvailableModels();
		return { models, defaultModel };
	} catch {
		return { models: [] as string[], defaultModel: "" };
	}
}

export default function Chat() {
	const loaderData = useLoaderData<typeof clientLoader>();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedModel, setSelectedModel] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const messageIdRef = useRef(0);

	const models = loaderData?.models ?? [];
	const defaultModel = loaderData?.defaultModel ?? "";

	useEffect(() => {
		if (defaultModel && !selectedModel) {
			setSelectedModel(defaultModel);
		}
	}, [defaultModel, selectedModel]);

	useEffect(() => {
		if (messages.length > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages.length]);

	async function handleSendMessage() {
		if (!input.trim() || isLoading) return;

		const userMessageId = ++messageIdRef.current;
		const userMessage: ChatMessage = {
			id: userMessageId,
			role: "user",
			content: input,
		};
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		let streamError: Error | null = null;

		try {
			const response = await streamChatMessage(
				[...messages, userMessage],
				selectedModel || undefined,
			);

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("Response body is not readable");
			}

			let assistantMessage = "";
			const assistantMessageId = ++messageIdRef.current;
			const assistantMsg: ChatMessage = {
				id: assistantMessageId,
				role: "assistant",
				content: "",
			};
			setMessages((prev) => [...prev, assistantMsg]);

			while (true) {
				let result: ReadableStreamReadResult<Uint8Array>;
				try {
					result = await reader.read();
				} catch (readError) {
					streamError =
						readError instanceof Error
							? readError
							: new Error(String(readError));
					break;
				}

				const { done, value } = result;
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });

				if (chunk.toLowerCase().includes("error") || chunk.includes("{")) {
					try {
						const parsed = JSON.parse(chunk);
						if (parsed.error) {
							streamError = new Error(parsed.error);
							break;
						}
					} catch {
						// Not JSON, treat as regular text
					}
				}

				assistantMessage += chunk;
				setMessages((prev) => {
					const updated = [...prev];
					const lastMsg = updated[updated.length - 1];
					if (lastMsg?.role === "assistant") {
						lastMsg.content = assistantMessage;
					}
					return updated;
				});
			}
		} catch (error) {
			console.error("Chat error:", error);
			streamError =
				error instanceof Error ? error : new Error("Failed to send message");
		} finally {
			setIsLoading(false);

			if (streamError) {
				setMessages((prev) => {
					const updated = [...prev];
					if (
						updated[updated.length - 1]?.role === "assistant" &&
						updated[updated.length - 1]?.content === ""
					) {
						updated.pop();
					}
					return updated;
				});
				toast.error(streamError.message);
			}

			inputRef.current?.focus();
		}
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	}

	return (
		<div className="flex flex-col h-full px-2 mx-auto">
			<div className="flex items-center gap-4 pb-4">
				<span className="text-sm text-muted-foreground">Model:</span>
				<Select value={selectedModel} onValueChange={setSelectedModel}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Select model" />
					</SelectTrigger>
					<SelectContent>
						{models.map((model) => (
							<SelectItem key={model} value={model}>
								{model}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex-1 max-h-[80vh] md:max-h-[72vh] overflow-y-auto space-y-4 p-4 border rounded-lg bg-card/50">
				{messages.length === 0 && (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">
							Start a conversation with the AI
						</p>
					</div>
				)}
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[80%] rounded-lg px-4 py-2 ${
								msg.role === "user" ? "bg-theme text-white" : "bg-muted"
							}`}
						>
							<div className="text-sm font-medium mb-1">
								{msg.role === "user" ? "You" : "Assistant"}
							</div>
							<div className="whitespace-pre-wrap">{msg.content}</div>
						</div>
					</div>
				))}
				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-muted rounded-lg px-4 py-2">
							<div className="text-sm font-medium mb-1">Assistant</div>
							<div className="flex items-center gap-2">
								<span className="animate-pulse">Thinking...</span>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className="pt-4 flex gap-2">
				<Input
					ref={inputRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type a message..."
					disabled={isLoading}
					className="flex-1"
				/>
				<Button
					onClick={handleSendMessage}
					disabled={isLoading || !input.trim()}
				>
					{isLoading ? "Sending..." : "Send"}
				</Button>
			</div>
		</div>
	);
}
