"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ListTodo,
  Kanban, 
  Calendar, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  User
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  user: {
    name: string | null;
    email: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "All Tasks", href: "/tasks", icon: ListTodo },
    { name: "Kanban Board", href: "/board", icon: Kanban },
    { name: "Calendar View", href: "/calendar", icon: Calendar },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res.success) {
        toast.success("Successfully logged out");
        router.push("/login");
        router.refresh();
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(" ");
      return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Header Menu Trigger */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-[#070707] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md">
            <span className="font-bold text-sm text-white">TF</span>
          </div>
          <span className="font-bold text-white text-sm">TaskFlow</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="text-zinc-400 hover:text-zinc-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-[#070707] transition-transform duration-300 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md">
              <span className="font-bold text-sm text-white">TF</span>
            </div>
            <span className="font-bold text-white text-sm">TaskFlow</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-zinc-800/80 text-white" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Profile Footer */}
        <div className="border-t border-zinc-800 p-4 bg-[#050505]">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-zinc-700 bg-zinc-800">
              <AvatarFallback className="text-xs text-zinc-300 font-semibold bg-zinc-800">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.name || "User"}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 hover:bg-zinc-900/30"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-zinc-800/70 bg-[#070707] transition-all duration-300 ease-in-out shrink-0 relative",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Collapse Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-[-12px] top-6 z-30 h-6 w-6 rounded-full border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Desktop Header Logo */}
        <div className="flex h-16 items-center border-b border-zinc-800/50 px-4 gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/5">
            <span className="font-bold text-sm text-white">TF</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-white text-sm tracking-wide">
              TaskFlow
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group relative",
                  isActive 
                    ? "bg-zinc-800/80 text-white" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-300")} />
                {!isCollapsed && <span>{item.name}</span>}
                
                {/* Tooltip for collapsed view */}
                {isCollapsed && (
                  <div className="absolute left-14 z-50 hidden group-hover:block bg-zinc-900 border border-zinc-800 text-xs text-white px-2 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Profile Footer */}
        <div className="border-t border-zinc-800/50 p-4 bg-[#050505]/30">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0 border border-zinc-700 bg-zinc-800">
              <AvatarFallback className="text-xs text-zinc-300 font-semibold bg-zinc-800">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user.name || "User"}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 hover:bg-zinc-900/30 shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isCollapsed && (
            <div className="flex justify-center mt-3 border-t border-zinc-800/50 pt-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 hover:bg-zinc-900/30 h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
