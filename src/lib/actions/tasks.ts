"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import prisma from "../prisma/client";

// Get current user session helper
async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string | null;
  categoryId?: string | null;
  labels?: string[];
}) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        categoryId: data.categoryId || null,
        labels: data.labels || [],
        userId: user.id,
      },
    });

    // Create log activity
    await prisma.activity.create({
      data: {
        action: "task_created",
        details: `Created task "${task.title}"`,
        userId: user.id,
        taskId: task.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/board");
    revalidatePath("/calendar");
    return { success: true, task };
  } catch (err: any) {
    console.error("Create task error:", err);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate?: string | null;
    categoryId?: string | null;
    labels?: string[];
  }
) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Verify ownership
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });
    if (!existing) return { success: false, error: "Task not found" };

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
        categoryId: data.categoryId === null ? null : data.categoryId ? data.categoryId : undefined,
        labels: data.labels,
      },
    });

    // Create activity logs for major changes
    let details = `Updated task "${task.title}"`;
    if (data.status && data.status !== existing.status) {
      details = `Changed status of "${task.title}" to ${data.status}`;
    }

    await prisma.activity.create({
      data: {
        action: data.status && data.status !== existing.status ? "status_updated" : "task_updated",
        details,
        userId: user.id,
        taskId: task.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/board");
    revalidatePath("/calendar");
    return { success: true, task };
  } catch (err: any) {
    console.error("Update task error:", err);
    return { success: false, error: "Failed to update task" };
  }
}

export async function toggleTaskStatus(taskId: string, currentStatus: "TODO" | "IN_PROGRESS" | "DONE") {
  const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
  return updateTask(taskId, { status: newStatus });
}

export async function archiveTask(taskId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });
    if (!existing) return { success: false, error: "Task not found" };

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { isArchived: true },
    });

    await prisma.activity.create({
      data: {
        action: "task_archived",
        details: `Archived task "${task.title}"`,
        userId: user.id,
        taskId: task.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/board");
    revalidatePath("/calendar");
    return { success: true };
  } catch (err: any) {
    console.error("Archive task error:", err);
    return { success: false, error: "Failed to archive task" };
  }
}

export async function duplicateTask(taskId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });
    if (!existing) return { success: false, error: "Task not found" };

    const task = await prisma.task.create({
      data: {
        title: `${existing.title} (Copy)`,
        description: existing.description,
        priority: existing.priority,
        status: existing.status,
        dueDate: existing.dueDate,
        categoryId: existing.categoryId,
        labels: existing.labels,
        userId: user.id,
      },
    });

    await prisma.activity.create({
      data: {
        action: "task_duplicated",
        details: `Duplicated task "${existing.title}"`,
        userId: user.id,
        taskId: task.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/board");
    revalidatePath("/calendar");
    return { success: true, task };
  } catch (err: any) {
    console.error("Duplicate task error:", err);
    return { success: false, error: "Failed to duplicate task" };
  }
}

export async function deleteTask(taskId: string) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });
    if (!existing) return { success: false, error: "Task not found" };

    await prisma.task.delete({
      where: { id: taskId },
    });

    await prisma.activity.create({
      data: {
        action: "task_deleted",
        details: `Deleted task "${existing.title}"`,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/board");
    revalidatePath("/calendar");
    return { success: true };
  } catch (err: any) {
    console.error("Delete task error:", err);
    return { success: false, error: "Failed to delete task" };
  }
}
