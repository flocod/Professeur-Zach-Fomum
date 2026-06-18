"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
} from "@elevenlabs/react";

const AGENT_ID = "agent_8301kve7hrxsf4z92t739y21nxza";

function VoiceBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`voice-bar ${active ? "" : "idle"}`}
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function Agent({ signedUrl }: { signedUrl: string }) {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const speakingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  const handleStart = useCallback(() => {
    setAgentSpeaking(false);
    startSession({
      signedUrl,
      onMessage: (props) => {
        if (props.role === "agent") {
          setAgentSpeaking(true);
          if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
          speakingTimeout.current = setTimeout(
            () => setAgentSpeaking(false),
            600
          );
        }
      },
      onError: (message) => console.error(message),
    });
  }, [signedUrl, startSession]);

  const handleEnd = useCallback(() => {
    endSession();
    setAgentSpeaking(false);
  }, [endSession]);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4">
        <VoiceBars active={agentSpeaking || isConnected} />
        <p className="text-sm text-zinc-400 font-medium tracking-wide uppercase">
          {isConnecting
            ? "Connexion..."
            : isConnected
            ? agentSpeaking
              ? "L'agent parle"
              : "En écoute..."
            : "Prêt"}
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        {!isConnected && !isConnecting && (
          <>
            <div className="pulse-ring" />
            <div className="pulse-ring" />
            <div className="pulse-ring" />
          </>
        )}
        <button
          onClick={isConnected ? handleEnd : handleStart}
          disabled={isConnecting}
          className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full
            font-medium text-sm tracking-wide transition-all duration-500 cursor-pointer
            ${
              isConnected
                ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                : isConnecting
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 animate-pulse"
                : "bg-violet-600 text-white shadow-[0_0_60px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_80px_-10px_rgba(139,92,246,0.7)] hover:bg-violet-500"
            }`}
        >
          {isConnecting ? (
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : isConnected ? (
            "Arrêter"
          ) : (
            "Démarrer"
          )}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch("/api/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: AGENT_ID }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);
        setSignedUrl(data.signedUrl);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 gap-6">
        <h1 className="text-2xl font-light tracking-[0.2em] text-violet-300 uppercase">
          Pasteur Zach Fomum
        </h1>
        <p className="text-sm text-red-400/80">{error}</p>
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 gap-6">
        <h1 className="text-2xl font-light tracking-[0.2em] text-violet-300 uppercase">
          Pasteur Zach Fomum
        </h1>
        <div className="flex items-center gap-3 text-zinc-500 text-sm">
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Connexion à l&apos;agent...
        </div>
      </div>
    );
  }

  return (
    <ConversationProvider
      onError={(error) => console.error("Conversation error:", error)}
    >
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4">
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-light tracking-[0.2em] text-violet-300 uppercase">
              Pasteur Zach Fomum
            </h1>
            <p className="text-sm text-zinc-500 font-light">
              Agent vocal intelligent
            </p>
          </div>

          <Agent signedUrl={signedUrl} />
        </div>
      </div>
    </ConversationProvider>
  );
}
