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
import { generateImage, getImageModels } from "~/lib/images";

export async function clientLoader() {
	try {
		const { models, default: defaultModel } = await getImageModels();
		return { models, defaultModel };
	} catch {
		return { models: [] as string[], defaultModel: "" };
	}
}

export default function Images() {
	const loaderData = useLoaderData<typeof clientLoader>();
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedModel, setSelectedModel] = useState<string>("");
	const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("1:1");
	const [images, setImages] = useState<string[]>([]);
	const [generationText, setGenerationText] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);

	const models = loaderData?.models ?? [];
	const defaultModel = loaderData?.defaultModel ?? "";

	const aspectRatios = [
		{ value: "1:1", label: "Square (1:1)" },
		{ value: "3:2", label: "Landscape (3:2)" },
		{ value: "3:4", label: "Portrait (3:4)" },
		{ value: "16:9", label: "Wide (16:9)" },
		{ value: "9:16", label: "Tall (9:16)" },
	];

	useEffect(() => {
		if (defaultModel && !selectedModel) {
			setSelectedModel(defaultModel);
		}
	}, [defaultModel, selectedModel]);

	async function handleGenerate() {
		if (!prompt.trim() || isLoading) return;

		setIsLoading(true);
		setImages([]);
		setGenerationText("");

		try {
			const result = await generateImage(
				prompt,
				selectedModel || undefined,
				selectedAspectRatio,
			);
			setImages(result.images);
			if (result.text) {
				setGenerationText(result.text);
			}
		} catch (error) {
			console.error("Image generation error:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to generate image",
			);
		} finally {
			setIsLoading(false);
			inputRef.current?.focus();
		}
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleGenerate();
		}
	}

	function handleDownload(imageUrl: string, index: number) {
		const link = document.createElement("a");
		link.href = imageUrl;
		link.download = `generated-image-${index + 1}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function handleClear() {
		setPrompt("");
		setImages([]);
		setGenerationText("");
		setSelectedModel(defaultModel);
		setSelectedAspectRatio("1:1");
	}

	return (
		<>
			<title>Generate Images | Homethings</title>
			<meta name="description" content="Generate images with AI" />
			<div className="flex flex-col h-full px-2 mx-auto">
				<div className="flex items-center gap-4 pb-4">
					<span className="text-sm text-muted-foreground">Model:</span>
					<Select value={selectedModel} onValueChange={setSelectedModel}>
						<SelectTrigger className="w-[300px]">
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
					<span className="text-sm text-muted-foreground">Aspect:</span>
					<Select
						value={selectedAspectRatio}
						onValueChange={setSelectedAspectRatio}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Aspect ratio" />
						</SelectTrigger>
						<SelectContent>
							{aspectRatios.map((ratio) => (
								<SelectItem key={ratio.value} value={ratio.value}>
									{ratio.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						onClick={handleClear}
						disabled={images.length === 0 && !prompt.trim()}
						className="ml-auto"
					>
						Clear
					</Button>
				</div>

				<div className="flex gap-2 pb-4">
					<Input
						ref={inputRef}
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Describe the image you want to generate..."
						disabled={isLoading}
						className="flex-1"
					/>
					<Button
						onClick={handleGenerate}
						disabled={isLoading || !prompt.trim()}
					>
						{isLoading ? "Generating..." : "Generate"}
					</Button>
				</div>

				{isLoading && (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<div className="animate-pulse text-lg mb-2">
								Generating image...
							</div>
							<p className="text-sm text-muted-foreground">
								This may take a few seconds
							</p>
						</div>
					</div>
				)}

				{!isLoading && images.length > 0 && (
					<div className="space-y-4">
						{generationText && (
							<div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-lg">
								{generationText}
							</div>
						)}
						{images[0] && (
							<div className="flex flex-col max-h-[70vh]">
								<div className="flex-1 overflow-auto flex justify-center">
									<div className="max-w-full border rounded-lg overflow-hidden bg-card">
										<img
											src={images[0]}
											alt="AI generated result"
											className="w-full h-auto max-w-full"
										/>
									</div>
								</div>
								<div className="pt-2 flex justify-center">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDownload(images[0], 0)}
									>
										Download
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				{!isLoading && images.length === 0 && prompt.trim() === "" && (
					<div className="flex items-center justify-center h-full py-12">
						<p className="text-muted-foreground">
							Enter a prompt to generate an image
						</p>
					</div>
				)}
			</div>
		</>
	);
}
