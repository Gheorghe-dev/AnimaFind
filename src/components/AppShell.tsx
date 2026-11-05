"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "./AppProvider";
import Onboarding from "./Onboarding";
import {
  IconCamera,
  IconAlbum,
  IconMap,
  IconFriends,
  IconUser,
  IconCodex,
  IconShop,
  IconSword,
  IconSettings,
  IconSparkles,
  IconFlame,
  IconCan,
  IconCoin,
  IconPaw,
  IconRadar,
  IconSearch,
  AvatarIcon,
} from "./icons/AppIcons";

const TABS = [
  { href: "/", label: "Scan", icon: IconCamera },
  { href: "/album", label: "Album", icon: IconAlbum },
  { href: "/map", label: "Map", icon: IconMap },
  { href: "/friends", label: "Friends", icon: IconFriends },
  { href: "/profile", label: "You", icon: IconUser },
];

const SUB_NAV = [
  { href: "/landing", label: "About SaaS", icon: IconSparkles },
  { href: "/codex", label: "Encyclopedia", icon: IconCodex },
  { href: "/shop", label: "Shop", icon: IconShop },
  { href: "/pvp", label: "PvP", icon: IconSword },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

function formatCountdown(seconds: number | null) {
  if (seconds == null) return "full";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { me, loading, refresh } = useApp();
  const pathname = usePathname();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stuck, setStuck] = useState(false);

  const [prevSeconds, setPrevSeconds] = useState<number | null | undefined>(undefined);

  // Sync countdown when cans data updates (official React pattern for state from props/context)
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

  // If loading takes more than 10s, show a retry prompt
  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setStuck(true), 10_000);
    return () => clearTimeout(id);
  }, [loading]);

  // Landing page renders full-screen without app shell wrapper
  const isLanding = pathname === "/landing";
  if (isLanding) {
    return <>{children}</>;
  }

  // Loading splash
  if (loading && !stuck) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-paper2 border-2 border-ink shadow-md">
          <IconPaw size={40} className="text-leaf animate-pulse" />
        </div>
        <p className="animate-pulse text-lg font-bold text-inksoft">Sharpening pencils…</p>
        <p className="text-xs text-inksoft">First visit sets up your field journal</p>
      </div>
    );
  }

  if (stuck) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-paper2 border-2 border-ink shadow-md text-inksoft">
          <IconRadar size={32} />
        </div>
        <p className="font-black">The field station is not responding.</p>
        <p className="text-sm text-inksoft">
          This usually means the server could not be reached, or the first data load is still pending.
        </p>
        <button className="btn btn-accent" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // No user data yet (should not happen after loading = false, but guard anyway)
  if (!me) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-paper2 border-2 border-ink shadow-md text-inksoft">
          <IconSearch size={32} />
        </div>
        <p className="font-black">Could not reach the field journal.</p>
        <button className="btn btn-accent" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // Not yet consented — show onboarding
  if (!me.user.gdprConsentAt) return <Onboarding />;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {/* ─── top bar ─── */}
      <header
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
        className="sticky top-0 z-40 border-b-2 border-ink/15 bg-paper/90 px-3 py-2 backdrop-blur"
      >
        <div className="flex items-center justify-between gap-2">
          <Link href="/profile" className="flex items-center gap-2 group" aria-label="Go to your naturalist profile">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-white shadow-sm transition-transform group-hover:scale-105">
              <AvatarIcon seed={me.user.avatarSeed} size={20} className="text-ink" />
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-black truncate max-w-[110px]">{me.user.username}</span>
              <span className="flex items-center gap-1 text-[10px] text-inksoft font-semibold">
                <span>Lv {me.user.level}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-0.5 text-accent">
                  <IconFlame size={11} className="shrink-0" />
                  <span>{me.user.streakCount}</span>
                </span>
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-black">
            <span
              className="doodle-soft bg-white/80 px-2 py-1 inline-flex items-center gap-1 border border-ink/15 shadow-sm"
              title="Cans remaining"
              aria-label={`${me.cans.current} of ${me.cans.max} cans available`}
            >
              <IconCan size={14} className="text-leaf shrink-0" />
              <span>
                {me.cans.current}/{me.cans.max}
              </span>
              <span className="text-[10px] font-semibold text-inksoft">({formatCountdown(countdown)})</span>
            </span>
            <Link
              href="/shop"
              className="doodle-soft bg-white/80 px-2 py-1 inline-flex items-center gap-1 hover:bg-white border border-ink/15 shadow-sm transition-colors"
              aria-label={`View shop balance: ${me.user.coins} coins`}
            >
              <IconCoin size={14} className="text-amber-500 shrink-0" />
              <span>{me.user.coins}</span>
            </Link>
          </div>
        </div>
        <nav className="scrollhide mt-2 flex gap-1.5 overflow-x-auto text-[11px] font-bold pb-0.5">
          {SUB_NAV.map((l) => {
            const IconComp = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/30 px-3 py-1 transition-all ${
                  active ? "bg-ink text-paper shadow-sm" : "bg-white/70 hover:bg-white text-ink"
                }`}
              >
                <IconComp size={13} className={active ? "text-paper" : "text-ink"} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ─── page content ─── */}
      <main className="flex-1 px-3 pb-40 pt-3">{children}</main>

      {/* ─── ad banner (non-premium only) ─── */}
      {!me.user.isPremiumActive && (
        <div
          style={{ bottom: "calc(3.4rem + max(env(safe-area-inset-bottom), 8px) + 6px)" }}
          className="fixed inset-x-0 z-40 mx-auto max-w-md px-3 pointer-events-auto"
        >
          <div className="doodle-soft flex items-center justify-between bg-[#fff6e2] px-3 py-1.5 text-[11px] shadow-sm border border-amber-200">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-black bg-ink/10 px-1.5 py-0.5 rounded text-[9px] uppercase">Ad</span>
              <span>Field Club Premium: 10-min recharge, cap 8</span>
            </span>
            <Link href="/shop" className="font-black text-accent underline ml-2 whitespace-nowrap">
              Try it
            </Link>
          </div>
        </div>
      )}

      {/* ─── bottom tab bar ─── */}
      <nav
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t-2 border-ink bg-paper2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      >
        <ul className="grid grid-cols-5 py-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            const TabIcon = tab.icon;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-label={tab.label}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-black transition-colors ${
                    active ? "text-accent" : "text-inksoft hover:text-ink"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-xl transition-all ${
                      active ? "bg-accent/15 scale-110" : ""
                    }`}
                  >
                    <TabIcon size={18} className={active ? "text-accent" : "text-inksoft"} />
                  </span>
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
