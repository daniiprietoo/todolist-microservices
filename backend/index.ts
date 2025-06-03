import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import db from "./drizzle";
import { todos, users } from "./schema/schema";
import { eq, desc } from "drizzle-orm";
import {
  registerUserSchema,
  loginUserSchema,
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
} from "./model/validation-schemas";

config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "✅ Server is running",
  });
});

app.post("/api/users/register", async (req: Request, res: Response) => {
  const parseResult = registerUserSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: "❌ Invalid input",
      errors: parseResult.error,
    });
  }
  const { name, email, password } = parseResult.data;

  try {
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (newUser.length === 0) {
      return res.status(400).json({ message: "❌ Failed to create user" });
    }

    console.log(newUser);

    return res.status(201).json({
      message: "✅ User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "❌ Internal server error",
    });
  }
});

app.post("/api/users/login", async (req: Request, res: Response) => {
  const parseResult = loginUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "❌ Invalid input",
      errors: parseResult.error,
    });
  }

  const { email, password } = parseResult.data;

  try {
    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ User not found",
      });
    }

    if (user[0].password !== password) {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid password",
      });
    }

    console.log(user[0]);

    return res.status(200).json({
      success: true,
      message: "✅ User found",
      user: user[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "❌ Internal server error",
    });
  }
});

app.get("/api/users/logout", async (req: Request, res: Response) => {
  res.status(200).json({
    message: "✅ User logged out",
  });
});

app.post("/api/tasks", async (req: Request, res: Response) => {
  const parseResult = createTaskSchema.safeParse(req.body);

  if (!parseResult.success) {
    console.log(parseResult.error);
    return res.status(400).json({
      success: false,
      message: "❌ Invalid input",
      errors: parseResult.error,
    });
  }
  const { title, description, userId } = parseResult.data;

  try {
    const newTodo = await db
      .insert(todos)
      .values({
        title,
        description,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (newTodo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ Failed to create task",
      });
    }

    console.log(newTodo[0]);

    return res.status(201).json({
      success: true,
      message: "✅ Task created successfully",
      task: newTodo[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "❌ Internal server error",
    });
  }
});

app.get("/api/tasks/:userId", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "❌ Missing userId",
    });
  }

  try {
    const user = await db.select().from(users).where(eq(users.id, userId));

    if (user.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ User not found",
      });
    }

    const tasks = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));

    if (tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "❌ No tasks found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Internal server error",
    });
  }
});

app.patch("/api/tasks/:taskId", async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.taskId);
  const parseResult = updateTaskSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: "❌ Invalid input",
      errors: parseResult.error,
    });
  }
  const { id, title, description, completed, userId } = parseResult.data;

  if (!title || !description || !userId) {
    return res.status(400).json({
      message: "❌ Missing required fields",
    });
  }

  try {
    const taskToUpdate = await db
      .select()
      .from(todos)
      .where(eq(todos.id, taskId));

    if (taskToUpdate.length === 0) {
      return res.status(400).json({
        message: "❌ Task not found",
      });
    }

    if (taskToUpdate[0].userId !== userId) {
      return res.status(400).json({
        message: "❌ Unauthorized to update this task",
      });
    }

    const updateFields: any = { title, description };
    if (typeof completed === "boolean") updateFields.completed = completed;

    const updatedTodo = await db
      .update(todos)
      .set(updateFields)
      .where(eq(todos.id, taskId))
      .returning();

    if (updatedTodo.length === 0) {
      return res.status(400).json({
        message: "❌ Failed to update task",
      });
    }

    return res.status(200).json({
      message: "✅ Task updated successfully",
      task: updatedTodo[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Internal server error",
    });
  }
});

app.delete("/api/tasks/:taskId", async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.taskId);
  const parseResult = deleteTaskSchema.safeParse({ ...req.body, taskId });
  if (!parseResult.success) {
    return res.status(400).json({
      message: "❌ Invalid input",
      errors: parseResult.error,
    });
  }
  const { userId } = parseResult.data;
  if (!taskId) {
    return res.status(400).json({
      message: "❌ Missing taskId",
    });
  }
  const taskToDelete = await db
    .select()
    .from(todos)
    .where(eq(todos.id, taskId));
  if (taskToDelete.length === 0) {
    return res.status(400).json({
      message: "❌ Task not found",
    });
  }
  if (taskToDelete[0].userId !== userId) {
    return res.status(400).json({
      message: "❌ Unauthorized to delete this task",
    });
  }
  try {
    const deletedTask = await db
      .delete(todos)
      .where(eq(todos.id, taskId))
      .returning();
    if (deletedTask.length === 0) {
      return res.status(400).json({
        message: "❌ Failed to delete task",
      });
    }
    return res.status(200).json({
      message: "✅ Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Internal server error",
    });
  }
});

app.all(/^\/api\/.*/, (req: Request, res: Response) => {
  res.status(404).json({
    message: "❌ Route not found",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
