// apps/web/app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center">
      <div className="w-full max-w-sm rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a provider to continue.
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => signIn("github")}
            className="w-full rounded-xl border px-4 py-2"
          >
            Continue with GitHub
          </button>
          <button
            onClick={() => signIn("google")}
            className="w-full rounded-xl border px-4 py-2"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}
