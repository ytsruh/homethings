import { z } from "zod";

export const envVariables = z.object({
  NEXT_PUBLIC_VERSION: z.string(),
  NEXT_PUBLIC_IMAGES_ENDPOINT: z.string(),
  NEXT_PUBLIC_API_BASE_URL: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
