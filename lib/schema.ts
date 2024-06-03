import { z } from "zod";

export const envVariables = z.object({
  NEXT_PUBLIC_VERSION: z.string(),
  NEXT_PUBLIC_IMAGES_ENDPOINT: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters long.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  showDocuments: z.boolean(),
  showBooks: z.boolean(),
});
