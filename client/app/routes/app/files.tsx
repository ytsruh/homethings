import { useEffect, useId, useRef, useState } from "react";
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
	deleteFile,
	type FileItem,
	getFileDownloadUrl,
	getFiles,
	getUploadUrl,
	uploadFile,
} from "~/lib/files";

export function meta() {
	return [
		{ title: "Files | Homethings" },
		{ name: "description", content: "Your files" },
	];
}

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

function getFileIcon(fileType: string): string {
	if (fileType.startsWith("image/")) return "🖼️";
	if (fileType.startsWith("video/")) return "🎬";
	if (fileType.startsWith("audio/")) return "🎵";
	if (fileType.includes("pdf")) return "📄";
	if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
	return "📎";
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

	const handleDelete = async (file: FileItem) => {
		try {
			await deleteFile(file.id);
			toast({ title: "Success", description: "File deleted successfully" });
			revalidator.revalidate();
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
		<>
			<PageHeader
				title="Files"
				subtitle="Manage your files"
				actions={
					<div className="flex items-center gap-2">
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
				}
			/>
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
								<TableHead className="w-[50px]"></TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Size</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{files.map((file) => (
								<TableRow key={file.id}>
									<TableCell className="font-medium text-xl">
										{getFileIcon(file.fileType)}
									</TableCell>
									<TableCell>{file.fileName}</TableCell>
									<TableCell>{formatFileSize(file.fileSize)}</TableCell>
									<TableCell>{file.fileType}</TableCell>
									<TableCell>{formatDate(file.createdAt)}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDownload(file)}
											>
												Download
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDelete(file)}
											>
												Delete
											</Button>
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
