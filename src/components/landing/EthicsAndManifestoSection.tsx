import {
  IconBan,
  IconShield,
  IconLock,
  IconLeaf,
  IconPaw,
} from "@/components/icons/AppIcons";

export default function EthicsAndManifestoSection() {
  const principles = [
    {
      icon: IconBan,
      title: "Zero Disturbance Rule",
      desc: "Never chase, corner, bait, or touch an animal to take a photo. If an animal alters its natural behavior because of your presence, you are too close.",
    },
    {
      icon: IconShield,
      title: "5km Sanctuary Fuzzing",
      desc: "Vulnerable, rare, or nesting species (like Storks, Bats, and Fire Salamanders) have their exact coordinates fuzzed by up to 5 kilometers to protect them from poaching.",
    },
    {
      icon: IconLock,
      title: "On-Device Privacy (GDPR)",
      desc: "Unverified camera frames never leave your phone. You retain 100% ownership of your field notes, with one-click full data export and instant account wiping.",
    },
    {
      icon: IconLeaf,
      title: "Leave No Trace",
      desc: "Stay on public footpaths and established trails. Protect microhabitats, rotting logs, and fragile wetland banks from trampling.",
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 bg-paper border-t border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border-2 border-leaf/30 bg-gradient-to-br from-emerald-50/40 via-paper to-amber-50/40">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-leaf/40 bg-leaf/10 px-3 py-1 text-xs font-black text-leaf">
              <IconLeaf size={14} />
              <span>Wildlife-First Code of Conduct</span>
            </span>
            <h2 className="text-3xl font-black text-ink sm:text-4xl">
              A Game Built on Respect for the Natural World
            </h2>
            <p className="text-sm font-semibold text-inksoft leading-relaxed">
              AnimaFind was created to kindle awe and curiosity for biodiversity, not to treat wild creatures
              as props. We enforce strict digital and ethical safeguards across every line of code.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => {
              const PrincipleIcon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-ink/15 bg-white/80 p-5 flex flex-col justify-between"
                >
                  <div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf/10 text-leaf">
                      <PrincipleIcon size={20} />
                    </span>
                    <h3 className="mt-3 text-sm font-black text-ink leading-tight">{p.title}</h3>
                    <p className="mt-2 text-xs text-inksoft leading-relaxed font-medium">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-xs font-bold text-inksoft flex items-center justify-center gap-1.5">
            <IconPaw size={14} className="text-leaf" />
            <span>&quot;Take only photos, leave only footprints, collect only procedural trading cards.&quot;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
