"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";

import styles from "./room.module.css";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type User = { email: string; name?: string; image?: string };
type Message = { sender: string; message: string; created_at?: string };

type RoomClientProps = {
  roomId: string;
};

export default function RoomClient({ roomId }: RoomClientProps) {
  const { data: session, status } = useSession();

  const socketRef = useRef<Socket | null>(null);

  const [code, setCode] = useState("// Start coding!\n");
  const [users, setUsers] = useState<User[]>([]);
  const [language, setLanguage] = useState("javascript");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<{ name?: string; creator_email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [stdin, setStdin] = useState("");
  const [runOutput, setRunOutput] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3001";
    socketRef.current = io(baseUrl, { transports: ["websocket"] });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    fetch(`/api/rooms/${roomId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || data.error) {
          setJoinError(data.error || "Could not load room details.");
          setRoomInfo(null);
        } else {
          setRoomInfo(data);
        }
      })
      .catch(() => setJoinError("Could not fetch room info."))
      .finally(() => setLoading(false));
  }, [roomId]);

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
      else {
        if (data?.code) setCode(data.code);
        if (data?.language) setLanguage(data.language);
      }
    });

    socket.on("roomUsers", (u: User[]) => setUsers(u));
    socket.on("newChatMessage", (msg: Message) => setMessages((prev) => [...prev, msg]));
    socket.on("chatHistory", (history: Message[]) => setMessages(history || []));

    return () => {
      socket.off("codeUpdate");
      socket.off("roomUsers");
      socket.off("newChatMessage");
      socket.off("chatHistory");
      socket.off("joinError");
    };
  }, [roomId, session?.user?.email, session?.user?.name, session?.user?.image, joinError]);

  async function handleDeleteRoom() {
    if (!roomId || !session?.user?.email) return;
    setDeleting(true);
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestor: session.user.email }),
    });
    const data = await res.json();
    setDeleting(false);
    if (data.success) {
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

  async function handleRunCode() {
    if (!code.trim()) {
      setRunError("Add some code before running.");
      setRunOutput("");
      return;
    }

    setIsRunning(true);
    setRunError(null);
    setLastRun(null);

    try {
      const res = await fetch(`/api/rooms/${roomId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, stdin }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setRunError(data.error || "Code execution failed.");
        setRunOutput(data.output || "");
        return;
      }

      const output = typeof data.output === "string" ? data.output.trim() : "";
      setRunOutput(output || "Program finished with no output.");
      setRunError(data.stderr ? data.stderr.trim() : null);
      setLastRun(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("runCode error", error);
      setRunError("Unable to reach the execution service.");
      setRunOutput("");
    } finally {
      setIsRunning(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className={styles.page}>Loading…</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.page}>
        <div className={styles.loginPrompt}>
          <h1>Room: {roomId}</h1>
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
      <div className={styles.page}>
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
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.roomMeta}>
          <h1 className={styles.heading}>
            Room: <span>{roomId}</span>
          </h1>
          <p className={styles.subHeading}>Signed in as {session.user.email}</p>
          {roomInfo && (
            <p className={styles.roomDetails}>
              <span>{roomInfo.name || "Untitled room"}</span>
              <span>Created by {roomInfo.creator_email}</span>
            </p>
          )}
        </div>
        {session.user.email && roomInfo?.creator_email === session.user.email && (
          <button
            type="button"
            onClick={handleDeleteRoom}
            disabled={deleting}
            className={styles.deleteBtn}
          >
            {deleting ? "Deleting…" : "Delete room"}
          </button>
        )}
      </header>

      {joinError && <div className={styles.errorBanner}>Error: {joinError}</div>}

      <div className={styles.workspace}>
        <section className={styles.editorColumn}>
          <div className={styles.toolbar}>
            <label className={styles.fieldLabel}>
              Language
              <select value={language} onChange={handleLanguageChange} className={styles.selectLang}>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </label>
            <div className={styles.runActions}>
              <textarea
                className={styles.stdinInput}
                placeholder="Optional input (stdin)"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={1}
              />
              <button
                type="button"
                onClick={handleRunCode}
                className={styles.runButton}
                disabled={isRunning}
              >
                {isRunning ? "Running…" : "Run code"}
              </button>
            </div>
          </div>

          <div className={styles.editorShell}>
            <MonacoEditor
              height="58vh"
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

          <div className={styles.outputCard}>
            <div className={styles.outputHeading}>
              <h2>Program output</h2>
              {lastRun && <span className={styles.outputTimestamp}>Last run {lastRun}</span>}
            </div>
            {runError && <p className={styles.outputError}>{runError}</p>}
            <pre className={styles.outputPane}>{runOutput}</pre>
          </div>
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h2>Participants</h2>
            <ul className={styles.usersList}>
              {users.length === 0 && <li className={styles.emptyState}>No one else is here yet.</li>}
              {users.map((u) => (
                <li key={u.email} className={styles.userListItem}>
                  {u.image && (
                    <img
                      src={u.image}
                      alt={u.name || u.email}
                      width={36}
                      height={36}
                      className={styles.userAvatar}
                    />
                  )}
                  <div>
                    <span className={styles.userName}>{u.name || u.email}</span>
                    {u.name && <span className={styles.userEmail}>{u.email}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.card}>
            <h2>Room chat</h2>
            <div className={styles.chatMessages}>
              {messages.length === 0 && <span className={styles.emptyState}>No messages yet</span>}
              {messages.map((m, i) => (
                <div key={i} className={styles.chatMessage}>
                  <span className={styles.chatAuthor}>{m.sender}</span>
                  <span className={styles.chatBody}>{m.message}</span>
                  {m.created_at && (
                    <span className={styles.chatTimestamp}>
                      {new Date(m.created_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className={styles.chatForm}>
              <input
                type="text"
                placeholder="Type a message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className={styles.chatInput}
                disabled={!!joinError}
              />
              <button type="submit" className={styles.sendBtn} disabled={!!joinError}>
                Send
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
