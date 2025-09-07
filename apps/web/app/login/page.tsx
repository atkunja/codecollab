// apps/web/app/login/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/";

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}` },
    });
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}` },
    });
  };

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="w-full max-w-sm rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a provider to continue.</p>
        <div className="mt-6 space-y-3">
          <button onClick={signInWithGithub} className="w-full rounded-xl border px-4 py-2">Continue with GitHub</button>
          <button onClick={signInWithGoogle} className="w-full rounded-xl border px-4 py-2">Continue with Google</button>
        </div>
      </div>
    </main>
  );
}
