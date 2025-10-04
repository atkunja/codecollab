"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [roomInput, setRoomInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      setMessage("Please log in before using CodeCollab.");
    }
    if (status === "authenticated") {
      setMessage(null);
    }
  }, [status]);

  function requireAuth(action: () => void) {
    if (status !== "authenticated") {
      setMessage("Please log in before using CodeCollab.");
      return;
    }
    action();
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!roomInput.trim()) return;
    requireAuth(() => {
      window.location.href = `/room/${roomInput.trim()}`;
    });
  }

  function handleCreate() {
    requireAuth(() => {
      router.push("/create-room");
    });
  }

  return (
    <main className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>CC</div>
          <span>CodeCollab</span>
        </div>
        {!session ? (
          <button onClick={() => signIn("google")} className={styles.signInButton}>
            Sign in with Google
          </button>
        ) : (
          <button onClick={() => signOut()} className={styles.signOutButton}>
            Sign out ({session.user?.email})
          </button>
        )}
      </nav>

      <section className={styles.hero}>
        <div className={styles.headline}>
          <h1 className={styles.title}>
            Build together in <span>real-time</span>
          </h1>
          <p className={styles.subtitle}>
            Create shareable coding rooms, chat with your team, and run code for the most popular languages—all without leaving your browser.
          </p>
          {message && <div className={styles.notice}>{message}</div>}
          <p className={styles.tip}>
            Tip: Share your room code to collaborate instantly.
          </p>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.logoContainer}>
            <img src="/codecollab-logo.png" alt="CodeCollab Logo" className={styles.logo} />
          </div>
          <div className={styles.formRow}>
            <form onSubmit={handleJoin} className={styles.form}>
              <input
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter a room code"
                className={styles.input}
                maxLength={24}
              />
              <button type="submit" className={styles.joinButton}>
                Join room
              </button>
            </form>
            <button type="button" className={styles.createButton} onClick={handleCreate}>
              Create a new room
            </button>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Created by Ayush Kunjadia</span>
        <a href="mailto:atkunjadia@gmail.com" className={styles.email}>
          atkunjadia@gmail.com
        </a>
      </footer>
    </main>
  );
}
