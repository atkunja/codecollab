"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import io, { Socket } from "socket.io-client";

import styles from "./room.module.css";

// Monaco Editor import (no SSR)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type User = { email: string; name?: string; image?: string };
type Message = { sender: string; message: string; created_at?: string };

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { data: session, status } = useSession();
  const { roomId } = params;

  // Use a ref so socket is not recreated every render
  const socketRef = useRef<Socket | null>(null);

  // UI state
  const [code, setCode] = useState("// Start coding!");
  const [users, setUsers] = useState<User[]>([]);
  const [language, setLanguage] = useState("javascript");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<{ name?: string; creator_email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // --- CREATE SOCKET ON MOUNT ---
  useEffect(() => {
    // Try env var, fallback to localhost
    const url =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:3001";
    socketRef.current = io(url, { transports: ["websocket"] });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Fetch room info from backend
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    fetch(`/api/rooms/${roomId}`)
      .then(async (res) => {
        const data = await res.json();
        if (data.error) setJoinError(data.error);
        else setRoomInfo(data);
        setLoading(false);
      })
      .catch(() => setJoinError("Could not fetch room info."));
  }, [roomId]);

  // Join room, wire up sockets
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId || !session?.user?.email || joinError) return;

    socket.emit("joinRoom", {
      roomId,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    });

    socket.on("joinError", (msg: string) => {
      setJoinError(msg || "Could not join this room.");
      setMessages([]);
      setUsers([]);
    });

    socket.on("codeUpdate", (data: { code?: string; language?: string }) => {
      if (typeof data === "string") setCode(data);
      else if (data?.code) setCode(data.code);
      if (data?.language) setLanguage(data.language);
    });

    socket.on("roomUsers", (u: User[]) => setUsers(u));
    socket.on("newChatMessage", (msg: Message) =>
      setMessages((prev) => [...prev, msg])
    );
    socket.on("chatHistory", (history: Message[]) =>
      setMessages(history || [])
    );

    return () => {
      socket.off("codeUpdate");
      socket.off("roomUsers");
      socket.off("newChatMessage");
      socket.off("chatHistory");
      socket.off("joinError");
    };
  }, [roomId, session?.user?.email, session?.user?.name, session?.user?.image, joinError]);

  // Handle room deletion
  async function handleDeleteRoom() {
    if (!roomId || !session?.user?.email) return;
    if (!window.confirm("Are you sure you want to delete this room? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestor: session.user.email }),
    });
    const data = await res.json();
    setDeleting(false);
    if (data.success) {
      alert("Room deleted!");
      window.location.href = "/";
    } else {
      alert(data.error || "Could not delete room.");
    }
  }

  function handleEditorChange(value: string | undefined) {
    setCode(value || "");
    socketRef.current?.emit("codeChange", { roomId, code: value, language });
  }
  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLanguage(e.target.value);
    socketRef.current?.emit("codeChange", { roomId, code, language: e.target.value });
  }
  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !session?.user?.email) return;
    socketRef.current?.emit("chatMessage", {
      roomId,
      sender: session.user.email,
      message: chatInput.trim(),
    });
    setChatInput("");
  }

  if (status === "loading" || loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <h1 className={styles.header}>Room: {roomId}</h1>
          <p className={styles.unauthText}>Please log in before using CodeCollab.</p>
          <Link href="/login" className={styles.loginButton}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <p className={styles.unauthText}>Please log in before using CodeCollab.</p>
          <Link href="/login" className={styles.loginButton}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>
        Room: <span>{roomId}</span>
      </h1>
      <p className={styles.userInfo}>Signed in as: {session?.user?.email}</p>
      {joinError && <div className={styles.errorBanner}>Error: {joinError}</div>}
      {roomInfo && (
        <div className={styles.roomInfo}>
          <b>Room Name:</b> {roomInfo.name || "—"}
          <br />
          <b>Created by:</b> {roomInfo.creator_email}
        </div>
      )}
      {session?.user?.email && roomInfo?.creator_email === session.user.email && (
        <button
          disabled={deleting}
          className={styles.deleteBtn}
          onClick={handleDeleteRoom}
        >
          {deleting ? "Deleting..." : "Delete Room"}
        </button>
      )}
      <b>Online Now:</b>
      <ul className={styles.usersList}>
        {users.map((u) => (
          <li key={u.email} className={styles.userListItem}>
            {u.image && (
              <img
                src={u.image}
                alt={u.name || u.email}
                width={32}
                height={32}
                className={styles.userAvatar}
              />
            )}
            <span>{u.name || u.email}</span>
          </li>
        ))}
      </ul>
      <div className={styles.chatSection}>
        <b>Room Chat</b>
        <div className={styles.chatMessages}>
          {messages.length === 0 && (
            <span style={{ color: "#aaa" }}>No messages yet</span>
          )}
          {messages.map((m, i) => (
            <div key={i}>
              <b style={{ color: "#4fd1c5" }}>{m.sender}:</b> {m.message}
              {m.created_at && (
                <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
                  {new Date(m.created_at).toLocaleTimeString()}
                </span>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className={styles.inputForm}>
          <input
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className={styles.inputMessage}
            disabled={!!joinError}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!!joinError}
          >
            Send
          </button>
        </form>
      </div>
      <select
        value={language}
        onChange={handleLanguageChange}
        className={styles.selectLang}
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>
      <MonacoEditor
        height="60vh"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          fontSize: 16,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
}
