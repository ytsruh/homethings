import {
	Download,
	File,
	FileText,
	Folder,
	Image,
	Music,
	Paperclip,
	Trash,
	Video,
} from "lucide-react";
import { type ReactElement, useEffect, useId, useRef, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import PageHeader from "~/components/PageHeader";
import { toast } from "~/components/Toaster";
import { Button } from "~/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	deleteFile,
	type FileItem,
	getFileDownloadUrl,
	getFiles,
	getUploadUrl,
	uploadFile,
} from "~/lib/files";

export async function clientLoader() {
	try {
		const files = await getFiles();
		return { files };
	} catch {
		return { files: [] };
	}
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function getFileIcon(fileType: string): ReactElement {
	if (fileType.startsWith("image/")) return <Image />;
	if (fileType.startsWith("video/")) return <Video />;
	if (fileType.startsWith("audio/")) return <Music />;
	if (fileType.includes("pdf")) return <File />;
	if (fileType.includes("markdown")) return <FileText />;
	if (fileType.includes("zip") || fileType.includes("archive"))
		return <Folder />;
	return <Paperclip />;
}

type DeleteFileModalProps = {
	file: FileItem;
	onDeleted: () => void;
};

function DeleteFileModal({ file, onDeleted }: DeleteFileModalProps) {
	const handleDelete = async () => {
		try {
			await deleteFile(file.id);
			toast({ title: "Success", description: "File deleted successfully" });
			onDeleted();
		} catch (error) {
			console.error("Failed to delete file:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to delete file",
				type: "destructive",
			});
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="destructive" size="sm">
					<Trash className="sm:hidden" />
					<span className="hidden sm:inline">Delete</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete File</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{file.fileName}"? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button variant="destructive" onClick={handleDelete}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default function FilesPage() {
	const initialData = useLoaderData<typeof clientLoader>();
	const revalidator = useRevalidator();
	const [files, setFiles] = useState<FileItem[]>(initialData.files);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const fileInputId = useId();

	useEffect(() => {
		setFiles(initialData.files);
	}, [initialData.files]);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			toast({
				title: "Error",
				description: "File size must be less than 10MB",
				type: "destructive",
			});
			return;
		}

		setIsUploading(true);
		try {
			const { presignedUrl } = await getUploadUrl(
				file.name,
				file.type,
				file.size,
			);
			await uploadFile(presignedUrl, file);
			toast({ title: "Success", description: "File uploaded successfully" });
			revalidator.revalidate();
		} catch (error) {
			console.error("Failed to upload file:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to upload file",
				type: "destructive",
			});
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleDownload = async (file: FileItem) => {
		try {
			const { presignedUrl } = await getFileDownloadUrl(file.id);
			window.open(presignedUrl, "_blank");
		} catch (error) {
			console.error("Failed to download file:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error ? error.message : "Failed to download file",
				type: "destructive",
			});
		}
	};

	return (
		<>
			<title>Files | Homethings</title>
			<meta name="description" content="Your files" />
			<PageHeader title="Files" subtitle="Manage your files" />
			<div className="py-2 flex items-center justify-end gap-2">
				<input
					ref={fileInputRef}
					type="file"
					id={fileInputId}
					className="hidden"
					onChange={handleUpload}
					disabled={isUploading}
				/>
				<Button asChild>
					<label htmlFor={fileInputId} className="cursor-pointer">
						{isUploading ? "Uploading..." : "Upload File"}
					</label>
				</Button>
			</div>
			{files.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
					<p className="text-lg">No files yet</p>
					<p className="text-sm">Upload a file to get started</p>
				</div>
			) : (
				<div className="border rounded-md">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12 hidden md:table-cell"></TableHead>
								<TableHead>Name</TableHead>
								<TableHead className="hidden sm:table-cell">Size</TableHead>
								<TableHead className="hidden sm:table-cell">Type</TableHead>
								<TableHead className="hidden sm:table-cell">Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{files.map((file) => (
								<TableRow key={file.id}>
									<TableCell className="font-medium text-xl hidden md:table-cell">
										{getFileIcon(file.fileType)}
									</TableCell>
									<TableCell>{file.fileName}</TableCell>
									<TableCell className="hidden sm:table-cell">
										{formatFileSize(file.fileSize)}
									</TableCell>
									<TableCell className="hidden sm:table-cell max-w-0 truncate">
										{file.fileType}
									</TableCell>
									<TableCell className="hidden sm:table-cell">
										{formatDate(file.createdAt)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDownload(file)}
											>
												<Download className="sm:hidden" />
												<span className="hidden sm:inline">Download</span>
											</Button>
											<DeleteFileModal
												file={file}
												onDeleted={() => revalidator.revalidate()}
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</>
	);
}
