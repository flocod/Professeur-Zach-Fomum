"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

const SoundContext = createContext<any>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const sndRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    import("snd-lib").then((mod) => {
      if (cancelled) return;
      const Snd = mod.default;
      const snd = new Snd({ preloadSoundKit: Snd.KITS?.SND01, easySetup: true });
      snd.load(Snd.KITS?.SND01);
      sndRef.current = snd;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SoundContext.Provider value={sndRef}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
