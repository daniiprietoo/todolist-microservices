import { Router } from "express";
import {
  createTaskController,
  deleteTaskController,
  getTasksController,
  updateTaskController,
} from "../controllers/tasks-controller";

const router = Router();

// Create a new task
router.post("/", createTaskController);

// Get tasks for a user
router.get("/:userId", getTasksController);

// Update a task
router.patch("/:taskId", updateTaskController);

// Mark a task as complete (uses same controller)
router.patch("/:taskId/complete", updateTaskController);

// Delete a task
router.delete("/:taskId", deleteTaskController);

export default router;
