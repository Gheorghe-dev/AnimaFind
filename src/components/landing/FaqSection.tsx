"use client";

import { useState } from "react";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does AnimaFind upload my camera feed to the cloud?",
      a: "No! All real-time computer vision feature extraction runs 100% locally on your device in HTML5 Canvas at 60 FPS. Unverified frames never leave your phone. Only when you confirm a sighting and land the tin-can toss is a single verified capture submitted to mint your card.",
    },
    {
      q: "How does the anti-cheat catch computer screens and photos?",
      a: "Our heuristic engine tracks two key physical signatures: Motion Parallax (handheld micro-tremors reveal 3D scene depth, which 2D photos lack) and Moiré Spatial Noise (a 2D frequency filter that detects the microscopic subpixel grid of monitors and phones). Duplicate image hashes are also rejected.",
    },
    {
      q: "Can I play on iOS, Android, or desktop browser?",
      a: "Yes! AnimaFind is built as an ultra-responsive web app with full offline camera support, and is also packaged natively via Capacitor for Android and iOS. You can add it to your home screen directly from your browser as a PWA with zero app store hassle.",
    },
    {
      q: "How does 250m Proximity Claiming work on the Community Map?",
      a: "When a naturalist logs a sighting in a public park, a pin appears on the local radar. Any other player who physically walks within 250 meters of that pin can open their app and claim a linked replica card to add to their Codex!",
    },
    {
      q: "What happens if someone logs an endangered or sensitive species?",
      a: "We prioritize wildlife safety above all else. Coordinates for protected taxa (such as Fire Salamanders, Storks, and Bats) are automatically cloaked to a 5-kilometer radius on public maps, keeping their exact nesting sites safe from poachers and disturbances.",
    },
    {
      q: "How does energy recharge work, and what is Field Club Premium?",
      a: "Tossing the tin can costs 1 can of energy. Free players have a 5-can capacity that recharges every 25 minutes. Field Club Premium ($4.99/mo or $39/yr) unlocks 8 max cans, 10-minute lightning recharges (2.5× faster), zero ads, exclusive gold cosmetics, and full research CSV export.",
    },
  ];

  return (
    <section id="faq" className="relative py-16 sm:py-24 bg-paper2/30 border-t border-ink/10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <span>❓</span>
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Everything You Need to Know
          </h2>
          <p className="text-sm font-semibold text-inksoft">
            Have questions about device security, camera permissions, or game balance? We have answers.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="doodle overflow-hidden transition-colors bg-white/80"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm font-black text-ink focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/20 bg-paper text-sm transition-transform ${
                      isOpen ? "rotate-45 bg-accent text-white" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs text-inksoft leading-relaxed font-medium border-t border-ink/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
