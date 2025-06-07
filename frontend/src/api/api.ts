import {
  createTaskSchema,
  createUserSchema,
  loginUserSchema,
  updateTaskSchema,
  type CreateTaskSchema,
  type CreateUserSchema,
  type LoginUserSchema,
  type UpdateTaskSchema,
} from "@/lib/schemas";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function registerUser(user: CreateUserSchema) {
  const validatedUser = createUserSchema.safeParse(user);
  if (!validatedUser.success) {
    return {
      success: false,
      error: `Validation failed: ${validatedUser.error.message}`,
    };
  }
  try {
    const data = {
      name: validatedUser.data.name,
      email: validatedUser.data.email,
      password: validatedUser.data.password,
      passwordConfirmation: validatedUser.data.passwordConfirmation,
    };
    const response = await api.post("/users/register", data);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}

export async function loginUser(user: LoginUserSchema) {
  const validatedUser = loginUserSchema.safeParse(user);
  if (!validatedUser.success) {
    return {
      success: false,
      error: `Validation failed: ${validatedUser.error.message}`,
    };
  }
  try {
    const response = await api.post("/users/login", validatedUser.data);
    return {
      success: response.data.success,
      message: response.data.message,
      user: response.data.data,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}

export async function createTask(task: CreateTaskSchema) {
  const validatedTask = createTaskSchema.safeParse(task);
  if (!validatedTask.success) {
    return {
      success: false,
      error: `Validation failed: ${validatedTask.error.message}`,
    };
  }
  try {
    const response = await api.post("/tasks", validatedTask.data);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}

export async function updateTask(task: UpdateTaskSchema) {
  const validatedTask = updateTaskSchema.safeParse(task);
  if (!validatedTask.success) {
    return {
      success: false,
      error: `Validation failed: ${validatedTask.error.message}`,
    };
  }
  try {
    const { id, title, description, completed, userId } = validatedTask.data;
    const response = await api.patch(`/tasks/${id}`, {
      title,
      description,
      completed,
      userId,
    });
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteTask(taskId: number, userId: number) {
  try {
    const response = await api.delete(`/tasks/${taskId}`, { data: { userId } });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}

export async function getTasks(userId: number) {
  try {
    const response = await api.get(`/tasks/${userId}`);
    return {
      success: response.data.success,
      tasks: response.data.data ?? [],
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}
