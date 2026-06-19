"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
} from "@elevenlabs/react";
import { Loader2, Mic, MicOff, Settings, X } from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────

const AGENT_ID = "agent_8301kve7hrxsf4z92t739y21nxza";

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Animated orb — pulses when idle, glows when active */
function VoiceOrb({ active }: { active: boolean }) {
  return (
    <div className="relative w-[220px] h-[220px]">
      {/* Glow ring */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"
          }`}
        style={{
          boxShadow: "0 0 80px 20px rgba(0,120,255,0.35)",
        }}
      />

      {/* Orb body */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${active ? "scale-[1.03]" : "scale-100"
          }`}
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #00e5ff 0%, #2979ff 35%, #6200ea 70%, #1a237e 100%)",
          animation: "orb-pulse 3s ease-in-out infinite",
          boxShadow:
            "0 0 60px rgba(0,120,255,0.25), inset 0 0 40px rgba(0,0,0,0.3)",
        }}
      />

      {/* Specular highlight */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, transparent 55%)",
        }}
      />

      {/* Subtle border */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-3px",
          border: "1.5px solid rgba(100,160,255,0.20)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

/** The two pill-shaped control buttons */
function ControlPill({
  onEnd,
  onToggleMic,
  muted,
}: {
  onEnd: () => void;
  onToggleMic: () => void;
  muted: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center gap-3 px-[18px] py-[10px] rounded-full"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* End / close */}
      <button
        type="button"
        aria-label="Terminer la session"
        onClick={onEnd}
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.12)", border: "none" }}
        onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.22)")
        }
        onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.12)")
        }
      >
        <X size={18} color="white" strokeWidth={2.2} />
      </button>

      {/* Mic toggle */}
      <button
        type="button"
        aria-label={muted ? "Activer le micro" : "Couper le micro"}
        onClick={onToggleMic}
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.14)", border: "none" }}
        onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.24)")
        }
        onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.14)")
        }
      >
        {muted ? (
          <MicOff size={20} color="white" strokeWidth={2} />
        ) : (
          <Mic size={20} color="white" strokeWidth={2} />
        )}
      </button>
    </div>
  );
}

// ─── Connected Agent ─────────────────────────────────────────────────────────

function Agent({ signedUrl, muted, onMutedChange }: { signedUrl: string; muted: boolean; onMutedChange: (m: boolean) => void }) {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [ended, setEnded] = useState(false);
  const [started, setStarted] = useState(false);
  const speakingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const isDisconnected = status === "disconnected";

  const handleStart = useCallback(() => {
    setStarted(true);
    setEnded(false);
    startSession({
      signedUrl,
      onMessage: (props) => {
        if (props.role === "agent") {
          setAgentSpeaking(true);
          if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
          speakingTimeout.current = setTimeout(
            () => setAgentSpeaking(false),
            800
          );
        }
      },
      onError: (message: string) => {
        console.error(message);
      },
    });
  }, [signedUrl, startSession]);

  const handleEnd = useCallback(() => {
    endSession();
    setAgentSpeaking(false);
    setStarted(false);
    setEnded(true);
    setTimeout(() => setEnded(false), 2000);
  }, [endSession]);

  const handleToggleMic = useCallback(() => {
    onMutedChange(!muted);
  }, [muted, onMutedChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
    };
  }, []);

  // ── Status text ──
  const statusLine = () => {
    if (ended) return "Session terminée";
    if (isConnecting) return "Connexion en cours...";
    if (muted) return "Microphone coupé";
    if (agentSpeaking) return "Le professeur Zacharias Tanee Fomum parle...";
    if (isConnected) return "Je vous écoute...\nQue voulez-vous partager?";
    return "Prêt";
  };

  const orbActive = isConnected && !ended && !muted && agentSpeaking;

  return (
    <div className="flex flex-col items-center gap-0 w-full max-w-[500px]">
      {/* Orb */}
      <div className="mb-10">
        <VoiceOrb active={orbActive} />
      </div>

      {/* Status text */}
      <p
        className="text-white text-[1.45rem] font-semibold text-center leading-[1.4] tracking-[-0.01em] mb-11 min-h-[2.8rem] whitespace-pre-line"
        style={{ textShadow: "0 1px 24px rgba(0,120,255,0.18)" }}
      >
        {isConnecting ? (
          <span className="flex items-center justify-center gap-2 text-[1.1rem] text-white/70">
            <Loader2 size={18} className="animate-spin" />
            Connexion à l&apos;agent...
          </span>
        ) : (
          statusLine()
        )}
      </p>

      {/* Start button — shows when not connected and not started yet */}
      {isDisconnected && !started && !ended && (
        <button
          type="button"
          onClick={handleStart}
          className="px-8 py-3.5 rounded-full text-white text-base font-medium tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-2.5"
          style={{
            background: "linear-gradient(135deg, #2979ff 0%, #6200ea 100%)",
            border: "none",
            boxShadow: "0 0 40px rgba(41,121,255,0.35)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 60px rgba(41,121,255,0.55)";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 40px rgba(41,121,255,0.35)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <Mic size={20} strokeWidth={2.2} />
          Démarrer
        </button>
      )}

      {/* Controls — shows when connected or just ended */}
      {(isConnected || ended) && (
        <ControlPill
          onEnd={handleEnd}
          onToggleMic={handleToggleMic}
          muted={muted}
        />
      )}
    </div>
  );
}

// ─── Loading / Error screens ──────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[500px]">
      <VoiceOrb active={false} />
      <p className="text-white/50 text-sm animate-pulse mt-8">
        Connexion à l&apos;agent vocal...
      </p>
    </div>
  );
}

function ErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[500px]">
      <VoiceOrb active={false} />
      <div className="mt-8 flex flex-col items-center gap-4">
        <span
          className="text-xs px-3 py-1 rounded-full text-red-300"
          style={{ background: "rgba(220,50,50,0.18)", border: "1px solid rgba(220,50,50,0.3)" }}
        >
          Erreur de connexion
        </span>
        <p className="text-white/50 text-sm text-center max-w-[280px]">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 px-5 py-2 rounded-full text-sm text-white/80 transition-colors duration-200 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
          onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.18)")
          }
          onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.10)")
          }
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);

  const fetchSignedUrl = useCallback(async () => {
    setError("");
    setSignedUrl(null);
    try {
      const res = await fetch("/api/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: AGENT_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      setSignedUrl(data.signedUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }, []);

  // Fetch on mount + optional welcome audio
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: AGENT_ID }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) { setError(data.error ?? "Erreur serveur"); return; }
        setSignedUrl(data.signedUrl);
        try {
          const audio = new Audio("/api/welcome-sound");
          audio.volume = 0.3;
          await audio.play();
        } catch { /* autoplay blocked — non-critical */ }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erreur inconnue");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* Global styles for the orb animation */}
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.04); opacity: 0.93; }
        }
      `}</style>

      <main
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #0e2040 0%, #060f1e 60%, #03080f 100%)",
        }}
      >
        {/* Settings icon — top-right */}
        <button
          type="button"
          aria-label="Paramètres"
          className="absolute top-5 right-5 text-white/40 hover:text-white/80 transition-colors duration-200 bg-transparent border-none cursor-pointer p-1"
        >
          <Settings size={22} strokeWidth={1.6} />
        </button>

        {/* Content */}
        {error ? (
          <ErrorScreen message={error} onRetry={fetchSignedUrl} />
        ) : !signedUrl ? (
          <LoadingScreen />
        ) : (
          <ConversationProvider
            isMuted={muted}
            onMutedChange={setMuted}
            onError={(err) => console.error("Conversation error:", err)}
          >
            <Agent signedUrl={signedUrl} muted={muted} onMutedChange={setMuted} />
          </ConversationProvider>
        )}
      </main>
    </>
  );
}

