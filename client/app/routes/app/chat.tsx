import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart } from "ai";
import {
	ArrowUp,
	Check,
	ChevronDown,
	History,
	ImagePlus,
	Pencil,
	Plus,
	Square,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Remark } from "react-remark";
import { useNavigate, useParams } from "react-router";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "~/components/ui/attachment";
import { Bubble, BubbleContent } from "~/components/ui/bubble";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "~/components/ui/input-group";
import { Message, MessageContent } from "~/components/ui/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "~/components/ui/message-scroller";
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

interface PendingAttachment {
	dataUrl: string;
	mediaType: string;
	filename: string;
	size: number;
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

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
	const [historyOpen, setHistoryOpen] = useState(false);
	const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null);
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
	const canSend =
		(Boolean(input.trim()) || attachments.length > 0) && !isGenerating;

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
		setHistoryOpen(false);
		navigate("/app/chat");
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
		const next: PendingAttachment[] = [];
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
					size: file.size,
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
		setAttachments([]);
		setIsDragging(false);
		const files: FileUIPart[] = attachments.map((a) => ({
			type: "file",
			mediaType: a.mediaType,
			filename: a.filename,
			url: a.dataUrl,
		}));
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
			formRef.current?.requestSubmit();
		}
	}

	function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
		const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
			f.type.startsWith("image/"),
		);
		if (files.length === 0) return;
		event.preventDefault();
		handleFiles(files);
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
			<div className="flex w-full max-w-5xl mx-auto flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-8rem)]">
				<PageHeader
					title="Chat"
					subtitle="Ask the Homethings assistant anything"
				/>

				<div className="flex items-center justify-end gap-2 py-2 shrink-0">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleNewChat}
						disabled={messages.length === 0 && !error}
						title="Clear conversation and start over"
						className="shrink-0"
					>
						<Plus className="size-4" />
						<span className="hidden sm:inline">New chat</span>
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setHistoryOpen(true)}
						title="Open chat history"
						className="shrink-0"
					>
						<History className="size-4" />
						<span className="hidden sm:inline">History</span>
					</Button>
				</div>

				<div className="flex-1 min-h-0">
					<MessageScrollerProvider
						autoScroll
						defaultScrollPosition="last-anchor"
					>
						<MessageScroller>
							<MessageScrollerViewport>
								<MessageScrollerContent>
									{messages.length === 0 && (
										<MessageScrollerItem messageId="empty-state">
											<p className="text-sm text-muted-foreground text-center py-8">
												Start a conversation below. Chats are saved to your
												history.
											</p>
										</MessageScrollerItem>
									)}
									{messages.map((message) => {
										const isUser = message.role === "user";
										const imgs = imagesOf(message);
										return (
											<MessageScrollerItem
												key={message.id}
												messageId={message.id}
												scrollAnchor={isUser}
											>
												<Message align={isUser ? "end" : "start"}>
													<MessageContent>
														{isUser ? (
															<Bubble align="end" variant="muted">
																<BubbleContent>
																	{imgs.length > 0 && (
																		<span className="flex flex-wrap gap-2 pb-2">
																			{imgs.map((img) => (
																				<img
																					key={img.url}
																					src={img.url}
																					alt={img.filename || "Uploaded image"}
																					className="max-h-40 max-w-full rounded-md object-cover"
																				/>
																			))}
																		</span>
																	)}
																	<span className="whitespace-pre-wrap">
																		{textOf(message)}
																	</span>
																</BubbleContent>
															</Bubble>
														) : (
															<div className="prose prose-sm dark:prose-invert max-w-none break-words text-foreground prose-p:my-1 prose-headings:my-2 prose-pre:my-2 [&_pre]:overflow-x-auto">
																<Remark>
																	{textOf(message) || (isGenerating ? "…" : "")}
																</Remark>
															</div>
														)}
													</MessageContent>
												</Message>
											</MessageScrollerItem>
										);
									})}
									{status === "submitted" &&
										messages.at(-1)?.role === "user" && (
											<MessageScrollerItem messageId="typing-indicator">
												<Message>
													<MessageContent>
														<div className="bg-muted rounded-lg px-4 py-2 w-fit">
															<LoadingSpinner className="size-5" />
														</div>
													</MessageContent>
												</Message>
											</MessageScrollerItem>
										)}
								</MessageScrollerContent>
							</MessageScrollerViewport>
							<MessageScrollerButton />
						</MessageScroller>
					</MessageScrollerProvider>
				</div>

				<form
					ref={formRef}
					onSubmit={handleSubmit}
					className="bg-background py-3 shrink-0"
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
					<InputGroup
						onDragOver={(e) => {
							e.preventDefault();
							if (supportsImages && !isGenerating) setIsDragging(true);
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={(e) => {
							e.preventDefault();
							setIsDragging(false);
							if (supportsImages && !isGenerating && e.dataTransfer.files) {
								handleFiles(e.dataTransfer.files);
							}
						}}
						className={cn(
							isDragging && "border-primary ring-2 ring-primary/30",
						)}
					>
						{attachments.length > 0 && (
							<InputGroupAddon align="block-start">
								<div className="flex flex-wrap gap-2">
									{attachments.map((a) => (
										<Attachment key={a.dataUrl} size="sm">
											<AttachmentMedia variant="image">
												<img src={a.dataUrl} alt={a.filename} />
											</AttachmentMedia>
											<AttachmentContent>
												<AttachmentTitle>{a.filename}</AttachmentTitle>
												<AttachmentDescription>
													{a.mediaType.split("/")[1]?.toUpperCase()} ·{" "}
													{formatBytes(a.size)}
												</AttachmentDescription>
											</AttachmentContent>
											<AttachmentActions>
												<AttachmentAction
													aria-label={`Remove ${a.filename}`}
													onClick={() => removeAttachment(a.dataUrl)}
												>
													<X />
												</AttachmentAction>
											</AttachmentActions>
										</Attachment>
									))}
								</div>
							</InputGroupAddon>
						)}
						<InputGroupTextarea
							rows={1}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleInputKeyDown}
							onPaste={handlePaste}
							placeholder={
								isDragging
									? "Drop images to attach…"
									: "Type a message... (Enter to send, Shift+Enter for a new line)"
							}
							disabled={isGenerating}
							aria-label="Chat message"
							className="max-h-40 overflow-y-auto"
						/>
						<InputGroupAddon align="block-end">
							<InputGroupButton
								size="icon-sm"
								variant="outline"
								className="rounded-full"
								aria-label={
									supportsImages
										? "Attach images (max 5, 5MB each)"
										: "Images need a vision-capable model"
								}
								title={
									supportsImages
										? "Attach images (max 5, 5MB each)"
										: "Pick a vision-capable model to attach images"
								}
								onClick={() => fileInputRef.current?.click()}
								disabled={
									!supportsImages ||
									isGenerating ||
									attachments.length >= MAX_IMAGES
								}
							>
								<ImagePlus />
							</InputGroupButton>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<InputGroupButton
											size="sm"
											disabled={models.length === 0 || isGenerating}
											aria-label="Pick a model"
											className="ml-auto"
										/>
									}
								>
									{selectedModelEntry?.label ?? "Loading models..."}
									<ChevronDown />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuRadioGroup
										value={selectedModel}
										onValueChange={handleModelChange}
									>
										{models.map((model) => (
											<DropdownMenuRadioItem key={model.id} value={model.id}>
												<span className="flex items-center gap-2">
													{model.label}
													{model.supportsImages && (
														<ImagePlus className="size-3.5 text-muted-foreground" />
													)}
												</span>
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
							{isGenerating ? (
								<InputGroupButton
									size="icon-sm"
									variant="default"
									className="rounded-full"
									aria-label="Stop generating"
									onClick={stop}
								>
									<Square />
								</InputGroupButton>
							) : (
								<InputGroupButton
									type="submit"
									size="icon-sm"
									variant="default"
									className="rounded-full"
									disabled={!canSend}
									aria-label="Send"
								>
									<ArrowUp />
								</InputGroupButton>
							)}
						</InputGroupAddon>
					</InputGroup>
				</form>
			</div>

			<Drawer
				swipeDirection="right"
				open={historyOpen}
				onOpenChange={setHistoryOpen}
			>
				<DrawerContent>
					<DrawerHeader>
						<div className="flex items-center justify-between">
							<DrawerTitle>History</DrawerTitle>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleNewChat}
								title="Start a new chat"
							>
								<Plus className="size-4" />
							</Button>
						</div>
						<DrawerDescription>Your saved chats.</DrawerDescription>
					</DrawerHeader>
					<div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
						<div className="flex flex-col gap-1">
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
												onClick={() => {
													setHistoryOpen(false);
													navigate(`/app/chat/${s.id}`);
												}}
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
					</div>
				</DrawerContent>
			</Drawer>

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
