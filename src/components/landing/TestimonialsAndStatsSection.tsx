import {
  IconPaw,
  IconLeaf,
  IconShield,
  IconStar,
  IconInfo,
  AvatarIcon,
} from "@/components/icons/AppIcons";

export default function TestimonialsAndStatsSection() {
  const stats = [
    { value: "28,450+", label: "Real Animals Logged", icon: IconPaw },
    { value: "35", label: "Curated Biodiversity Species", icon: IconLeaf },
    { value: "99.8%", label: "Anti-Cheat Filter Accuracy", icon: IconShield },
    { value: "4.9 / 5.0", label: "Naturalist Community Rating", icon: IconStar },
  ];

  const testimonials = [
    {
      name: "Elena Rostova",
      role: "Urban Naturalist & Photographer, Berlin",
      avatar: "fox",
      quote:
        "Finally a game that gets people outside without staring at a virtual map! Finding a real Stag Beetle in Tiergarten and minting an Emberwood card was exhilarating.",
      tier: "Emberwood Collector",
    },
    {
      name: "Dr. David Lindqvist",
      role: "Ecology Teacher, Stockholm",
      avatar: "owl",
      quote:
        "I use AnimaFind with my biology students. The on-device vision means no personal student data leaks to the cloud, and the 250m claim mechanic inspires genuine field camaraderie.",
      tier: "Field Club Premium",
    },
    {
      name: "Clara & Lucas Moreau",
      role: "Family Weekend Hikers, Lyon",
      avatar: "bird",
      quote:
        "The anti-cheat is genuinely brilliant. My kids tried scanning a nature magazine, and the parallax check rejected it instantly! They went back out and earned their Kingfisher fair and square.",
      tier: "Aurora Tier Owner",
    },
    {
      name: "Marcus Vance",
      role: "Casual Park Walker, London",
      avatar: "bee",
      quote:
        "The tactile doodle field notebook aesthetics and 3D card flips feel like opening foil booster packs from childhood. The 10-minute can recharge in Field Club is top tier.",
      tier: "Verified Explorer",
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 border-t border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Metric Banner */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => {
            const MetricIcon = s.icon;
            return (
              <div
                key={s.label}
                className="doodle p-5 text-center bg-white/80 transition-transform hover:-translate-y-1"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf/10 text-leaf mx-auto mb-2">
                  <MetricIcon size={20} />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-ink">{s.value}</div>
                <div className="text-xs font-bold text-inksoft mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Testimonials Header */}
        <div className="mt-20 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <IconInfo size={14} className="text-leaf" />
            <span>Voices from the Wild</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Loved by Naturalists, Hikers &amp; Families
          </h2>
          <p className="text-sm font-semibold text-inksoft">
            See how AnimaFind transforms everyday dog walks, school field trips, and park strolls into
            a celebrated biodiversity quest.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-panel relative rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-ink/10">
                  <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink">
                    <AvatarIcon seed={t.avatar} size={20} />
                  </span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-black text-accent uppercase">
                    {t.tier}
                  </span>
                </div>

                <p className="mt-4 text-xs font-medium text-ink leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-ink/10">
                <div className="text-xs font-black text-ink">{t.name}</div>
                <div className="text-[10px] text-inksoft">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
