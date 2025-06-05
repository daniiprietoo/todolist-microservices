import { createInsertSchema } from "drizzle-zod";
import { users, todos } from "../schema/schema";
import { z } from "zod";

export const userInsertSchema = createInsertSchema(users);
export const todoInsertSchema = createInsertSchema(todos);

export const registerUserValidationSchema = userInsertSchema
  .omit({ createdAt: true })
  .omit({ updatedAt: true })
  .omit({ id: true });

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createTaskValidationSchema = todoInsertSchema.pick({
  title: true,
  description: true,
  userId: true,
});

export const updateTaskValidationSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  description: z.string().min(1),
  completed: z.boolean().optional(),
  userId: z.number(),
});

export const updateTaskCompletionValidationSchema = z.object({
  taskId: z.number(),
  completed: z.boolean(),
  userId: z.number(),
});

export const deleteTaskValidationSchema = z.object({
  userId: z.number(),
});
