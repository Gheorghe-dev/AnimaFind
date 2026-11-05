"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "3D Card Studio", href: "#simulator" },
    { label: "Anti-Cheat AI", href: "#anti-cheat" },
    { label: "35-Species Codex", href: "#codex" },
    { label: "Community Map", href: "#map" },
    { label: "Field Club & Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink/10 bg-paper/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/landing" className="group flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border-2 border-ink bg-white text-xl shadow-xs transition-transform group-hover:scale-105">
            🐾
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-ink sm:text-xl">AnimaFind</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-inksoft">
              Critter Codex · SaaS
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-bold text-inksoft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-full border border-ink/20 bg-white/70 px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-white sm:inline-flex"
            title="Switch to in-app scanner"
          >
            <span>📷</span>
            <span>Viewfinder</span>
          </Link>

          <Link
            href="/"
            className="btn btn-accent px-4 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm"
          >
            Launch Web App →
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-ink/20 bg-white/80 text-ink lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <span className="text-base">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-ink/10 bg-paper px-4 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-white/70"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex gap-2 border-t border-ink/10 pt-3">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="btn btn-accent flex-1 text-center text-xs"
              >
                Launch Scanner Web App
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
