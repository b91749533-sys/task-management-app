"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TasksFiltersProps {
  categories: { id: string; name: string }[];
}

export default function TasksFilters({ categories }: TasksFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [priority, setPriority] = useState(searchParams.get("priority") || "ALL");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "ALL");
  const [sort, setSort] = useState(searchParams.get("sort") || "dueDate_asc");

  // Sync state with URL params
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setStatus(searchParams.get("status") || "ALL");
    setPriority(searchParams.get("priority") || "ALL");
    setCategoryId(searchParams.get("categoryId") || "ALL");
    setSort(searchParams.get("sort") || "dueDate_asc");
  }, [searchParams]);

  // Update query params helper
  const updateQueryParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || !value) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced search text update
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentQ = searchParams.get("q") || "";
      if (q !== currentQ) {
        if (q) {
          params.set("q", q);
        } else {
          params.delete("q");
        }
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [q, pathname, router, searchParams]);

  const handleClearFilters = () => {
    setQ("");
    router.push(pathname); // Clears all query parameters
  };

  const hasActiveFilters = 
    searchParams.has("q") || 
    searchParams.has("status") || 
    searchParams.has("priority") || 
    searchParams.has("categoryId");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 items-center">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 bg-zinc-900/30 border-zinc-800 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-9"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => updateQueryParam("status", e.target.value)}
            className="w-full h-9 rounded-md bg-zinc-900/30 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priority}
            onChange={(e) => updateQueryParam("priority", e.target.value)}
            className="w-full h-9 rounded-md bg-zinc-900/30 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryId}
            onChange={(e) => updateQueryParam("categoryId", e.target.value)}
            className="w-full h-9 rounded-md bg-zinc-900/30 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sorting and Clear Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Sort by</span>
          <select
            value={sort}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("sort", e.target.value);
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="rounded-md bg-transparent border-0 text-zinc-300 focus:outline-none font-medium cursor-pointer"
          >
            <option value="dueDate_asc">Due Date (Ascending)</option>
            <option value="dueDate_desc">Due Date (Descending)</option>
            <option value="priority_desc">Priority (High to Low)</option>
            <option value="priority_asc">Priority (Low to High)</option>
            <option value="createdAt_desc">Date Created (Newest)</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-zinc-400 hover:text-white px-2 rounded-md hover:bg-zinc-900 gap-1 text-[11px]"
          >
            <X className="h-3 w-3" />
            Clear active filters
          </Button>
        )}
      </div>
    </div>
  );
}
