import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
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
import { Textarea } from "~/components/ui/textarea";
import {
	addComment,
	deleteComment,
	deleteNote,
	getNote,
	type NotePriority,
	updateNote,
} from "~/lib/notes";

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
		const comments = note.comments || [];
		return { note, comments };
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

	if (intent === "delete") {
		await deleteNote(noteId);
		throw redirect("/app/notes");
	}

	return { success: false, error: "Unknown action" };
}

export default function NoteDetailPage({
	loaderData,
}: {
	loaderData: Awaited<ReturnType<typeof clientLoader>>;
}) {
	const { note: initialNote, comments: initialComments } = loaderData;
	const navigate = useNavigate();

	const [note, setNote] = useState(initialNote);
	const [comments, setComments] = useState(initialComments);

	const [title, setTitle] = useState(note.title);
	const [body, setBody] = useState(note.body || "");
	const [priority, setPriority] = useState<NotePriority>(note.priority);
	const [isSaving, setIsSaving] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [isAddingComment, setIsAddingComment] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleteCommentOpen, setIsDeleteCommentOpen] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

	useEffect(() => {
		setNote(initialNote);
		setTitle(initialNote.title);
		setBody(initialNote.body || "");
		setPriority(initialNote.priority);
		setComments(initialComments);
	}, [initialNote, initialComments]);

	async function handleSave() {
		setIsSaving(true);
		try {
			const updatedNote = await updateNote(note.id, {
				title,
				body: body || null,
				priority,
			});
			setNote(updatedNote);
			toast.success("Note saved");
		} catch (error) {
			console.error("Failed to save note:", error);
			toast.error("Failed to save note");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleToggleComplete() {
		try {
			const updatedNote = await updateNote(note.id, {
				completed: !note.completed,
			});
			setNote(updatedNote);
		} catch (error) {
			console.error("Failed to update note:", error);
			toast.error("Failed to update note");
		}
	}

	async function handleDelete() {
		try {
			await deleteNote(note.id);
			toast.success("Note deleted");
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
			const comment = await addComment(note.id, newComment);
			setComments((prev) => [comment, ...prev]);
			setNewComment("");
			toast.success("Comment added");
		} catch (error) {
			console.error("Failed to add comment:", error);
			toast.error("Failed to add comment");
		} finally {
			setIsAddingComment(false);
		}
	}

	function openDeleteCommentDialog(commentId: string) {
		setCommentToDelete(commentId);
		setIsDeleteCommentOpen(true);
	}

	async function handleDeleteComment() {
		if (!commentToDelete) return;

		try {
			await deleteComment(note.id, commentToDelete);
			setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
			toast.success("Comment deleted");
		} catch (error) {
			console.error("Failed to delete comment:", error);
			toast.error("Failed to delete comment");
		} finally {
			setIsDeleteCommentOpen(false);
			setCommentToDelete(null);
		}
	}

	return (
		<>
			<title>Notes | Homethings</title>
			<meta name="description" content="View and edit note" />
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

				<div className="space-y-6">
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
									<div className="flex items-center justify-between gap-4">
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
										<Select
											value={note.completed ? "closed" : "open"}
											onValueChange={(value) => {
												const newCompleted = value === "closed";
												if (newCompleted !== note.completed) {
													handleToggleComplete();
												}
											}}
										>
											<SelectTrigger className="w-[120px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="open">Open</SelectItem>
												<SelectItem value="closed">Closed</SelectItem>
											</SelectContent>
										</Select>
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
											<div className="border-b py-1 last:border-0 flex items-center justify-between">
												<div>
													<p className="text-sm">{comment.comment}</p>
													<span className="text-xs text-muted-foreground">
														{new Date(comment.createdAt).toLocaleString()}
													</span>
												</div>

												<Button
													variant="ghost"
													size="sm"
													className="h-6 text-xs text-destructive hover:text-destructive"
													onClick={() => openDeleteCommentDialog(comment.id)}
												>
													Delete
												</Button>
											</div>
										</React.Fragment>
									))}
								</ScrollArea>
							)}
						</CardContent>
					</Card>
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

				<Dialog
					open={isDeleteCommentOpen}
					onOpenChange={setIsDeleteCommentOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Comment</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this comment? This action cannot
								be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDeleteCommentOpen(false)}
							>
								Cancel
							</Button>
							<Button variant="destructive" onClick={handleDeleteComment}>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}
