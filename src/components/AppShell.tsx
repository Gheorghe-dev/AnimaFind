"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "./AppProvider";
import Onboarding from "./Onboarding";
import { isSoundMuted, toggleSoundMuted, playClickSound } from "@/lib/audio";

const TABS = [
  { href: "/", label: "Scan", icon: "center_focus_weak" },
  { href: "/album", label: "Journal", icon: "auto_stories" },
  { href: "/codex", label: "Codex", icon: "menu_book" },
  { href: "/map", label: "Map", icon: "explore" },
  { href: "/shop", label: "Shop", icon: "storefront" },
];

function getSectionTitle(pathname: string): string {
  if (pathname === "/") return "Viewfinder Scan";
  if (pathname.startsWith("/album")) return "Journal Album";
  if (pathname.startsWith("/codex")) return "Species Codex";
  if (pathname.startsWith("/map")) return "Field Hotspots Map";
  if (pathname.startsWith("/shop")) return "Field Outpost & Shop";
  if (pathname.startsWith("/profile")) return "Naturalist Dossier";
  if (pathname.startsWith("/friends")) return "Field Rangers Crew";
  if (pathname.startsWith("/settings")) return "Expedition Settings";
  return "Expedition Folio";
}

function formatCountdown(seconds: number | null) {
  if (seconds == null) return "Ready";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `+1 in ${m}m ${s}s`;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { me, loading, refresh } = useApp();
  const pathname = usePathname();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stuck, setStuck] = useState(false);
  const [muted, setMuted] = useState(() => (typeof window !== "undefined" ? isSoundMuted() : false));

  function handleToggleSound() {
    const next = toggleSoundMuted();
    setMuted(next);
    if (!next) {
      playClickSound();
    }
  }

  const [prevSeconds, setPrevSeconds] = useState<number | null | undefined>(undefined);

  if (me?.cans.secondsUntilNext !== prevSeconds) {
    setPrevSeconds(me?.cans.secondsUntilNext);
    setCountdown(me?.cans.secondsUntilNext ?? null);
  }

  useEffect(() => {
    if (countdown == null) return;
    if (countdown === 0) {
      void refresh();
      return;
    }
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c == null) return null;
        if (c <= 1) {
          void refresh();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [countdown, refresh]);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setStuck(true), 10_000);
    return () => clearTimeout(id);
  }, [loading]);

  const isLanding = pathname === "/landing";
  if (isLanding) {
    return <>{children}</>;
  }

  if (loading && !stuck) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface text-on-surface">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shadow-md animate-pulse">
          <span className="material-symbols-outlined text-[36px] text-secondary">explore</span>
        </div>
        <p className="font-headline-md text-headline-md font-bold text-primary animate-pulse">Sharpening Field Pencils…</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant">Opening your Naturalist Folio</p>
      </div>
    );
  }

  if (stuck) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center bg-surface text-on-surface">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined text-[36px] text-tertiary">satellite_alt</span>
        </div>
        <h2 className="font-headline-md text-headline-md font-bold text-primary">Field Outpost Unreachable</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          The field station could not be reached, or initial journal synchronization timed out.
        </p>
        <button
          className="mt-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-label-md text-label-md font-bold uppercase shadow-md active:translate-y-0.5"
          onClick={() => window.location.reload()}
        >
          Reconnect
        </button>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center bg-surface text-on-surface">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined text-[36px] text-secondary">search_off</span>
        </div>
        <p className="font-headline-md text-headline-md font-bold text-primary">Could not open field journal.</p>
        <button
          className="mt-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-label-md text-label-md font-bold uppercase shadow-md active:translate-y-0.5"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!me.user.gdprConsentAt) return <Onboarding />;

  const sectionTitle = getSectionTitle(pathname);

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* ─── Top Expedition Header ─── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(43,58,44,0.06)]">
        <div className="h-28 px-margin-mobile flex flex-col justify-between py-space-xs max-w-lg mx-auto">
          {/* Row 1: Brand, Rank, Avatar */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => playClickSound()}
              className="flex items-center gap-space-xs group"
              aria-label="AnimaFind Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="AnimaFind Compass Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:rotate-12"
                src="/compass-logo.png"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
                AnimaFind
              </span>
              <span className="hidden sm:inline-block font-label-md text-label-md text-on-surface-variant">
                • {sectionTitle}
              </span>
            </Link>

            <div className="flex items-center gap-space-xs">
              <div className="flex items-center gap-space-2xs bg-surface-container-high px-space-xs py-0.5 rounded-full shadow-[inset_0_1px_2px_rgba(43,58,44,0.08)]">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-md text-label-md text-primary-container font-bold">
                  Lvl {me.user.level} Ranger
                </span>
              </div>
              <Link
                href="/profile"
                onClick={() => playClickSound()}
                className="relative group block"
                aria-label="View Naturalist Profile"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/20 group-hover:ring-secondary transition-all"
                  src="/ranger-avatar.png"
                  onError={(e) => {
                    // Fallback to div if missing
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </Link>
            </div>
          </div>

          {/* Row 2: Rations, Coins, Audio, Section Title */}
          <div className="flex items-center justify-between gap-space-xs pt-1">
            <div className="flex items-center gap-space-xs">
              {/* Energy Cans */}
              <div
                className="flex items-center gap-1.5 bg-surface-container-low px-space-xs py-1 rounded-lg shadow-[0_1px_3px_rgba(43,58,44,0.08)] cursor-pointer"
                title={`${me.cans.current} of ${me.cans.max} Cans available`}
              >
                <span aria-hidden="true" className="text-base leading-none">🥫</span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {me.cans.current}/{me.cans.max} Cans
                </span>
                <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-1 py-0.2 rounded font-bold">
                  {formatCountdown(countdown)}
                </span>
              </div>

              {/* Currency */}
              <Link
                href="/shop"
                onClick={() => playClickSound()}
                className="flex items-center gap-1 bg-surface-container-low px-space-xs py-1 rounded-lg shadow-[0_1px_3px_rgba(43,58,44,0.08)] hover:bg-surface-container transition-colors"
                title="Field supply balance"
              >
                <span aria-hidden="true" className="text-base leading-none">🪙</span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {me.user.coins}
                </span>
              </Link>

              {/* Mute Audio Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="flex items-center justify-center p-1.5 rounded-lg bg-surface-container-low text-primary shadow-[0_1px_3px_rgba(43,58,44,0.08)] hover:bg-surface-container active:scale-95 transition-all"
                title={muted ? "Unmute field audio" : "Mute field audio"}
                aria-label={muted ? "Unmute field audio" : "Mute field audio"}
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  {muted ? "volume_off" : "volume_up"}
                </span>
              </button>
            </div>

            <div className="sm:hidden flex items-center">
              <span className="font-label-md text-label-md text-on-surface-variant font-bold truncate max-w-[130px]">
                {sectionTitle}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Viewport ─── */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-28 pb-24 px-0 relative">
        {children}
      </main>

      {/* ─── Floating Native Bottom Navigation Dock ─── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(43,58,44,0.08)]"
        data-active-classes="text-primary-container font-bold scale-105"
      >
        <div className="flex justify-around items-center h-20 px-space-xs max-w-lg mx-auto">
          {TABS.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => playClickSound()}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] transition-all ${
                  active
                    ? "text-primary font-bold scale-105"
                    : "text-on-surface-variant hover:text-on-surface active:scale-95"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    active ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="font-label-sm text-label-sm">
                  {tab.label}
                </span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary -mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
