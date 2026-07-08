"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import TaskDialog from "@/components/tasks/task-dialog";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: Date | null;
  labels: string[];
  categoryId: string | null;
}

interface CalendarViewProps {
  tasks: Task[];
  categories: { id: string; name: string; color: string | null }[];
}

export default function CalendarView({ tasks, categories }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string>("");

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

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

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); // Avoid triggering day click
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setSelectedTask(null);
    setCreateDate(format(day, "yyyy-MM-dd"));
    setIsDialogOpen(true);
  };

  // Day header labels
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      {/* Calendar Navigation Header */}
      <div className="flex items-center justify-between bg-zinc-900/15 border border-zinc-900 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/20 backdrop-blur-md">
        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 border-b border-zinc-900 bg-zinc-950/40 text-center py-2 text-xs font-semibold text-zinc-500">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-zinc-900 border-l border-t border-zinc-900">
          {days.map((day, idx) => {
            const dayTasks = tasks.filter(
              (t) => t.dueDate && isSameDay(new Date(t.dueDate), day)
            );
            const inMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[100px] p-2 flex flex-col justify-between hover:bg-zinc-900/10 cursor-pointer transition-colors group relative",
                  !inMonth && "opacity-25"
                )}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-semibold h-5 w-5 rounded-full flex items-center justify-center transition-all",
                      isToday(day)
                        ? "bg-indigo-600 text-white font-bold"
                        : inMonth
                        ? "text-zinc-300"
                        : "text-zinc-600"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  
                  {/* Hover visual plus indicator */}
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-400 transition-opacity font-medium">
                    + Add
                  </span>
                </div>

                {/* Day Tasks List */}
                <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] flex-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => handleTaskClick(e, task)}
                      className={cn(
                        "text-[9px] font-semibold p-1 rounded border leading-tight truncate transition-all duration-100 hover:border-zinc-700/60 bg-zinc-900/60 border-zinc-900/80",
                        task.status === "DONE"
                          ? "text-zinc-500 line-through opacity-70 border-zinc-950 bg-zinc-950/20"
                          : task.priority === "HIGH"
                          ? "text-red-400 bg-red-950/5 border-red-500/10"
                          : task.priority === "MEDIUM"
                          ? "text-amber-400 bg-amber-950/5 border-amber-500/10"
                          : "text-zinc-300"
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[8px] font-bold text-zinc-500 pl-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Single Dialog for both Tasks (create and edit modes) */}
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categories={categories}
        task={
          selectedTask
            ? selectedTask
            : createDate
            ? {
                id: "",
                title: "",
                description: "",
                priority: "MEDIUM",
                status: "TODO",
                dueDate: new Date(createDate),
                labels: [],
                categoryId: null,
              }
            : null
        }
      />
    </div>
  );
}
