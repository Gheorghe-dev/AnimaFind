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
    <div className="space-y-4">
      <div className="doodle tape p-4 text-center">
        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-ink bg-white text-ink shadow-sm">
          <AvatarIcon seed={user.avatarSeed} size={48} />
          {user.cosmetics?.hat && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl pointer-events-none drop-shadow">
              {COSMETICS[user.cosmetics.hat]?.emoji}
            </span>
          )}
          {user.cosmetics?.glasses && (
            <span className="absolute top-9 left-1/2 -translate-x-1/2 text-xl pointer-events-none drop-shadow">
              {COSMETICS[user.cosmetics.glasses]?.emoji}
            </span>
          )}
        </div>
        <h1 className="mt-2 text-xl font-black">{user.username}</h1>
        <p className="text-[11px] text-inksoft flex items-center justify-center flex-wrap gap-1 mt-0.5">
          <span>Level {user.level}</span>
          <span>·</span>
          <span>{user.xp} XP total</span>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5 text-accent font-bold">
            <IconFlame size={12} className="shrink-0" />
            <span>{user.streakCount}-day streak</span>
          </span>
          {user.isPremiumActive && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5 text-leaf font-bold">
                <IconLeaf size={12} className="shrink-0" />
                <span>Premium</span>
              </span>
            </>
          )}
        </p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-white">
          <div className="h-full bg-accent" style={{ width: `${Math.round((user.into / user.needed) * 100)}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-inksoft">
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
              <IconSparkles size={12} />
              <span>{COSMETICS[c]?.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="doodle p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Field name</p>
        <div className="mt-1 flex gap-2">
          <input
            className="doodle-soft flex-1 bg-white/70 px-3 py-2 text-sm"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-accent" onClick={() => void save({ username: name })}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="doodle p-3 text-center">
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-inksoft">{label}</p>
    </div>
  );
}
