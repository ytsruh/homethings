import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  labels: z.array(z.string()),
  priority: z.string(),
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      size: z.string(),
    }),
  ),
  updates: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      timestamp: z.string(),
    }),
  ),
  completed: z.boolean(),
});

export type Task = z.output<typeof taskSchema>;
