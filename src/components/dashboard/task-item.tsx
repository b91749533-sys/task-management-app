"use client";

import React, { useTransition } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

import { toggleTaskStatus } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import TaskActionsMenu from "@/components/tasks/task-actions-menu";

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate: Date | null;
    labels: string[];
    categoryId: string | null;
    category: {
      name: string;
      color: string | null;
    } | null;
  };
  categories: { id: string; name: string; color: string | null }[];
}

export default function TaskItem({ task, categories }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = await toggleTaskStatus(task.id, task.status);
        if (!res.success) {
          toast.error(res.error || "Failed to update task");
        } else {
          toast.success(
            task.status === "DONE" 
              ? "Task marked as incomplete" 
              : "Task marked as completed!"
          );
        }
      } catch (err) {
        console.error("Toggle task error:", err);
        toast.error("Failed to update task status");
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 bg-zinc-900/25 border border-zinc-800/80 rounded-xl transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/35",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Checkbox Icon Wrapper */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="mt-0.5 shrink-0 text-zinc-500 hover:text-indigo-400 transition-colors focus:outline-none"
      >
        {task.status === "DONE" ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 fill-indigo-500/10" />
        ) : (
          <Circle className="h-4.5 w-4.5" />
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium text-zinc-100 truncate",
              task.status === "DONE" && "text-zinc-500 line-through"
            )}
          >
            {task.title}
          </span>

          {/* Priority Badge */}
          <Badge
            variant="outline"
            className={cn("text-[10px] font-semibold py-0 px-2 uppercase rounded-full shrink-0", getPriorityColor(task.priority))}
          >
            {task.priority.toLowerCase()}
          </Badge>

          {/* Category Tag */}
          {task.category && (
            <span 
              className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 shrink-0 px-2 py-0.5 rounded-md border border-zinc-800 bg-zinc-900/50"
            >
              <span 
                className="h-1.5 w-1.5 rounded-full" 
                style={{ backgroundColor: task.category.color || "#71717a" }}
              />
              {task.category.name}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Due Date & Labels */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
          {task.dueDate && (
            <div 
              className={cn(
                "flex items-center gap-1 text-[11px] text-zinc-500",
                isOverdue && "text-red-400 font-medium"
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>
                {isOverdue ? "Overdue: " : ""}
                {format(new Date(task.dueDate), "MMM dd")}
              </span>
            </div>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <span 
                  key={label}
                  className="text-[9px] font-semibold tracking-wider text-indigo-400/90 border border-indigo-500/10 bg-indigo-500/5 px-1.5 py-0.5 rounded"
                >
                  {label.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Actions Menu Dropdown */}
      <div className="shrink-0 self-center">
        <TaskActionsMenu task={task} categories={categories} />
      </div>
    </div>
  );
}
