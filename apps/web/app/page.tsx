"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { data: session } = useSession();
  const [roomInput, setRoomInput] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!roomInput.trim()) return;
    window.location.href = `/room/${roomInput.trim()}`;
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
        <Link href="/create-room" className={styles.createLink}>
          <button className={styles.createButton}>Create Room</button>
        </Link>
      </div>

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
