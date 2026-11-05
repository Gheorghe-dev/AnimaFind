import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="relative bg-[#221e19] text-[#efe5d0] overflow-hidden pt-16 pb-12 border-t-2 border-ink">
      {/* Glow Effect */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Pre-footer Call to Action Card */}
        <div className="doodle relative overflow-hidden bg-gradient-to-r from-[#2c2823] to-[#3a342c] p-8 sm:p-12 text-center text-white mb-16 border-2 border-[#fffdf6]/20">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-3xl">🐾</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Turn Nature Into Your Personal Card Codex?
            </h2>
            <p className="text-xs sm:text-sm text-[#efe5d0]/80 font-medium leading-relaxed">
              No account required to test the viewfinder. Open your phone camera, spot a bird or squirrel,
              and mint your first trading card right now in your browser.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="btn btn-accent px-8 py-3 text-sm font-black w-full sm:w-auto shadow-lg"
              >
                🚀 Launch Web App Now — Free
              </Link>
              <Link
                href="/codex"
                className="btn px-6 py-3 text-sm font-bold text-ink w-full sm:w-auto"
              >
                Browse 35 Species
              </Link>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 text-xs pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/30 bg-white/10 text-lg">
                🐾
              </span>
              <span className="text-base font-black tracking-tight text-white">AnimaFind</span>
            </div>
            <p className="text-[#efe5d0]/70 leading-relaxed font-medium max-w-sm">
              Critter Codex: A gamified real-world wildlife exploration &amp; collectible trading card SaaS.
              Proudly designed for nature lovers, ethical explorers, and curious naturalists.
            </p>
            <div className="text-[10px] text-[#efe5d0]/50">
              Built with Next.js 16, React 19, TypeScript, Tailwind CSS &amp; Capacitor.
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <h3 className="font-black text-white uppercase tracking-wider text-[11px]">Product</h3>
            <ul className="space-y-2 text-[#efe5d0]/75">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Field Scanner Viewfinder
                </Link>
              </li>
              <li>
                <Link href="/codex" className="hover:text-accent transition-colors">
                  Wildlife Codex (35 Taxa)
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-accent transition-colors">
                  Fuzzed Community Map
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-accent transition-colors">
                  Field Club &amp; Energy Shop
                </Link>
              </li>
              <li>
                <Link href="/pvp" className="hover:text-accent transition-colors">
                  PvP Card Arena
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="space-y-2.5">
            <h3 className="font-black text-white uppercase tracking-wider text-[11px]">Technology</h3>
            <ul className="space-y-2 text-[#efe5d0]/75">
              <li>
                <a href="#anti-cheat" className="hover:text-accent transition-colors">
                  On-Device Heuristic AI
                </a>
              </li>
              <li>
                <a href="#anti-cheat" className="hover:text-accent transition-colors">
                  Motion Parallax Detection
                </a>
              </li>
              <li>
                <a href="#anti-cheat" className="hover:text-accent transition-colors">
                  Moiré Screen Rejection
                </a>
              </li>
              <li>
                <a href="#anti-cheat" className="hover:text-accent transition-colors">
                  64-Bit pHash Verification
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-accent transition-colors">
                  Procedural Card Minting
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Ethics */}
          <div className="space-y-2.5">
            <h3 className="font-black text-white uppercase tracking-wider text-[11px]">Ethics &amp; Legal</h3>
            <ul className="space-y-2 text-[#efe5d0]/75">
              <li>
                <Link href="/settings#privacy" className="hover:text-accent transition-colors">
                  GDPR Art. 6 Compliance
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-accent transition-colors">
                  Full Account Data Export
                </Link>
              </li>
              <li>
                <a href="#map" className="hover:text-accent transition-colors">
                  5km Sanctuary Fuzzing
                </a>
              </li>
              <li>
                <Link href="/settings" className="hover:text-accent transition-colors">
                  Wildlife Code of Conduct
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-accent transition-colors">
                  One-Click Account Wipe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#efe5d0]/60">
          <div>
            © {new Date().getFullYear()} AnimaFind (Critter Codex). All rights reserved. Take only photos, leave only footprints.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Web App
            </Link>
            <span>·</span>
            <Link href="/codex" className="hover:text-white transition-colors">
              Encyclopedia
            </Link>
            <span>·</span>
            <Link href="/shop" className="hover:text-white transition-colors">
              Field Club
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
