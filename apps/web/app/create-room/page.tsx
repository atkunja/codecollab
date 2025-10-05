"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CreateRoom.module.css";

export default function CreateRoomPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.email) {
      setMessage("Please log in before using CodeCollab.");
      return;
    }
    if (!name.trim()) {
      setMessage("Room name required.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          id: roomId || undefined,
          creatorEmail: session.user.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Room created!");
        router.push(`/room/${data.id}`);
      } else {
        setMessage(data.error || "Failed to create room.");
      }
    } catch (error) {
      console.error("Failed to create room", error);
      setMessage("Unable to reach the server. Please try again.");
    }
  }

  if (status === "loading") {
    return <div className={styles.container}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.container}>
        <div className={styles.authGuard}>
          <h1 className={styles.title}>Create a room</h1>
          <p className={styles.guardText}>Please log in before using CodeCollab.</p>
          <Link href="/login" className={styles.guardButton}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Create a room</h1>
          <button type="button" className={styles.backButton} onClick={() => router.back()}>
            Back
          </button>
        </div>
        <p className={styles.subtitle}>Name your space, optionally add a custom code, and start collaborating instantly.</p>
        <form className={styles.form} onSubmit={handleCreate}>
          <input
            className={styles.input}
            placeholder="Room name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={32}
            required
          />
          <input
            className={styles.input}
            placeholder="Room code (optional)"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            maxLength={32}
          />
          <button type="submit" className={styles.button}>
            Create room
          </button>
        </form>
        {message && (
          <div className={`${styles.message} ${message.startsWith("Room created") ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
        <div className={styles.footer}>
          Created by Ayush Kunjadia — <a href="mailto:atkunjadia@gmail.com">atkunjadia@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
