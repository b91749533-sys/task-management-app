import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  dueDate: z.string().optional().nullable().or(z.literal("")),
  categoryId: z.string().optional().nullable().or(z.literal("")),
  labelsString: z.string().optional().or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskSchema>;
