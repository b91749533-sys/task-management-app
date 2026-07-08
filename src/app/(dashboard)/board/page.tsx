import React from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import KanbanBoard from "@/components/board/kanban-board";
import CreateTaskButton from "@/components/tasks/create-task-button";

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch tasks and categories concurrently
  const [tasks, categories] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
        isArchived: false,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
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
      {/* Board Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Kanban Board
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Drag and drop tasks between columns to manage your workflow.
          </p>
        </div>
        <CreateTaskButton categories={categories} />
      </div>

      {/* Board Workspace */}
      <KanbanBoard initialTasks={tasks} categories={categories} />
    </div>
  );
}
