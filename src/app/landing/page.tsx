import type { Metadata } from "next";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import InteractiveCardSimulator from "@/components/landing/InteractiveCardSimulator";
import CoreLoopSection from "@/components/landing/CoreLoopSection";
import VisionAntiCheatSection from "@/components/landing/VisionAntiCheatSection";
import CodexShowcaseSection from "@/components/landing/CodexShowcaseSection";
import CommunityMapSection from "@/components/landing/CommunityMapSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsAndStatsSection from "@/components/landing/TestimonialsAndStatsSection";
import EthicsAndManifestoSection from "@/components/landing/EthicsAndManifestoSection";
import FaqSection from "@/components/landing/FaqSection";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "AnimaFind — Real-World Wildlife Exploration & Collectible Trading Card SaaS",
  description:
    "Point your smartphone camera at genuine living animals in nature, pass on-device heuristic vision & anti-cheat checks, toss the tin can, and mint procedurally generated trading cards with unique RPG stats and 5 rarity tiers.",
  keywords: [
    "wildlife collecting game",
    "trading card game",
    "nature exploration app",
    "on-device computer vision",
    "anti-cheat AR",
    "European wildlife codex",
    "biodiversity gamification",
    "field journal",
    "AnimaFind",
    "Critter Codex",
  ],
  openGraph: {
    title: "AnimaFind: Real-World Wildlife AR Trading Card SaaS",
    description:
      "Turn encounters with living animals into procedurally generated collectible cards with 5 rarity tiers, combat stats, and a 35-species European wildlife codex.",
    siteName: "AnimaFind",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink antialiased selection:bg-accent/20 selection:text-ink">
      {/* Top Navigation */}
      <LandingNav />

      {/* Hero Section with Interactive 3D Card */}
      <HeroSection />

      {/* Interactive 3D Card Studio Simulator */}
      <InteractiveCardSimulator />

      {/* Core 5-Step Gameplay Loop */}
      <CoreLoopSection />

      {/* On-Device Vision & Anti-Cheat Pipeline Deep Dive */}
      <VisionAntiCheatSection />

      {/* 35-Species European Wildlife Codex Encyclopedia */}
      <CodexShowcaseSection />

      {/* Fuzzed Community Map & 250m Proximity Claiming */}
      <CommunityMapSection />

      {/* Field Club SaaS Membership & Pricing */}
      <PricingSection />

      {/* Community Testimonials & Live Stats */}
      <TestimonialsAndStatsSection />

      {/* Wildlife Ethics & Leave-No-Trace Manifesto */}
      <EthicsAndManifestoSection />

      {/* Interactive FAQ Accordion */}
      <FaqSection />

      {/* Footer & Call to Action Banner */}
      <LandingFooter />
    </div>
  );
}
