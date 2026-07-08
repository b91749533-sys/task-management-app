import React from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import CalendarView from "@/components/calendar/calendar-view";
import CreateTaskButton from "@/components/tasks/create-task-button";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch tasks and categories
  const [tasks, categories] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
        isArchived: false,
        dueDate: {
          not: null,
        },
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
  ]);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Calendar Agenda
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse and schedule tasks across dates in a monthly view.
          </p>
        </div>
        <CreateTaskButton categories={categories} />
      </div>

      {/* Calendar Grid View */}
      <CalendarView tasks={tasks} categories={categories} />
    </div>
  );
}
