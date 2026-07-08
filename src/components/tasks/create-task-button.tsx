"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import TaskDialog from "./task-dialog";

interface CreateTaskButtonProps {
  categories: { id: string; name: string; color: string | null }[];
}

export default function CreateTaskButton({ categories }: CreateTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/10 transition-all duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Task
      </Button>

      <TaskDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        task={null}
      />
    </>
  );
}
