"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    startTransition(async () => {
      try {
        const response = await resetPassword(data);
        if (!response.success) {
          toast.error(response.error || "Failed to reset password");
          return;
        }

        toast.success("Password has been reset. Please log in.");
        router.push("/login");
      } catch (err) {
        console.error("Reset password client error:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl px-6 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Reset password
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300" htmlFor="password">
            New Password
          </label>
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

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              {...register("confirmPassword")}
              disabled={isPending}
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-9 bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 font-medium mt-1">
              {errors.confirmPassword.message}
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
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}
