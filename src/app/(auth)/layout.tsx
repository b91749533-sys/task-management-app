import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030303] text-zinc-100 overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      {/* Premium background styling: custom radial gradients for dark mode glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black" />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid overlay for a modern developer aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <span className="font-sans font-bold text-lg text-white">TF</span>
          </div>
          <h2 className="mt-4 font-sans text-xl font-bold tracking-tight text-white bg-clip-text">
            TaskFlow
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Streamline your daily productivity
          </p>
        </div>

        {/* Form Container */}
        {children}
      </div>
    </div>
  );
}
