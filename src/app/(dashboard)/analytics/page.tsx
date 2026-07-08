import React from "react";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Activity as ActivityIcon,
  Circle,
  FileCheck,
  Tag,
  Sparkles
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import AnalyticsCharts from "@/components/analytics/analytics-charts";
import CreateTaskButton from "@/components/tasks/create-task-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all tasks, categories, and recent activity logs
  const [tasks, categories, activities] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
      },
      include: {
        category: true,
      },
    }),
    prisma.category.findMany({
      where: {
        userId: user.id,
      },
    }),
    prisma.activity.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
  ]);

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const pendingTasks = tasks.filter(t => t.status !== "DONE").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Streak Calculation (consecutive days with at least one task completed)
  const completedTasksList = tasks.filter(t => t.status === "DONE" && t.updatedAt);
  const uniqueCompletedDates = Array.from(
    new Set(
      completedTasksList.map(t => format(new Date(t.updatedAt), "yyyy-MM-dd"))
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  if (uniqueCompletedDates.length > 0) {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    let currentCheckDate = new Date();
    let hasStreak = false;

    if (uniqueCompletedDates.includes(todayStr)) {
      hasStreak = true;
      currentCheckDate = new Date();
    } else if (uniqueCompletedDates.includes(yesterdayStr)) {
      hasStreak = true;
      currentCheckDate = yesterday;
    }

    if (hasStreak) {
      streak = 1;
      while (true) {
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        const checkStr = format(currentCheckDate, "yyyy-MM-dd");
        if (uniqueCompletedDates.includes(checkStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Priority counts formatting
  const priorityCounts = {
    HIGH: tasks.filter(t => t.priority === "HIGH").length,
    MEDIUM: tasks.filter(t => t.priority === "MEDIUM").length,
    LOW: tasks.filter(t => t.priority === "LOW").length,
  };

  const priorityData = [
    { name: "High", count: priorityCounts.HIGH, color: "#f87171" },
    { name: "Medium", count: priorityCounts.MEDIUM, color: "#fbbf24" },
    { name: "Low", count: priorityCounts.LOW, color: "#a1a1aa" },
  ];

  // Category counts formatting
  const categoryData = categories.map(cat => {
    const count = tasks.filter(t => t.categoryId === cat.id).length;
    return {
      name: cat.name,
      count,
      color: cat.color || "#6366f1",
    };
  }).filter(c => c.count > 0);

  // Activity type icon mapper
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "task_created":
        return <Plus className="h-3.5 w-3.5 text-indigo-400" />;
      case "status_updated":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "task_archived":
        return <Sparkles className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <ActivityIcon className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Analytics Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Workspace Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track completion trends, streaks, and real-time activity logs.
          </p>
        </div>
        <CreateTaskButton categories={categories} />
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Streak */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md relative overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">Current Streak</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1.5">
                {streak} {streak === 1 ? "day" : "days"}
              </p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800 shadow-md">
              <Flame className="h-5 w-5 text-orange-500 fill-orange-500/10 animate-pulse" />
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400" />
        </Card>

        {/* Card 2: Resolution Ratio */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md relative overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">Task Resolution</p>
              <p className="text-2xl font-bold text-white">{completionRate}%</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <FileCheck className="h-5 w-5 text-indigo-400" />
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />
        </Card>

        {/* Card 3: Completed Tasks count */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md relative overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">Completed Volume</p>
              <p className="text-2xl font-bold text-white">{completedTasks} tasks</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
        </Card>

        {/* Card 4: Category distribution */}
        <Card className="bg-zinc-900/30 border-zinc-800/80 backdrop-blur-md relative overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">Categorized Scope</p>
              <p className="text-2xl font-bold text-white">{categories.length} tags</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <Tag className="h-5 w-5 text-cyan-400" />
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
        </Card>
      </div>

      {/* Analytics Charts Component */}
      <AnalyticsCharts priorityData={priorityData} categoryData={categoryData} />

      {/* Activity Timeline (Recent Activity Logs) */}
      <Card className="bg-zinc-900/10 border-zinc-800/80 backdrop-blur-md">
        <CardHeader className="p-6 border-b border-zinc-800/30">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <ActivityIcon className="h-4.5 w-4.5 text-indigo-400" />
            Activity Timeline
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">Real-time log of workspace operations</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              No recent activity registered in this workspace yet.
            </div>
          ) : (
            <div className="relative pl-6 border-l border-zinc-800 space-y-6">
              {activities.map((act) => (
                <div key={act.id} className="relative">
                  {/* Timeline Dot Indicator */}
                  <span className="absolute -left-9 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-850 bg-zinc-950 shadow-sm">
                    {getActivityIcon(act.action)}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="text-xs font-semibold text-zinc-200">
                      {act.details}
                    </p>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
