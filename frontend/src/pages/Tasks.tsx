import { getTasks, updateTask, deleteTask } from "@/api/api";
import { CreateTaskForm } from "@/components/create-task-form";
import { useUser } from "@/hooks/user";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TasksList } from "@/components/TasksList";
import type { Task } from "@/components/TasksList";

export default function Tasks() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      navigate("/");
    }
  }, [user, navigate]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    const response = await getTasks(user.id);
    if (response.success) {
      setTasks(response.tasks);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleEditTask = async (task: Task) => {
    if (!user?.id) return;
    await updateTask({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed ?? false,
      userId: user.id,
    });
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!user?.id) return;
    await deleteTask(taskId, user.id);
    fetchTasks();
  };

  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}! 🎉</h1>
        <CreateTaskForm
          userId={user?.id as number}
          onTaskCreated={() => {
            fetchTasks();
          }}
        />
        <div className="mt-8">
          <TasksList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </div>
      </div>
    </div>
  );
}
