import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile from PG database
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  // Fallback sync if user profile doesn't exist yet in PG
  if (!dbUser) {
    try {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || null,
        },
      });
    } catch (err) {
      console.error("Error creating user profile in layout:", err);
      // Fallback object to not block loading
      dbUser = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#030303] md:flex-row">
      <Sidebar user={{ name: dbUser.name, email: dbUser.email }} />
      <main className="flex-1 flex flex-col min-w-0 bg-[#030303] relative z-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
