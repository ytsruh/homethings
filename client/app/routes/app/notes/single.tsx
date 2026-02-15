import {
	Archive,
	File,
	FileText,
	Image,
	Paperclip,
	Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
	addComment,
	deleteComment,
	deleteNote,
	formatFileSize,
	getAttachments,
	getNote,
	getNoteComments,
	type NotePriority,
	setNoteComplete,
	updateNote,
} from "~/lib/notes";

export function meta() {
	return [
		{ title: "Notes | Homethings" },
		{ name: "description", content: "View and edit note" },
	];
}

export async function clientLoader({
	params,
}: {
	params: Promise<{ noteId: string }>;
}) {
	const { noteId } = await params;
	try {
		const note = await getNote(noteId);
		if (!note) {
			throw redirect("/app/notes");
		}
		const attachments = await getAttachments(noteId);
		const comments = await getNoteComments(noteId);
		return { note, attachments, comments };
	} catch {
		throw redirect("/app/notes");
	}
}

export async function clientAction({
	request,
	params,
}: {
	request: Request;
	params: Promise<{ noteId: string }>;
}) {
	const { noteId } = await params;
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "update") {
		const title = formData.get("title") as string;
		const body = formData.get("body") as string;
		const priority = formData.get("priority") as NotePriority;
		const note = await updateNote(noteId, {
			title,
			body,
			priority: priority || undefined,
		});
		return { success: true, note };
	}

	if (intent === "toggleComplete") {
		const completed = formData.get("completed") === "true";
		const note = await setNoteComplete(noteId, completed);
		return { success: true, note };
	}

	if (intent === "delete") {
		await deleteNote(noteId);
		return redirect("/app/notes");
	}

	if (intent === "addComment") {
		const commentText = formData.get("comment") as string;
		if (!commentText?.trim()) {
			return { success: false, error: "Comment cannot be empty" };
		}
		const comment = await addComment(noteId, commentText);
		return { success: true, comment };
	}

	if (intent === "deleteComment") {
		const commentId = formData.get("commentId") as string;
		await deleteComment(noteId, commentId);
		return { success: true };
	}

	return { success: false, error: "Unknown action" };
}

function FileIcon({ fileType }: { fileType: string }) {
	if (fileType.startsWith("image/")) {
		return <Image className="h-4 w-4" />;
	}
	if (fileType === "application/pdf") {
		return <FileText className="h-4 w-4" />;
	}
	if (fileType.includes("word") || fileType.includes("document")) {
		return <File className="h-4 w-4" />;
	}
	if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
		return <File className="h-4 w-4" />;
	}
	if (fileType.includes("text")) {
		return <FileText className="h-4 w-4" />;
	}
	if (fileType.includes("zip") || fileType.includes("archive")) {
		return <Archive className="h-4 w-4" />;
	}
	return <Paperclip className="h-4 w-4" />;
}

export default function NoteDetailPage({
	loaderData,
}: {
	loaderData: Awaited<ReturnType<typeof clientLoader>>;
}) {
	const {
		note: initialNote,
		attachments: initialAttachments,
		comments: initialComments,
	} = loaderData;
	const navigate = useNavigate();

	const [note, setNote] = useState(initialNote);
	const [attachments, setAttachments] = useState(initialAttachments);
	const [comments, setComments] = useState(initialComments);

	const [title, setTitle] = useState(note.title);
	const [body, setBody] = useState(note.body || "");
	const [priority, setPriority] = useState<NotePriority>(note.priority);
	const [isSaving, setIsSaving] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [isAddingComment, setIsAddingComment] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	useEffect(() => {
		setNote(initialNote);
		setTitle(initialNote.title);
		setBody(initialNote.body || "");
		setPriority(initialNote.priority);
		setAttachments(initialAttachments);
		setComments(initialComments);
	}, [initialNote, initialAttachments, initialComments]);

	async function handleSave() {
		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.set("intent", "update");
			formData.set("title", title);
			formData.set("body", body);
			formData.set("priority", priority);

			const response = await fetch("", {
				method: "POST",
				body: formData,
			});
			const result = await response.json();

			if (result.success) {
				setNote(result.note);
				toast.success("Note saved");
			} else {
				toast.error(result.error || "Failed to save note");
			}
		} catch (error) {
			console.error("Failed to save note:", error);
			toast.error("Failed to save note");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleToggleComplete() {
		try {
			const formData = new FormData();
			formData.set("intent", "toggleComplete");
			formData.set("completed", String(!note.completed));

			const response = await fetch("", {
				method: "POST",
				body: formData,
			});
			const result = await response.json();

			if (result.success) {
				setNote(result.note);
			} else {
				toast.error(result.error || "Failed to update note");
			}
		} catch (error) {
			console.error("Failed to update note:", error);
			toast.error("Failed to update note");
		}
	}

	async function handleDelete() {
		if (!confirm("Are you sure you want to delete this note?")) {
			return;
		}

		try {
			const formData = new FormData();
			formData.set("intent", "delete");

			await fetch("", {
				method: "POST",
				body: formData,
			});

			navigate("/app/notes");
		} catch (error) {
			console.error("Failed to delete note:", error);
			toast.error("Failed to delete note");
		}
	}

	async function handleAddComment() {
		if (!newComment.trim()) {
			toast.error("Comment cannot be empty");
			return;
		}

		setIsAddingComment(true);
		try {
			const formData = new FormData();
			formData.set("intent", "addComment");
			formData.set("comment", newComment);

			const response = await fetch("", {
				method: "POST",
				body: formData,
			});
			const result = await response.json();

			if (result.success) {
				setComments((prev) => [result.comment, ...prev]);
				setNewComment("");
				toast.success("Comment added");
			} else {
				toast.error(result.error || "Failed to add comment");
			}
		} catch (error) {
			console.error("Failed to add comment:", error);
			toast.error("Failed to add comment");
		} finally {
			setIsAddingComment(false);
		}
	}

	async function handleDeleteComment(commentId: string) {
		if (!confirm("Delete this comment?")) {
			return;
		}

		try {
			const formData = new FormData();
			formData.set("intent", "deleteComment");
			formData.set("commentId", commentId);

			await fetch("", {
				method: "POST",
				body: formData,
			});

			setComments((prev) => prev.filter((c) => c.id !== commentId));
			toast.success("Comment deleted");
		} catch (error) {
			console.error("Failed to delete comment:", error);
			toast.error("Failed to delete comment");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/app/notes">← Back</Link>
				</Button>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => setIsDeleteOpen(true)}
				>
					<Trash2 className="h-4 w-4 mr-2" />
					Delete
				</Button>
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				<div className="flex-1 space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 space-y-4">
									<Input
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Note title"
										className="text-xl font-bold"
									/>
									<div className="flex items-center gap-4">
										<Select
											value={priority}
											onValueChange={(v) => setPriority(v as NotePriority)}
										>
											<SelectTrigger className="w-[140px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">Low</SelectItem>
												<SelectItem value="medium">Medium</SelectItem>
												<SelectItem value="high">High</SelectItem>
												<SelectItem value="urgent">Urgent</SelectItem>
											</SelectContent>
										</Select>
										<Badge>
											{priority.charAt(0).toUpperCase() + priority.slice(1)}
										</Badge>
										<div className="flex items-center gap-2">
											<Switch
												id="completed"
												checked={note.completed}
												onCheckedChange={handleToggleComplete}
											/>
											<label htmlFor="completed" className="text-sm">
												{note.completed ? "Closed" : "Open"}
											</label>
										</div>
									</div>
								</div>
								<Button onClick={handleSave} disabled={isSaving}>
									{isSaving ? "Saving..." : "Save"}
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<Textarea
								value={body}
								onChange={(e) => setBody(e.target.value)}
								placeholder="Write your note..."
								className="min-h-[100px]"
							/>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Textarea
									value={newComment}
									onChange={(e) => setNewComment(e.target.value)}
									placeholder="Add a comment..."
								/>
								<Button
									onClick={handleAddComment}
									disabled={isAddingComment || !newComment.trim()}
									size="sm"
									className="w-full"
								>
									{isAddingComment ? "Adding..." : "Add Comment"}
								</Button>
							</div>

							{comments.length === 0 ? (
								<p className="text-sm text-muted-foreground">No comments yet</p>
							) : (
								<ScrollArea className="max-h-48 overflow-auto">
									{comments.map((comment) => (
										<React.Fragment key={comment.id}>
											<div className="border-b pb-3 last:border-0">
												<p className="text-sm">{comment.comment}</p>
												<div className="flex items-center justify-between mt-1">
													<span className="text-xs text-muted-foreground">
														{new Date(comment.createdAt).toLocaleString()}
													</span>
													<Button
														variant="ghost"
														size="sm"
														className="h-6 text-xs text-destructive hover:text-destructive"
														onClick={() => handleDeleteComment(comment.id)}
													>
														Delete
													</Button>
												</div>
											</div>
										</React.Fragment>
									))}
								</ScrollArea>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="w-full lg:w-80 shrink-0">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Attachments</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{attachments.length === 0 ? (
								<p className="text-sm text-muted-foreground">No attachments</p>
							) : (
								<ul className="space-y-2">
									{attachments.map((attachment) => (
										<li
											key={attachment.id}
											className="flex items-center gap-2 text-sm"
										>
											<FileIcon fileType={attachment.fileType} />
											<span className="flex-1 truncate">
												{attachment.fileName}
											</span>
											<span className="text-muted-foreground text-xs">
												{formatFileSize(attachment.fileSize)}
											</span>
										</li>
									))}
								</ul>
							)}
							<Button variant="outline" size="sm" className="w-full" disabled>
								<Paperclip className="h-4 w-4 mr-2" />
								Add Attachment
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Note</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this note? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
