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
      {/* Navbar for auth */}
      <nav className={styles.navbar}>
        {!session ? (
          <button onClick={() => signIn("google")} className={styles.signInButton}>
            Sign in with Google
          </button>
        ) : (
          <div className={styles.signedBox}>
            <span className={styles.signedText}>Signed in as: {session.user?.email}</span>
            <button onClick={() => signOut()} className={styles.signOutButton}>
              Sign out
            </button>
          </div>
        )}
      </nav>

      {/* Logo and Title */}
      <div className={styles.logoContainer}>
        <img src="/codecollab-logo.png" alt="CodeCollab Logo" className={styles.logo} />
      </div>
      <h1 className={styles.title}>CodeCollab</h1>
      <div className={styles.subtitle}>
        Instantly create or join collaborative coding rooms
      </div>

      {/* Form Row */}
      <div className={styles.formRow}>
        <form onSubmit={handleJoin} className={styles.form}>
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Room code"
            className={styles.input}
            maxLength={24}
          />
          <button type="submit" className={styles.joinButton}>
            Join Room
          </button>
        </form>
        <div className={styles.createLink}>
          <button type="button" className={styles.createButton} onClick={handleCreate}>
            Create Room
          </button>
        </div>
      </div>

      {message && <div className={styles.notice}>{message}</div>}

      <p className={styles.tip}>
        <b>Tip:</b> Share your room code to collaborate instantly.
      </p>

      <footer className={styles.footer}>
        Created by Ayush Kunjadia — Contact:{" "}
        <a href="mailto:atkunjadia@gmail.com" className={styles.email}>
          atkunjadia@gmail.com
        </a>
      </footer>
    </main>
  );
}
