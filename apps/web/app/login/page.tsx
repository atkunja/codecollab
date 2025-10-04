// apps/web/app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in to CodeCollab</h1>
        <p className={styles.subtitle}>
          Choose a provider to continue. You will return to your previous page right after authentication.
        </p>
        <button onClick={() => signIn("google")} className={styles.button}>
          Continue with Google
        </button>
        <p className={styles.footer}>Secure sign-in handled by NextAuth.</p>
      </div>
    </main>
  );
}
