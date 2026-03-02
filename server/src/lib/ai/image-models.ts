export const imageModels = [
	"google/gemini-3.1-flash-image-preview",
	"sourceful/riverflow-v2-standard-preview",
	"sourceful/riverflow-v2-fast",
	"sourceful/riverflow-v2-pro",
	"black-forest-labs/flux.2-klein-4b",
	"bytedance-seed/seedream-4.5",
	"openai/gpt-5-image-mini",
	"openai/gpt-5-image",
];

export const defaultImageModel = "google/gemini-3.1-flash-image-preview";

export function isImageModel(model: string): boolean {
	return imageModels.includes(model);
}
