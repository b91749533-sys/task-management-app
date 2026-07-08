"use client";

import React, { useTransition, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
import { forgotPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    startTransition(async () => {
      try {
        const response = await forgotPassword(data);
        if (!response.success) {
          toast.error(response.error || "Failed to send reset link");
          return;
        }

        toast.success("Reset link sent!");
        setIsSuccess(true);
      } catch (err) {
        console.error("Forgot password client error:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl px-6 py-8 sm:px-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-indigo-400" />
        </div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          We've sent a password reset link to your email address. Please follow the instructions to reset your password.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors gap-1.5"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl px-6 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Forgot password?
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Enter your email to receive a password reset link
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-600/10 transition-all duration-200 mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      {/* Redirect link */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-300 transition-colors gap-1.5"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to log in
        </Link>
      </div>
    </div>
  );
}
