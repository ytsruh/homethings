import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
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
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
	createNote,
	getNotes,
	type Note,
	type NotePriority,
} from "~/lib/notes";

export function meta() {
	return [
		{ title: "Notes | Homethings" },
		{ name: "description", content: "Your notes" },
	];
}

export async function clientLoader() {
	try {
		const notes = await getNotes();
		return { notes };
	} catch {
		return { notes: [] };
	}
}

type FilterType = "all" | "incomplete" | "completed";

export default function NotesPage({
	loaderData,
}: {
	loaderData: { notes: Note[] };
}) {
	const initialNotes = loaderData?.notes ?? [];
	const navigate = useNavigate();
	const [notes, setNotes] = useState<Note[]>(initialNotes);
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState<FilterType>("all");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newNoteTitle, setNewNoteTitle] = useState("");
	const [newNoteBody, setNewNoteBody] = useState("");
	const [newNotePriority, setNewNotePriority] =
		useState<NotePriority>("medium");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setNotes(initialNotes);
	}, [initialNotes]);

	const filteredNotes = notes
		.filter((note) => {
			if (filter === "incomplete") return !note.completed;
			if (filter === "completed") return note.completed;
			return true;
		})
		.filter((note) => {
			if (!searchQuery) return true;
			const query = searchQuery.toLowerCase();
			const titleMatch = note.title.toLowerCase().includes(query);
			const bodyMatch = note.body?.toLowerCase().includes(query);
			return titleMatch || bodyMatch;
		});

	async function handleCreateNote() {
		if (!newNoteTitle.trim()) {
			toast.error("Title is required");
			return;
		}

		setIsLoading(true);
		try {
			const newNote = await createNote(
				newNoteTitle,
				newNotePriority,
				newNoteBody || null,
			);
			setNotes((prev) => [newNote, ...prev]);
			setNewNoteTitle("");
			setNewNoteBody("");
			setNewNotePriority("medium");
			setIsCreateOpen(false);
			navigate(`/app/notes/${newNote.id}`);
		} catch (error) {
			console.error("Failed to create note:", error);
			toast.error("Failed to create note");
		} finally {
			setIsLoading(false);
		}
	}

	function truncateBody(body: string | null, maxLength: number = 100): string {
		if (!body) return "";
		if (body.length <= maxLength) return body;
		return body.slice(0, maxLength) + "...";
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Notes</h1>
					<p className="text-muted-foreground">Manage your notes and tasks</p>
				</div>

				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>New Note</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Note</DialogTitle>
							<DialogDescription>
								Add a new note to your collection.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<label htmlFor="title" className="text-sm font-medium">
									Title
								</label>
								<Input
									id="title"
									placeholder="Note title"
									value={newNoteTitle}
									onChange={(e) => setNewNoteTitle(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleCreateNote();
										}
									}}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="body" className="text-sm font-medium">
									Body (optional)
								</label>
								<Textarea
									id="body"
									placeholder="Note content..."
									value={newNoteBody}
									onChange={(e) => setNewNoteBody(e.target.value)}
									rows={4}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="priority" className="text-sm font-medium">
									Priority
								</label>
								<Select
									value={newNotePriority}
									onValueChange={(v) => setNewNotePriority(v as NotePriority)}
								>
									<SelectTrigger id="priority">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setNewNoteTitle("");
									setNewNoteBody("");
									setNewNotePriority("medium");
									setIsCreateOpen(false);
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateNote}
								disabled={isLoading || !newNoteTitle.trim()}
							>
								{isLoading ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex flex-col sm:flex-row gap-4">
				<Input
					placeholder="Search notes..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="sm:max-w-xs"
				/>
				<div className="flex gap-2">
					<Button
						variant={filter === "all" ? "default" : "outline"}
						size="sm"
						onClick={() => setFilter("all")}
					>
						All
					</Button>
					<Button
						variant={filter === "incomplete" ? "default" : "outline"}
						size="sm"
						onClick={() => setFilter("incomplete")}
					>
						Incomplete
					</Button>
					<Button
						variant={filter === "completed" ? "default" : "outline"}
						size="sm"
						onClick={() => setFilter("completed")}
					>
						Completed
					</Button>
				</div>
			</div>

			{filteredNotes.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						{searchQuery || filter !== "all"
							? "No notes match your search"
							: "No notes yet. Create your first note!"}
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredNotes.map((note) => (
						<Link
							key={note.id}
							to={`/app/notes/${note.id}`}
							className={`block ${note.completed ? "opacity-60" : ""}`}
						>
							<Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between gap-2">
										<CardTitle className="text-lg line-clamp-1">
											{note.title}
										</CardTitle>
										<Badge variant={note.completed ? "secondary" : "default"}>
											{note.completed ? "Closed" : "Open"}
										</Badge>
									</div>
									<div className="flex items-center gap-2 mt-2">
										<Badge>
											{note.priority.charAt(0).toUpperCase() +
												note.priority.slice(1)}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground line-clamp-2">
										{truncateBody(note.body)}
									</p>
									<p className="text-xs text-muted-foreground mt-2">
										{new Date(note.createdAt).toLocaleDateString()}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
