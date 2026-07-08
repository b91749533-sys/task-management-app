"use client";

import React, { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { taskSchema, type TaskInput } from "@/lib/validators/task";
import { createTask, updateTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string; color: string | null }[];
  task?: {
    id: string;
    title: string;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate: Date | null;
    labels: string[];
    categoryId: string | null;
  } | null;
}

export default function TaskDialog({
  open,
  onOpenChange,
  categories,
  task,
}: TaskDialogProps) {
  const [isPending, startTransition] = useTransition();

  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: "",
      categoryId: "",
      labelsString: "",
    },
  });

  // Prepopulate form fields if editing a task
  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        categoryId: task.categoryId || "",
        labelsString: task.labels.join(", "),
      });
    } else if (!task && open) {
      reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: "",
        categoryId: "",
        labelsString: "",
      });
    }
  }, [task, open, reset]);

  const onSubmit = (data: TaskInput) => {
    startTransition(async () => {
      try {
        const labels = data.labelsString
          ? data.labelsString
              .split(",")
              .map((l) => l.trim())
              .filter((l) => l.length > 0)
          : [];

        const payload = {
          title: data.title,
          description: data.description || "",
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate || null,
          categoryId: data.categoryId || null,
          labels,
        };

        let response;
        if (isEdit && task) {
          response = await updateTask(task.id, payload);
        } else {
          response = await createTask(payload);
        }

        if (!response.success) {
          toast.error(response.error || `Failed to ${isEdit ? "update" : "create"} task`);
          return;
        }

        toast.success(`Task ${isEdit ? "updated" : "created"} successfully!`);
        onOpenChange(false);
        reset();
      } catch (err) {
        console.error("Task submission error:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            {isEdit ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            {isEdit ? "Update your task details." : "Add a new task to your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300" htmlFor="title">
              Task Title <span className="text-red-400">*</span>
            </label>
            <Input
              {...register("title")}
              id="title"
              disabled={isPending}
              placeholder="e.g. Design landing page hero"
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
            {errors.title && (
              <p className="text-xs text-red-400 font-medium mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300" htmlFor="description">
              Description
            </label>
            <Textarea
              {...register("description")}
              id="description"
              disabled={isPending}
              placeholder="Add details about this task..."
              rows={3}
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm resize-none"
            />
          </div>

          {/* Grid for Select Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status Select */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300" htmlFor="status">
                Status
              </label>
              <select
                {...register("status")}
                id="status"
                disabled={isPending}
                className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-zinc-700 focus:outline-none"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority Select */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300" htmlFor="priority">
                Priority
              </label>
              <select
                {...register("priority")}
                id="priority"
                disabled={isPending}
                className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-zinc-700 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300" htmlFor="categoryId">
                Category
              </label>
              <select
                {...register("categoryId")}
                id="categoryId"
                disabled={isPending}
                className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-zinc-700 focus:outline-none"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300" htmlFor="dueDate">
                Due Date
              </label>
              <Input
                {...register("dueDate")}
                id="dueDate"
                type="date"
                disabled={isPending}
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-200 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-9"
              />
            </div>
          </div>

          {/* Labels Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300" htmlFor="labelsString">
              Labels <span className="text-[10px] text-zinc-500">(comma separated)</span>
            </label>
            <Input
              {...register("labelsString")}
              id="labelsString"
              disabled={isPending}
              placeholder="e.g. dev, design, high-priority"
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-900">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/5 transition-all duration-200"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
