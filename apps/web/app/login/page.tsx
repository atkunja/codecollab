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
        <div>
          <button
            onClick={() => signIn("github")}
            className={`${styles.button} ${styles.buttonGithub}`}
          >
            Continue with GitHub
          </button>
        </div>
        <div>
          <button
            onClick={() => signIn("google")}
            className={`${styles.button} ${styles.buttonGoogle}`}
          >
            Continue with Google
          </button>
        </div>
        <p className={styles.footer}>Secure OAuth handled by NextAuth.</p>
      </div>
    </main>
  );
}
