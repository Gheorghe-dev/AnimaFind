"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Me } from "@/lib/types";

import { gameApi } from "@/lib/api-client";

type Ctx = {
  me: Me | null;
  loading: boolean;
  setMe: (me: Me) => void;
  refresh: () => Promise<void>;
  toast: (message: string, kind?: "info" | "error") => void;
};

const AppContext = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: string }[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await gameApi.getMe();
      if (mountedRef.current) {
        setMe(data);
      }
    } catch (err) {
      console.error("[AppProvider] Failed to load local profile:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // initial load and periodic sync (keep cans honest)
  useEffect(() => {
    let active = true;
    async function loadMe() {
      try {
        const data = await gameApi.getMe();
        if (active) {
          setMe(data);
        }
      } catch (err) {
        console.error("[AppProvider] Failed to load local profile:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadMe();
    const id = setInterval(loadMe, 15_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const toast = useCallback((message: string, kind: "info" | "error" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const value = useMemo(
    () => ({ me, loading, setMe, refresh, toast }),
    [me, loading, setMe, refresh, toast],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`doodle max-w-sm px-4 py-2 text-sm font-semibold ${
              t.kind === "error" ? "bg-[#ffe3d6]" : "bg-[#e8f2dd]"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
