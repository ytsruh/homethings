import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart } from "ai";
import {
	Check,
	History,
	ImagePlus,
	Pencil,
	RotateCcw,
	SendHorizontal,
	Square,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Remark } from "react-remark";
import { useNavigate, useParams } from "react-router";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
	type ChatHistoryMessage,
	type ChatModel,
	type ChatSession,
	deleteChatSession,
	getChatSession,
	listChatSessions,
	renameChatSession,
} from "~/lib/chat";
import { cn } from "~/lib/utils";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const MODEL_STORAGE_KEY = "homethings-chat-model";
const SESSION_HEADER = "X-Chat-Session-Id";

// Image upload limits mirror the backend (api/internal/ai/types.go).
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];

interface Attachment {
	dataUrl: string;
	mediaType: string;
	filename: string;
}

type ChatPart = {
	type: string;
	text?: string;
	mediaType?: string;
	filename?: string;
	url?: string;
};

function textOf(message: { parts: unknown }): string {
	const parts = message.parts as ChatPart[];
	return (parts ?? [])
		.filter((part) => part.type === "text" && part.text)
		.map((part) => part.text as string)
		.join("\n");
}

function imagesOf(message: { parts: unknown }): ChatPart[] {
	const parts = message.parts as ChatPart[];
	return (parts ?? []).filter(
		(part) => part.type === "file" && typeof part.url === "string",
	);
}

function readFileAsDataURL(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error("Failed to read image file"));
		reader.readAsDataURL(file);
	});
}

export default function Chat() {
	const { sessionId } = useParams();
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [models, setModels] = useState<ChatModel[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>("");
	const [sessions, setSessions] = useState<ChatSession[]>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const modelInputId = useId();
	const messagesRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	// Session created server-side during a stream on /app/chat (no id yet).
	// Navigated to once the stream finishes.
	const pendingSessionRef = useRef<string | null>(null);
	const activeSessionRef = useRef<string | undefined>(undefined);
	activeSessionRef.current = sessionId;

	const refreshSessions = useCallback(async () => {
		try {
			setSessions(await listChatSessions());
		} catch {
			// Session list is optional; chat still works without it.
		}
	}, []);

	// chatFetch unwraps the backend's {code, message} error JSON into a
	// user-safe Error, so raw provider details never reach the UI. It also
	// captures the session id header the server sets per turn.
	async function chatFetch(
		input: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> {
		const response = await fetch(input, init);
		if (!response.ok) {
			let message = "The AI service failed. Please try again.";
			try {
				const data = (await response.json()) as { message?: unknown };
				if (typeof data.message === "string" && data.message) {
					message = data.message;
				}
			} catch {
				// Fall through with the default message.
			}
			throw new Error(message);
		}
		const created = response.headers.get(SESSION_HEADER);
		if (created && !activeSessionRef.current) {
			pendingSessionRef.current = created;
		}
		return response;
	}

	const {
		messages,
		sendMessage,
		setMessages,
		status,
		error,
		stop,
		clearError,
	} = useChat({
		transport: new DefaultChatTransport({
			api: `${API_BASE_URL}/api/chat`,
			credentials: "include",
			fetch: chatFetch,
		}),
		onError: (err) => {
			toast({
				title: "Chat failed",
				description: err.message || "Something went wrong.",
				type: "destructive",
			});
		},
	});

	const isGenerating = status === "submitted" || status === "streaming";
	const selectedModelEntry = models.find((m) => m.id === selectedModel);
	const supportsImages = selectedModelEntry?.supportsImages ?? false;

	function requestBody() {
		return {
			...(selectedModel ? { model: selectedModel } : {}),
			...(sessionId ? { sessionId } : {}),
		};
	}

	useEffect(() => {
		let cancelled = false;
		async function loadModels() {
			try {
				const { getChatModels } = await import("~/lib/chat");
				const data = await getChatModels();
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
		refreshSessions();
		return () => {
			cancelled = true;
		};
	}, [refreshSessions]);

	// Load session history when the route session changes. A freshly created
	// session (navigated to after streaming) already holds its messages, so
	// the fetch is skipped to avoid a flicker.
	useEffect(() => {
		if (!sessionId) {
			setMessages([]);
			return;
		}
		if (pendingSessionRef.current === sessionId) {
			pendingSessionRef.current = null;
			refreshSessions();
			return;
		}
		let cancelled = false;
		async function loadSession() {
			try {
				const detail = await getChatSession(sessionId as string);
				if (cancelled) return;
				setSelectedModel(detail.session.model);
				setMessages(
					detail.messages.map((m: ChatHistoryMessage) => ({
						id: m.id,
						role: m.role as "user" | "assistant",
						parts: m.parts,
					})) as never,
				);
			} catch {
				if (!cancelled) navigate("/app/chat", { replace: true });
			}
		}
		loadSession();
		return () => {
			cancelled = true;
		};
	}, [sessionId, navigate, refreshSessions, setMessages]);

	function handleModelChange(model: string) {
		setSelectedModel(model);
		localStorage.setItem(MODEL_STORAGE_KEY, model);
	}

	function handleNewChat() {
		stop();
		clearError();
		setMessages([]);
		setInput("");
		setAttachments([]);
		pendingSessionRef.current = null;
		navigate("/app/chat");
	}

	useEffect(() => {
		if (messages.length === 0 && status === "ready") return;
		const viewport = messagesRef.current?.querySelector(
			'[data-slot="scroll-area-viewport"]',
		);
		if (viewport) viewport.scrollTop = viewport.scrollHeight;
	}, [messages, status]);

	function autoresizeTextarea(el: HTMLTextAreaElement | null) {
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
	}

	function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
		setInput(event.target.value);
		autoresizeTextarea(event.target);
	}

	async function handleFiles(files: FileList | File[]) {
		const incoming = Array.from(files);
		if (attachments.length + incoming.length > MAX_IMAGES) {
			toast({
				title: "Too many images",
				description: `Max ${MAX_IMAGES} images per message.`,
				type: "destructive",
			});
			return;
		}
		const next: Attachment[] = [];
		for (const file of incoming) {
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				toast({
					title: "Unsupported image type",
					description: "Use JPEG, PNG, WebP or GIF.",
					type: "destructive",
				});
				continue;
			}
			if (file.size > MAX_IMAGE_BYTES) {
				toast({
					title: "Image too large",
					description: `${file.name || "Image"} exceeds 5MB.`,
					type: "destructive",
				});
				continue;
			}
			try {
				next.push({
					dataUrl: await readFileAsDataURL(file),
					mediaType: file.type,
					filename: file.name || "image",
				});
			} catch {
				toast({
					title: "Could not read image",
					description: file.name || "Image",
					type: "destructive",
				});
			}
		}
		if (next.length > 0) {
			setAttachments((prev) => [...prev, ...next].slice(0, MAX_IMAGES));
		}
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	function removeAttachment(dataUrl: string) {
		setAttachments((prev) => prev.filter((a) => a.dataUrl !== dataUrl));
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		await sendCurrent();
	}

	async function sendCurrent() {
		const text = input.trim();
		if ((!text && attachments.length === 0) || isGenerating) return;
		if (attachments.length > 0 && !supportsImages) {
			toast({
				title: "Images not supported",
				description: "Pick a vision-capable model to send images.",
				type: "destructive",
			});
			return;
		}
		clearError();
		setInput("");
		if (inputRef.current) inputRef.current.style.height = "auto";
		const files: FileUIPart[] = attachments.map((a) => ({
			type: "file",
			mediaType: a.mediaType,
			filename: a.filename,
			url: a.dataUrl,
		}));
		setAttachments([]);
		const body = requestBody();
		if (text) {
			await sendMessage(
				files.length > 0 ? { text, files } : { text },
				Object.keys(body).length > 0 ? { body } : undefined,
			);
		} else {
			await sendMessage(
				{ files },
				Object.keys(body).length > 0 ? { body } : undefined,
			);
		}
		// A new chat was persisted server-side; move to its URL.
		if (!sessionId && pendingSessionRef.current) {
			const created = pendingSessionRef.current;
			pendingSessionRef.current = null;
			refreshSessions();
			navigate(`/app/chat/${created}`, { replace: true });
		} else {
			refreshSessions();
		}
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (
			event.key === "Enter" &&
			!event.shiftKey &&
			!event.nativeEvent.isComposing
		) {
			event.preventDefault();
			sendCurrent();
		}
	}

	async function handleRename(id: string) {
		const title = renameValue.trim();
		if (!title) {
			setRenamingId(null);
			return;
		}
		try {
			await renameChatSession(id, title);
			setRenamingId(null);
			refreshSessions();
		} catch {
			toast({
				title: "Rename failed",
				description: "Could not rename this chat.",
				type: "destructive",
			});
		}
	}

	async function handleDelete() {
		if (!deleteId) return;
		try {
			await deleteChatSession(deleteId);
			setDeleteId(null);
			if (deleteId === sessionId) {
				navigate("/app/chat");
			} else {
				refreshSessions();
			}
		} catch {
			toast({
				title: "Delete failed",
				description: "Could not delete this chat.",
				type: "destructive",
			});
		}
	}

	return (
		<>
			<title>Chat | Homethings</title>
			<meta name="description" content="Chat with Homethings assistant" />
			<div className="flex w-full max-w-5xl mx-auto gap-4 h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-8rem)]">
				<aside
					className={cn(
						"shrink-0 w-64 border-r pr-3 flex-col gap-2 overflow-hidden",
						showHistory ? "flex" : "hidden lg:flex",
					)}
				>
					<div className="flex items-center justify-between pt-1">
						<span className="text-sm font-medium">History</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleNewChat}
							title="Start a new chat"
						>
							<RotateCcw className="size-4" />
						</Button>
					</div>
					<ScrollArea className="flex-1 min-h-0">
						<div className="flex flex-col gap-1 py-1">
							{sessions.length === 0 && (
								<p className="text-xs text-muted-foreground px-1 py-2">
									No saved chats yet.
								</p>
							)}
							{sessions.map((s) => (
								<div
									key={s.id}
									className={cn(
										"group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
										s.id === sessionId && "bg-muted",
									)}
								>
									{renamingId === s.id ? (
										<>
											<Input
												value={renameValue}
												onChange={(e) => setRenameValue(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleRename(s.id);
													if (e.key === "Escape") setRenamingId(null);
												}}
												className="h-7 text-sm"
												autoFocus
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-7 w-7 p-0"
												onClick={() => handleRename(s.id)}
											>
												<Check className="size-3.5" />
											</Button>
										</>
									) : (
										<>
											<button
												type="button"
												className="flex-1 min-w-0 text-left truncate"
												onClick={() => navigate(`/app/chat/${s.id}`)}
												title={s.title}
											>
												{s.title}
											</button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
												title="Rename chat"
												onClick={() => {
													setRenamingId(s.id);
													setRenameValue(s.title);
												}}
											>
												<Pencil className="size-3.5" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
												title="Delete chat"
												onClick={() => setDeleteId(s.id)}
											>
												<Trash2 className="size-3.5" />
											</Button>
										</>
									)}
								</div>
							))}
						</div>
					</ScrollArea>
				</aside>

				<div className="flex flex-col flex-1 min-w-0">
					<PageHeader
						title="Chat"
						subtitle="Ask the Homethings assistant anything"
					/>

					<div className="flex items-center gap-2 py-2 shrink-0">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="lg:hidden shrink-0"
							onClick={() => setShowHistory((v) => !v)}
							title="Toggle chat history"
						>
							<History className="size-4" />
						</Button>
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
						{selectedModelEntry?.blurb && (
							<span className="text-xs text-muted-foreground hidden sm:inline">
								{selectedModelEntry.blurb}
							</span>
						)}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleNewChat}
							disabled={messages.length === 0 && !error}
							title="Clear conversation and start over"
							className="ml-auto shrink-0"
						>
							<RotateCcw className="size-4" />
							<span className="hidden sm:inline">New chat</span>
						</Button>
					</div>

					<div ref={messagesRef} className="flex-1 min-h-0">
						<ScrollArea className="h-full">
							<div className="flex flex-col gap-4 py-2 pr-3" aria-live="polite">
								{messages.length === 0 && (
									<p className="text-sm text-muted-foreground text-center py-8">
										Start a conversation below. Chats are saved to your history.
									</p>
								)}
								{messages.map((message) => {
									const isUser = message.role === "user";
									const imgs = imagesOf(message);
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
													"max-w-[85%] rounded-lg px-4 py-2 text-sm",
													isUser
														? "bg-primary text-primary-foreground"
														: "bg-muted text-foreground",
												)}
											>
												{imgs.length > 0 && (
													<div className="flex flex-wrap gap-2 pb-2">
														{imgs.map((img) => (
															<img
																key={img.url}
																src={img.url}
																alt={img.filename || "Uploaded image"}
																className="max-h-40 max-w-full rounded-md object-cover"
															/>
														))}
													</div>
												)}
												{isUser ? (
													<span className="whitespace-pre-wrap">
														{textOf(message)}
													</span>
												) : (
													<div className="prose prose-sm dark:prose-invert max-w-none break-words text-foreground prose-p:my-1 prose-headings:my-2 prose-pre:my-2 [&_pre]:overflow-x-auto">
														<Remark>
															{textOf(message) || (isGenerating ? "…" : "")}
														</Remark>
													</div>
												)}
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
						</ScrollArea>
					</div>

					{attachments.length > 0 && (
						<div className="flex flex-wrap gap-2 py-2 shrink-0">
							{attachments.map((a) => (
								<div key={a.dataUrl} className="relative">
									<img
										src={a.dataUrl}
										alt={a.filename}
										className="h-16 w-16 rounded-md object-cover border"
									/>
									<button
										type="button"
										onClick={() => removeAttachment(a.dataUrl)}
										className="absolute -top-2 -right-2 rounded-full bg-background border p-0.5"
										title="Remove image"
									>
										<X className="size-3.5" />
									</button>
								</div>
							))}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="flex items-end gap-2 bg-background py-3 shrink-0"
					>
						<input
							ref={fileInputRef}
							type="file"
							accept={ACCEPTED_IMAGE_TYPES.join(",")}
							multiple
							className="hidden"
							onChange={(e) => {
								if (e.target.files) handleFiles(e.target.files);
							}}
						/>
						{supportsImages && !isGenerating && (
							<Button
								type="button"
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								title="Attach images (max 5, 5MB each)"
								disabled={attachments.length >= MAX_IMAGES}
							>
								<ImagePlus className="size-4" />
								<span className="sr-only">Attach images</span>
							</Button>
						)}
						<Textarea
							ref={inputRef}
							rows={1}
							value={input}
							onChange={handleInputChange}
							onKeyDown={handleInputKeyDown}
							placeholder="Type a message... (Enter to send, Shift+Enter for a new line)"
							disabled={isGenerating}
							aria-label="Chat message"
							className="max-h-40 overflow-y-auto resize-none"
						/>
						{isGenerating ? (
							<Button type="button" variant="outline" onClick={stop}>
								<Square className="size-4" />
								<span className="sr-only">Stop generating</span>
							</Button>
						) : (
							<Button
								type="submit"
								disabled={!input.trim() && attachments.length === 0}
							>
								<SendHorizontal className="size-4" />
								<span className="sr-only">Send message</span>
							</Button>
						)}
					</form>
				</div>
			</div>

			<Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete chat</DialogTitle>
						<DialogDescription>
							This chat will be hidden. Its messages and usage records are kept.
							This cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteId(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
