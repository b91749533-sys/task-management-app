"use server";

import { createClient } from "../supabase/server";
import prisma from "../prisma/client";
import { loginSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth";

export async function signUp(data: any) {
  const result = signUpSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email, password, name } = result.data;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || "",
      },
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  const authUser = authData.user;
  if (!authUser) {
    return { success: false, error: "Authentication failed to create user." };
  }

  // Sync to public schema DB
  try {
    await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        name: name || null,
      },
    });
  } catch (dbError: any) {
    console.error("Database sync error during sign up:", dbError);
    if (dbError.code !== "P2002") {
      return { success: false, error: "Failed to create user profile. Please try again." };
    }
  }

  return { 
    success: true, 
    message: authData.session 
      ? "Sign up successful!" 
      : "Sign up successful! Please check your email for a verification link." 
  };
}

export async function login(data: any) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

export async function forgotPassword(data: any) {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email } = result.data;
  const supabase = await createClient();
  
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Password reset link sent to your email." };
}

export async function resetPassword(data: any) {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Password has been reset successfully." };
}
