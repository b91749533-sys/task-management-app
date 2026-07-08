"use client";

import React, { useState, useTransition, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, AlertCircle, Plus, Kanban, Inbox } from "lucide-react";
import { toast } from "sonner";

import { updateTask } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/badge";
import TaskActionsMenu from "@/components/tasks/task-actions-menu";
import CreateTaskButton from "@/components/tasks/create-task-button";
import { cn } from "@/lib/utils";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TaskStatus;
  dueDate: Date | null;
  labels: string[];
  categoryId: string | null;
  category: {
    name: string;
    color: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface KanbanBoardProps {
  initialTasks: Task[];
  categories: { id: string; name: string; color: string | null }[];
}

export default function KanbanBoard({ initialTasks, categories }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep state sync'd when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!taskId) return;

    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    // Optimistic Update
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    startTransition(async () => {
      try {
        const res = await updateTask(taskId, { status: targetStatus });
        if (!res.success) {
          toast.error(res.error || "Failed to update task column");
          setTasks(originalTasks); // Revert
        } else {
          toast.success(`Task moved to ${targetStatus.replace("_", " ").toLowerCase()}`);
        }
      } catch (err) {
        console.error("Drag drop update status error:", err);
        toast.error("Failed to update task column");
        setTasks(originalTasks); // Revert
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

  const renderColumn = (status: TaskStatus, title: string, headerClass: string) => {
    const columnTasks = tasks.filter((t) => t.status === status);

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, status)}
        className="flex flex-col bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 min-h-[550px] w-full transition-all duration-300"
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", headerClass)} />
            <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          </div>
          <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {columnTasks.length}
          </Badge>
        </div>

        {/* Task Cards Container */}
        <div className="flex-1 space-y-3 overflow-y-auto mb-4">
          {columnTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-zinc-900 rounded-xl p-4 text-center">
              <Inbox className="h-5 w-5 text-zinc-700 mb-2" />
              <p className="text-xs font-medium text-zinc-500">No tasks</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Drag tasks here</p>
            </div>
          ) : (
            columnTasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex flex-col gap-3 p-4 bg-zinc-900/20 border border-zinc-850 hover:border-zinc-700/60 rounded-xl cursor-grab active:cursor-grabbing hover:bg-zinc-900/40 transition-all duration-200 shadow-sm",
                    draggedTaskId === task.id && "opacity-30 border-dashed"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-100 line-clamp-2">
                      {task.title}
                    </span>
                    <div className="shrink-0">
                      <TaskActionsMenu task={task} categories={categories} />
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Badges/Category */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-semibold py-0 px-2 uppercase rounded shrink-0",
                        getPriorityColor(task.priority)
                      )}
                    >
                      {task.priority.toLowerCase()}
                    </Badge>

                    {task.category && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-zinc-400 shrink-0 px-1.5 py-0.5 rounded border border-zinc-850 bg-zinc-900/30">
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: task.category.color || "#71717a" }}
                        />
                        {task.category.name}
                      </span>
                    )}
                  </div>

                  {/* Due Date & Labels */}
                  {(task.dueDate || task.labels.length > 0) && (
                    <div className="flex items-center justify-between border-t border-zinc-900/50 pt-2.5 mt-1 text-[10px] text-zinc-500">
                      {task.dueDate ? (
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            isOverdue && "text-red-400 font-semibold"
                          )}
                        >
                          {isOverdue ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <Calendar className="h-3 w-3" />
                          )}
                          <span>{format(new Date(task.dueDate), "MMM dd")}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      {task.labels.length > 0 && (
                        <div className="flex gap-0.5">
                          {task.labels.slice(0, 2).map((label) => (
                            <span
                              key={label}
                              className="text-[8px] font-semibold tracking-wider text-indigo-400/80 border border-indigo-500/10 bg-indigo-500/5 px-1 py-0.2 rounded"
                            >
                              {label.toUpperCase()}
                            </span>
                          ))}
                          {task.labels.length > 2 && (
                            <span className="text-[8px] font-bold text-zinc-500 px-1">
                              +{task.labels.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {renderColumn("TODO", "To Do", "bg-zinc-500")}
      {renderColumn("IN_PROGRESS", "In Progress", "bg-amber-500")}
      {renderColumn("DONE", "Done", "bg-indigo-500")}
    </div>
  );
}
