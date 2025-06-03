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
  if (validatedUser.success) {
    const data = {
      name: validatedUser.data.name,
      email: validatedUser.data.email,
      password: validatedUser.data.password,
    };
    const response = await api.post("/users/register", data);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  }
  return {
    success: false,
    error: `Failed to register user: ${validatedUser.error.message}`,
  };
}

export async function loginUser(user: LoginUserSchema) {
  const validatedUser = loginUserSchema.safeParse(user);
  if (validatedUser.success) {
    const response = await api.post("/users/login", validatedUser.data);
    return {
      success: response.data.success,
      message: response.data.message,
      user: response.data.user,
    };
  }
  return {
    success: false,
    error: `Failed to login user: ${validatedUser.error.message}`,
  };
}

export async function createTask(task: CreateTaskSchema) {
  const validatedTask = createTaskSchema.safeParse(task);
  if (validatedTask.success) {
    const response = await api.post("/tasks", validatedTask.data);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  }
  return {
    success: false,
    error: `Failed to create task: ${validatedTask.error.message}`,
  };
}

export async function updateTask(task: UpdateTaskSchema) {
  const validatedTask = updateTaskSchema.safeParse(task);

  if (validatedTask.success) {
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
  }
  return {
    success: false,
    error: `Failed to update task: ${validatedTask.error.message}`,
  };
}

export async function deleteTask(taskId: number, userId: number) {
  try {
    const response = await api.delete(`/tasks/${taskId}`, { data: { userId } });
    return response.data;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: `Failed to delete task: ${error}`,
    };
  }
}

export async function getTasks(userId: number) {
  try {
    const response = await api.get(`/tasks/${userId}`);
    return {
      success: response.data.success,
      tasks: response.data.tasks,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: `Failed to get tasks: ${error}`,
    };
  }
}
