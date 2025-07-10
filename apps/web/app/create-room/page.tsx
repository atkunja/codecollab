"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./CreateRoom.module.css";

export default function CreateRoomPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("Room name required.");
      return;
    }
    const res = await fetch("http://localhost:3001/rooms/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        id: roomId || undefined,
        creatorEmail: session?.user?.email || "",
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Room created!");
      router.push(`/room/${data.id}`);
    } else {
      setMessage(data.error || "Failed to create room.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>Create Room</div>
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
          Create Room
        </button>
      </form>
      {message && (
        <div
          className={
            styles.message +
            " " +
            (message.startsWith("Room created") ? styles.success : styles.error)
          }
        >
          {message}
        </div>
      )}
      <div className={styles.footer}>
        <b>Created by Ayush Kunjadia</b> —{" "}
        <a href="mailto:atkunjadia@gmail.com" style={{ color: "#4fd1c5", textDecoration: "underline" }}>
          atkunjadia@gmail.com
        </a>
      </div>
    </div>
  );
}
