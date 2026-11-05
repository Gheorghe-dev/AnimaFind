import Link from "next/link";
import {
  IconPaw,
  IconCamera,
  IconShield,
  IconCan,
  IconSparkles,
  IconTarget,
} from "@/components/icons/AppIcons";

export default function CoreLoopSection() {
  const steps = [
    {
      num: "01",
      icon: IconPaw,
      title: "Discover in Nature",
      desc: "Spot a genuine living animal in your backyard, along a woodland trail, or perched on a city balcony. Never corner or feed wildlife.",
      badge: "Real-World AR",
    },
    {
      num: "02",
      icon: IconCamera,
      title: "Viewfinder Lock-On",
      desc: "Our on-device 32×32 feature extractor tracks edges, luminance, and taxon traits in real time, building lock-on confidence at 60 FPS.",
      badge: "100% Local AI",
    },
    {
      num: "03",
      icon: IconShield,
      title: "Anti-Cheat Guard",
      desc: "Instant parallax depth analysis and moiré screen filters ensure the subject is a living 3D animal and not a digital display or printout.",
      badge: "Zero Fraud",
    },
    {
      num: "04",
      icon: IconCan,
      title: "Tin-Can Toss Minigame",
      desc: "Spend 1 can of energy to flick the vintage tin can into the drifting target zone. True parabolic physics with gravity and drag.",
      badge: "Skill-Based",
    },
    {
      num: "05",
      icon: IconSparkles,
      title: "Mint & Collect Card",
      desc: "Mint a procedurally generated trading card with unique RPG stats, rare abilities, and permanent serial number to fill your 35-species Codex.",
      badge: "5 Rarity Tiers",
    },
  ];

  return (
    <section id="features" className="relative py-16 sm:py-24 bg-paper/60 border-t border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <IconTarget size={14} className="text-accent" />
            <span>How AnimaFind Works</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            The 5-Step Wildlife Collecting Loop
          </h2>
          <p className="text-sm font-semibold text-inksoft sm:text-base">
            From stepping into the woods to minting your first Aurora legendary card, every interaction
            is engineered for immersion, fairness, and nature appreciation.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.num}
                className="glass-panel relative rounded-3xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-2xl font-black text-accent/80 font-mono">{step.num}</span>
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[9px] font-black text-inksoft uppercase tracking-wider">
                      {step.badge}
                    </span>
                  </div>

                  <div className="my-2 grid h-12 w-12 place-items-center rounded-2xl bg-paper border border-ink/15 text-leaf shadow-xs">
                    <StepIcon size={24} />
                  </div>
                  <h3 className="text-lg font-black text-ink mt-2 leading-snug">{step.title}</h3>
                  <p className="mt-2 text-xs text-inksoft leading-relaxed font-medium">{step.desc}</p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-ink/30 font-bold z-10">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="btn btn-accent px-8 py-3 text-sm font-black shadow-md">
            Start Your First Field Sighting Now →
          </Link>
        </div>
      </div>
    </section>
  );
}
