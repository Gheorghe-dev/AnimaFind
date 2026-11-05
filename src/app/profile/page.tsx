"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { COSMETICS, RARITY_META, TIER_ORDER } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";
import {
  IconFlame,
  IconLeaf,
  IconSparkles,
  AvatarIcon,
  CosmeticIcon,
} from "@/components/icons/AppIcons";

const AVATARS = ["fox", "squirrel", "bird", "frog", "bee", "lizard", "snail", "owl"];

export default function ProfilePage() {
  const { me, setMe, toast } = useApp();
  const [name, setName] = useState(me?.user.username ?? "");

  if (!me) return null;
  const { user, stats } = me;

  async function save(body: { username?: string; avatarSeed?: string; equip?: string | null }) {
    try {
      const updated = await gameApi.updateProfile(body);
      setMe(updated);
      toast("Profile updated.");
    } catch (err: unknown) {
      toast((err as Error).message || "Could not save.", "error");
    }
  }

  const equipped = Object.values(user.cosmetics ?? {}).filter(Boolean) as string[];

  return (
    <div className="space-y-4 px-margin-mobile">
      <div className="bg-surface-container p-4 rounded-xl text-center shadow-sm relative">
        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-primary/20 bg-surface text-primary shadow-sm">
          <AvatarIcon seed={user.avatarSeed} size={48} />
          {user.cosmetics?.hat && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-sm text-stone-800">
              <CosmeticIcon id={user.cosmetics.hat} size={32} />
            </span>
          )}
          {user.cosmetics?.glasses && (
            <span className="absolute top-9 left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-sm text-stone-900">
              <CosmeticIcon id={user.cosmetics.glasses} size={28} />
            </span>
          )}
        </div>
        <h1 className="mt-2 font-headline-md text-headline-md font-bold text-primary">{user.username}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center flex-wrap gap-1 mt-0.5">
          <span>Level {user.level} Ranger</span>
          <span>·</span>
          <span>{user.xp} XP total</span>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5 text-secondary font-bold">
            <IconFlame size={12} className="shrink-0" />
            <span>{user.streakCount}-day streak</span>
          </span>
          {user.isPremiumActive && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5 text-tertiary-container font-bold">
                <IconLeaf size={12} className="shrink-0" />
                <span>Premium Ranger</span>
              </span>
            </>
          )}
        </p>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.round((user.into / user.needed) * 100)}%` }} />
        </div>
        <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
          {user.into}/{user.needed} XP to level {user.level + 1}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Cards" value={stats.totalCards} />
        <Stat label="Sightings" value={stats.totalSightings} />
        <Stat label="Species diversity" value={stats.speciesDiversity} />
        <Stat label="Coins" value={user.coins} />
      </div>

      <div className="doodle p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Rarest find</p>
        {stats.rarest ? (
          <Link href={`/card?id=${stats.rarest.id}`} className="mt-1 block text-sm font-black underline">
            {stats.rarest.name} · {RARITY_META[stats.rarest.tier].name}
          </Link>
        ) : (
          <p className="text-xs text-inksoft">Nothing yet — go scan a specimen outdoors.</p>
        )}
        <div className="mt-2 flex gap-1">
          {TIER_ORDER.map((t) => (
            <span
              key={t}
              className="flex-1 rounded-md border-2 border-ink py-1 text-center text-[10px] font-black text-white"
              style={{ background: RARITY_META[t].color }}
            >
              {stats.byTier[t] ?? 0}
            </span>
          ))}
        </div>
      </div>

      <div className="doodle p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Avatar</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => void save({ avatarSeed: a })}
              className={`grid h-10 w-10 place-items-center rounded-full border-2 border-ink transition-transform active:scale-95 ${
                user.avatarSeed === a ? "bg-ink text-white shadow-sm" : "bg-white/80 hover:bg-white text-ink"
              }`}
              aria-label={`Select avatar ${a}`}
            >
              <AvatarIcon seed={a} size={20} />
            </button>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-inksoft">Cosmetics</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {user.ownedCosmetics.length === 0 && (
            <Link href="/shop" className="text-xs underline text-accent font-bold">
              None owned — visit the shop
            </Link>
          )}
          {user.ownedCosmetics.map((c) => (
            <button
              key={c}
              onClick={() => void save({ equip: c })}
              className={`rounded-full border-2 border-ink px-3 py-1 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all ${
                equipped.includes(c) ? "bg-leaf text-white shadow-xs" : "bg-white/70 hover:bg-white"
              }`}
            >
              <CosmeticIcon id={c} size={14} />
              <span>{COSMETICS[c]?.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container p-3 rounded-xl shadow-xs">
        <p className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Field Name</p>
        <div className="mt-1 flex gap-2">
          <input
            className="bg-surface-container-high rounded-xl flex-1 px-3 py-2 font-body-md text-sm text-on-surface focus:outline-none"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="bg-secondary text-on-secondary px-4 py-2 rounded-xl font-label-md text-label-md font-bold uppercase shadow-sm active:translate-y-0.5" onClick={() => void save({ username: name })}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container-low p-3 rounded-xl text-center shadow-xs border border-primary/10">
      <p className="font-specimen-numeral text-specimen-numeral text-primary leading-none">{value}</p>
      <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">{label}</p>
    </div>
  );
}
