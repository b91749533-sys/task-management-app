"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const next = searchParams.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      try {
        const response = await login(data);
        if (!response.success) {
          toast.error(response.error || "Failed to log in");
          return;
        }

        toast.success("Welcome back!");
        router.push(next);
        router.refresh();
      } catch (err) {
        console.error("Login client error:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl px-6 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Log in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              {...register("email")}
              disabled={isPending}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9 bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 font-medium mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              {...register("password")}
              disabled={isPending}
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9 bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 font-medium mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-600/10 transition-all duration-200 mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </Button>
      </form>

      {/* Redirect link */}
      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
