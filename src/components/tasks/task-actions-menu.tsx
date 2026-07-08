"use client";

import React, { useTransition, useState } from "react";
import { MoreHorizontal, Edit2, Copy, Archive, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { duplicateTask, archiveTask, deleteTask } from "@/lib/actions/tasks";
import TaskDialog from "./task-dialog";

interface TaskActionsMenuProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate: Date | null;
    labels: string[];
    categoryId: string | null;
  };
  categories: { id: string; name: string; color: string | null }[];
}

export default function TaskActionsMenu({ task, categories }: TaskActionsMenuProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        const res = await duplicateTask(task.id);
        if (res.success) {
          toast.success("Task duplicated successfully");
        } else {
          toast.error(res.error || "Failed to duplicate task");
        }
      } catch (err) {
        console.error("Duplicate task client error:", err);
        toast.error("Failed to duplicate task");
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      try {
        const res = await archiveTask(task.id);
        if (res.success) {
          toast.success("Task archived successfully");
        } else {
          toast.error(res.error || "Failed to archive task");
        }
      } catch (err) {
        console.error("Archive task client error:", err);
        toast.error("Failed to archive task");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteTask(task.id);
        if (res.success) {
          toast.success("Task deleted successfully");
          setIsDeleteDialogOpen(false);
        } else {
          toast.error(res.error || "Failed to delete task");
        }
      } catch (err) {
        console.error("Delete task client error:", err);
        toast.error("Failed to delete task");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded-lg flex items-center justify-center cursor-pointer transition-colors outline-none focus:outline-none"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-zinc-800 text-zinc-300">
          <DropdownMenuItem
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer focus:bg-zinc-900 focus:text-white"
          >
            <Edit2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>Edit Task</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDuplicate}
            className="flex items-center gap-2 cursor-pointer focus:bg-zinc-900 focus:text-white"
          >
            <Copy className="h-3.5 w-3.5 text-zinc-400" />
            <span>Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleArchive}
            className="flex items-center gap-2 cursor-pointer focus:bg-zinc-900 focus:text-white"
          >
            <Archive className="h-3.5 w-3.5 text-zinc-400" />
            <span>Archive</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 text-red-400 cursor-pointer focus:bg-red-950/20 focus:text-red-400"
          >
            <Trash className="h-3.5 w-3.5" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <TaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        categories={categories}
        task={task}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">
              Delete Task
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Are you sure you want to delete this task? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-zinc-900 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-500 text-white font-medium shadow-md shadow-red-600/10 transition-all duration-200"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
