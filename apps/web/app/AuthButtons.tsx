"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-center">
        <p>Signed in as {session.user?.email}</p>
        <button
          className="mt-2 px-4 py-2 bg-gray-800 text-white rounded"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => signIn()}
    >
      Sign in with GitHub
    </button>
  );
}
