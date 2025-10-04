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

  const features = [
    {
      title: "Live collaboration",
      body: "Sync code edits, language changes, and cursor presence instantly across everyone in the room.",
    },
    {
      title: "In-room chat",
      body: "Keep discussions close to the code with a lightweight chat that stores the latest history for each room.",
    },
    {
      title: "Secure access",
      body: "NextAuth handles sign-in with Google or GitHub while Supabase stores room metadata securely.",
    },
    {
      title: "One-click execution",
      body: "Run JavaScript, TypeScript, Python, C++, or Java in the cloud without setting up toolchains locally.",
    },
  ];

  const workflow = [
    {
      label: "01",
      heading: "Create or join",
      copy: "Start a brand-new space or jump into an existing room by entering its invite code.",
    },
    {
      label: "02",
      heading: "Invite collaborators",
      copy: "Share the code and everyone sees edits, messages, and execution output in real time.",
    },
    {
      label: "03",
      heading: "Ship ideas faster",
      copy: "Prototype together, run tests, and keep everyone aligned from kickoff to handoff.",
    },
  ];

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
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Collaborate anywhere</span>
          <h1 className={styles.title}>
            Build together in <span>real-time</span>
          </h1>
          <p className={styles.subtitle}>
            Pair programming, coding interviews, classroom demos, or hackathons—CodeCollab keeps everyone in sync with shared code, chat, and instant execution.
          </p>
          {message && <div className={styles.notice}>{message}</div>}
          <span className={styles.scrollHint}>Scroll to explore the platform ↓</span>
        </div>

        <div className={styles.heroActions}>
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
      </section>

      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Why teams choose CodeCollab</h2>
            <p className={styles.sectionBody}>
              Everything you need to co-create software in the browser. No local environment syncing, no context switching—just an instant workspace that feels as fast as working side-by-side.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <span className={styles.featureTitle}>{feature.title}</span>
                <p>{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>How it works</h2>
            <p className={styles.sectionBody}>
              Three simple steps take you from idea to working prototype. Every room persists code and chat so you can pick up where you left off.
            </p>
          </div>
          <div className={styles.steps}>
            {workflow.map((step) => (
              <div key={step.label} className={styles.step}>
                <span className={styles.stepNumber}>{step.label}</span>
                <strong>{step.heading}</strong>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Under the hood</h2>
            <p className={styles.sectionBody}>
              CodeCollab is powered by a modern edge-first stack. That means blazing-fast load times, secure authentication, and realtime updates you can trust.
            </p>
          </div>
          <div className={styles.splitSection}>
            <div>
              <h3 className={styles.featureTitle}>Platform highlights</h3>
              <ul className={styles.bulletList}>
                <li>Next.js App Router with streaming rendering and edge middleware</li>
                <li>NestJS API on Railway with Socket.IO for realtime collaboration</li>
                <li>Supabase storage for persistent room data and activity logs</li>
                <li>Piston-powered execution sandbox for five popular languages</li>
              </ul>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Perfect for</h3>
              <ul className={styles.bulletList}>
                <li>Pair programming sessions and remote mob reviews</li>
                <li>Live coding interviews without environment friction</li>
                <li>Workshops, classrooms, and quick prototyping</li>
                <li>Hackathons where speed and alignment matter most</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.ctaBanner}>
            <h2 className={styles.sectionHeading}>Ready to launch your next session?</h2>
            <p className={styles.sectionBody}>
              Sign in, spin up a room, and invite collaborators in seconds. CodeCollab keeps your team focused on shipping ideas—not on tooling.
            </p>
            <div className={styles.ctaActions}>
              <button type="button" className={styles.joinButton} onClick={handleCreate}>
                Create a room now
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => router.push("/login")}
              >
                Review authentication options
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <span>Created by Ayush Kunjadia</span>
          <a href="mailto:atkunjadia@gmail.com">atkunjadia@gmail.com</a>
          <a href="https://www.linkedin.com/in/ayushkunjadia/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://github.com/ayushkunjadia" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <small>Building tools that help teams collaborate without borders.</small>
      </footer>
    </main>
  );
}
