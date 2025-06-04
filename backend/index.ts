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
import { asyncHandler } from "./utils/asyncHandler";
import { errorHandler } from "./middleware/errorHandler";
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
  InternalServerError,
} from "./utils/errors";
import { logger } from "./utils/logger";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { rateLimit } from "express-rate-limit";

// Extend Express Request to include id
declare module "express-serve-static-core" {
  interface Request {
    id?: string;
  }
}

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

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
});

const apiLimiter = rateLimit({
  
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use("/api", apiLimiter);

app.get("/", (req: Request, res: Response) => {
  logger.info(`[${req.id}] Health check`);
  res.status(200).json({
    message: "✅ Server is running",
    requestId: req.id,
  });
});

app.post(
  "/api/users/register",
  asyncHandler(async (req: Request, res: Response) => {
    const parseResult = registerUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("❌ Invalid input");
    }
    const { name, email, password } = parseResult.data;
    // Check for existing email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new ConflictError("❌ Email already registered");
    }
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    if (newUser.length === 0) {
      throw new AppError("❌ Failed to create user", 400);
    }
    logger.info(`[${req.id}] User registered: ${email}`);
    res.status(201).json({
      message: "✅ User created successfully",
      requestId: req.id,
    });
  })
);

app.post(
  "/api/users/login",
  asyncHandler(async (req: Request, res: Response) => {
    const parseResult = loginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("❌ Invalid input");
    }
    const { email, password } = parseResult.data;
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      throw new NotFoundError("❌ Invalid Credentials");
    }
    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      throw new UnauthorizedError("❌ Invalid Credentials");
    }
    logger.info(`[${req.id}] User login: ${email}`);
    res.status(200).json({
      success: true,
      message: "✅ User found",
      user: { id: user[0].id, name: user[0].name, email: user[0].email },
      requestId: req.id,
    });
  })
);

app.get(
  "/api/users/logout",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info(`[${req.id}] User logged out`);
    res.status(200).json({
      success: true,
      message: "✅ User logged out",
      requestId: req.id,
    });
  })
);

app.post(
  "/api/tasks",
  asyncHandler(async (req: Request, res: Response) => {
    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("❌ Invalid input");
    }
    const { title, description, userId } = parseResult.data;
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
      throw new AppError("❌ Failed to create task", 400);
    }
    logger.info(`[${req.id}] Task created for user ${userId}: ${title}`);
    res.status(201).json({
      success: true,
      message: "✅ Task created successfully",
      task: newTodo[0],
      requestId: req.id,
    });
  })
);

app.get(
  "/api/tasks/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (!userId) {
      throw new ValidationError("❌ Missing userId");
    }
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user.length === 0) {
      throw new NotFoundError("❌ User not found");
    }
    const tasks = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));
    logger.info(`[${req.id}] Tasks fetched for user ${userId}`);
    res.status(200).json({
      success: true,
      message: "✅ Tasks fetched successfully",
      tasks,
      requestId: req.id,
    });
  })
);

app.patch(
  "/api/tasks/:taskId",
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseInt(req.params.taskId);
    const request = {
      ...req.body,
      id: taskId,
    };
    const parseResult = updateTaskSchema.safeParse(request);
    if (!parseResult.success) {
      throw new ValidationError("❌ Invalid input");
    }
    const { id, title, description, completed, userId } = parseResult.data;
    if (!title || !description || !userId) {
      throw new ValidationError("❌ Missing required fields");
    }
    const taskToUpdate = await db
      .select()
      .from(todos)
      .where(eq(todos.id, taskId));
    if (taskToUpdate.length === 0) {
      throw new NotFoundError("❌ Task not found");
    }
    if (taskToUpdate[0].userId !== userId) {
      throw new ForbiddenError("❌ Unauthorized to update this task");
    }
    const updateFields: any = { title, description };
    if (typeof completed === "boolean") updateFields.completed = completed;
    const updatedTodo = await db
      .update(todos)
      .set(updateFields)
      .where(eq(todos.id, taskId))
      .returning();

    if (updatedTodo.length === 0) {
      throw new AppError(`❌ Failed to update task`, 400);
    }

    logger.info(`[${req.id}] Task updated: ${taskId}`);
    res.status(200).json({
      success: true,
      message: "✅ Task updated successfully",
      task: updatedTodo[0],
      requestId: req.id,
    });
  })
);

app.delete(
  "/api/tasks/:taskId",
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = parseInt(req.params.taskId);
    const parseResult = deleteTaskSchema.safeParse({ ...req.body, taskId });
    if (!parseResult.success) {
      throw new ValidationError("❌ Invalid input");
    }
    const { userId } = parseResult.data;
    if (!taskId) {
      throw new ValidationError("❌ Missing taskId");
    }
    const taskToDelete = await db
      .select()
      .from(todos)
      .where(eq(todos.id, taskId));
    if (taskToDelete.length === 0) {
      throw new NotFoundError("❌ Task not found");
    }
    if (taskToDelete[0].userId !== userId) {
      throw new ForbiddenError("❌ Unauthorized to delete this task");
    }
    const deletedTask = await db
      .delete(todos)
      .where(eq(todos.id, taskId))
      .returning();
    if (deletedTask.length === 0) {
      throw new AppError("❌ Failed to delete task", 400);
    }
    logger.info(`[${req.id}] Task deleted: ${taskId}`);
    res.status(200).json({
      success: true,
      message: "✅ Task deleted successfully",
      requestId: req.id,
    });
  })
);

// Catch-all 404 for /api/* routes
app.all(/^\/api\/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError("❌ Route not found"));
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
});
