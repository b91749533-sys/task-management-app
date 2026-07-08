import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import TasksFilters from "@/components/tasks/tasks-filters";
import TaskItem from "@/components/dashboard/task-item";
import CreateTaskButton from "@/components/tasks/create-task-button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Resolve search parameters promise (Next.js async APIs)
  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams.q as string) || "";
  const status = (resolvedSearchParams.status as string) || "ALL";
  const priority = (resolvedSearchParams.priority as string) || "ALL";
  const categoryId = (resolvedSearchParams.categoryId as string) || "ALL";
  const sort = (resolvedSearchParams.sort as string) || "dueDate_asc";
  const page = (resolvedSearchParams.page as string) || "1";

  // Build Prisma where query
  const where: any = {
    userId: user.id,
    isArchived: false,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (status !== "ALL") {
    where.status = status;
  }

  if (priority !== "ALL") {
    where.priority = priority;
  }

  if (categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  // Build Prisma sorting order
  let orderBy: any = {};
  switch (sort) {
    case "dueDate_desc":
      orderBy = { dueDate: "desc" };
      break;
    case "priority_desc":
      orderBy = { priority: "desc" };
      break;
    case "priority_asc":
      orderBy = { priority: "asc" };
      break;
    case "createdAt_desc":
      orderBy = { createdAt: "desc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    default: // dueDate_asc
      orderBy = { dueDate: "asc" };
      break;
  }

  // Pagination parameters
  const pageNum = Number(page) || 1;
  const pageSize = 10;
  const skip = (pageNum - 1) * pageSize;

  // Run database transactions concurrently
  const [tasks, totalCount, categories] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { category: true },
      orderBy,
      take: pageSize,
      skip,
    }),
    prisma.task.count({ where }),
    prisma.category.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRange = totalCount === 0 ? 0 : skip + 1;
  const endRange = Math.min(skip + pageSize, totalCount);

  // Helper to preserve active filter query parameters in links
  const getPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "ALL") params.set("status", status);
    if (priority !== "ALL") params.set("priority", priority);
    if (categoryId !== "ALL") params.set("categoryId", categoryId);
    if (sort !== "dueDate_asc") params.set("sort", sort);
    params.set("page", targetPage.toString());
    return `/tasks?${params.toString()}`;
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            All Tasks
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search, filter, and organize all your active tasks.
          </p>
        </div>
        <CreateTaskButton categories={categories} />
      </div>

      {/* Filters Card */}
      <Card className="bg-zinc-900/10 border-zinc-800/80 backdrop-blur-md">
        <CardContent className="p-4 sm:p-6">
          <TasksFilters categories={categories} />
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3 min-h-[300px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-zinc-800 border-dashed rounded-2xl p-12 text-center bg-zinc-900/5">
            <div className="p-4 bg-zinc-800/20 border border-zinc-800/80 rounded-2xl mb-4 text-zinc-500">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200">No tasks found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              {q || status !== "ALL" || priority !== "ALL" || categoryId !== "ALL"
                ? "No tasks match your active filter criteria. Try adjusting or clearing filters."
                : "Your task list is empty. Get started by creating your first task above!"}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} categories={categories} />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4 text-xs text-zinc-400">
          <div>
            Showing <span className="text-zinc-200 font-medium">{startRange}</span> to{" "}
            <span className="text-zinc-200 font-medium">{endRange}</span> of{" "}
            <span className="text-zinc-200 font-medium">{totalCount}</span> tasks
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={getPageLink(pageNum - 1)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-850 hover:bg-zinc-900 hover:text-white transition-colors ${
                pageNum <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="text-zinc-300 font-medium">
              Page {pageNum} of {totalPages}
            </span>
            <Link
              href={getPageLink(pageNum + 1)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-850 hover:bg-zinc-900 hover:text-white transition-colors ${
                pageNum >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
