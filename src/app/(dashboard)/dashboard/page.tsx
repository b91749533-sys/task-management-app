import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, startOfDay, endOfDay } from "date-fns";
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Plus, 
  CalendarCheck2, 
  TrendingUp,
  Inbox
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressChart from "@/components/dashboard/progress-chart";
import TaskItem from "@/components/dashboard/task-item";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all active tasks for the user
  const tasks = await prisma.task.findMany({
    where: { 
      userId: user.id,
      isArchived: false
    },
    include: { 
      category: true 
    },
    orderBy: { 
      dueDate: "asc" 
    },
  });

  // Fetch categories for task editing
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const todoTasks = tasks.filter(t => t.status === "TODO").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter lists
  const todayEnd = endOfDay(new Date());

  const todayTasks = tasks.filter(t => {
    if (t.status === "DONE") return false;
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate <= todayEnd; // Overdue or due today
  });

  const upcomingTasks = tasks.filter(t => {
    if (t.status === "DONE") return false;
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate > todayEnd; // Due tomorrow and onwards
  });

  // Calculate historical 7-day chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const chartData = last7Days.map(day => {
    const dayStr = format(day, "MMM dd");
    
    const createdCount = tasks.filter(t => {
      const created = new Date(t.createdAt);
      return created.toDateString() === day.toDateString();
    }).length;
    
    const completedCount = tasks.filter(t => {
      if (t.status !== "DONE" || !t.updatedAt) return false;
      const updated = new Date(t.updatedAt);
      return updated.toDateString() === day.toDateString();
    }).length;

    return {
      name: dayStr,
      Created: createdCount,
      Completed: completedCount,
    };
  });

  const dateStr = format(new Date(), "EEEE, MMMM dd");

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
            {dateStr}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Here's an overview of your productivity metrics today.
          </p>
        </div>
        <Link href="/board">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/10 transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{totalTasks}</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <ListTodo className="h-5 w-5 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: In Progress */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">In Progress</p>
              <p className="text-2xl font-bold text-white">{inProgressTasks}</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Completed */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">Completed</p>
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Completion Rate */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{completionRate}%</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress Chart (Spans 2 columns) */}
        <Card className="bg-zinc-900/10 border-zinc-800/80 backdrop-blur-md lg:col-span-2">
          <CardHeader className="p-6 border-b border-zinc-800/30">
            <CardTitle className="text-base font-semibold text-white">Productivity Index</CardTitle>
            <CardDescription className="text-xs text-zinc-400">Tasks created vs tasks completed over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>

        {/* Completion Gauge Widget */}
        <Card className="bg-zinc-900/10 border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
          <CardHeader className="p-6 border-b border-zinc-800/30">
            <CardTitle className="text-base font-semibold text-white">Completion Progress</CardTitle>
            <CardDescription className="text-xs text-zinc-400">Circular ratio of task status resolution</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center flex-1 py-8">
            <div className="relative flex items-center justify-center h-36 w-36">
              {/* Premium Circular SVG Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(39, 39, 42, 0.4)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#completionGradCircle)"
                  strokeWidth="7"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * completionRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="completionGradCircle" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{completionRate}%</span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">Done</span>
              </div>
            </div>
            <div className="flex justify-around w-full mt-6 text-center text-xs">
              <div>
                <p className="text-zinc-500 font-medium">Todo</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{todoTasks}</p>
              </div>
              <div className="border-r border-zinc-800" />
              <div>
                <p className="text-zinc-500 font-medium">In Progress</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{inProgressTasks}</p>
              </div>
              <div className="border-r border-zinc-800" />
              <div>
                <p className="text-zinc-500 font-medium">Completed</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Tasks Column */}
        <Card className="bg-zinc-900/10 border-zinc-800/80 backdrop-blur-md flex flex-col h-[400px]">
          <CardHeader className="p-6 border-b border-zinc-800/30 flex-shrink-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-white">Today's Focus</CardTitle>
              <CardDescription className="text-xs text-zinc-400">Uncompleted tasks due today or overdue</CardDescription>
            </div>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/10 px-2 py-0.5 rounded-full uppercase">
              {todayTasks.length} pending
            </span>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto flex-1 space-y-3">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="p-3 bg-zinc-800/20 border border-zinc-800 rounded-xl mb-3 text-zinc-500">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-zinc-300">All caught up!</p>
                <p className="text-xs text-zinc-500 mt-1">No pending tasks due today.</p>
              </div>
            ) : (
              todayTasks.map(task => (
                <TaskItem key={task.id} task={task} categories={categories} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks Column */}
        <Card className="bg-zinc-900/10 border-zinc-800/80 backdrop-blur-md flex flex-col h-[400px]">
          <CardHeader className="p-6 border-b border-zinc-800/30 flex-shrink-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-white">Upcoming Agenda</CardTitle>
              <CardDescription className="text-xs text-zinc-400">Uncompleted tasks scheduled for tomorrow onwards</CardDescription>
            </div>
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2 py-0.5 rounded-full uppercase">
              {upcomingTasks.length} upcoming
            </span>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto flex-1 space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="p-3 bg-zinc-800/20 border border-zinc-800 rounded-xl mb-3 text-zinc-500">
                  <CalendarCheck2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-zinc-300">Clear calendar</p>
                <p className="text-xs text-zinc-500 mt-1">No scheduled tasks in the near future.</p>
              </div>
            ) : (
              upcomingTasks.map(task => (
                <TaskItem key={task.id} task={task} categories={categories} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
