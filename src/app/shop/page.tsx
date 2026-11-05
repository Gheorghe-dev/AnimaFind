"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { gameApi } from "@/lib/api-client";
import { playCoinSound } from "@/lib/audio";
import type { Me } from "@/lib/types";
import {
  IconCoin,
  IconCan,
  IconSparkles,
  IconStar,
  IconShield,
} from "@/components/icons/AppIcons";

type Item = {
  id: string;
  kind: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  emoji: string;
};

export default function ShopPage() {
  const { me, setMe, toast, refresh } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [adPlaying, setAdPlaying] = useState(false);

  const load = useCallback(async () => {
    const data = (await gameApi.getShop()) as { items: Item[]; me: Me };
    setItems(data.items);
    setMe(data.me);
  }, [setMe]);

  useEffect(() => {
    let active = true;
    async function loadShop() {
      try {
        const data = (await gameApi.getShop()) as { items: Item[]; me: Me };
        if (active) {
          setItems(data.items);
          setMe(data.me);
        }
      } catch (err) {
        console.error("[ShopPage] Failed to load the catalog:", err);
      }
    }
    void loadShop();
    return () => {
      active = false;
    };
  }, [setMe]);

  async function buy(id: string) {
    try {
      const data = await gameApi.buyShop(id);
      if (data.me) setMe(data.me);
      playCoinSound();
      toast(
        data.message === "premium-on"
          ? "Premium active — 10-minute recharge, cap of 8, banners off."
          : data.message === "premium-off"
            ? "Premium cancelled (simulated RevenueCat entitlement)."
            : "Purchased!",
      );
      await refresh();
    } catch (err: unknown) {
      toast((err as Error).message || "Purchase failed.", "error");
    }
  }

  async function watchAd() {
    setAdPlaying(true);
    await new Promise((r) => setTimeout(r, 2200));
    try {
      const data = await gameApi.watchAdReward();
      if (data.me) setMe(data.me);
      playCoinSound();
      toast("+1 can from the rewarded ad.");
      await refresh();
    } catch (err: unknown) {
      toast((err as Error).message || "No reward available.", "error");
    } finally {
      setAdPlaying(false);
    }
  }

  const group = (kind: string) => items.filter((i) => i.kind === kind);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Supply shop</h1>
      <p className="text-[11px] text-inksoft flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-ink font-bold">
          <IconCoin size={14} className="text-amber-500" />
          <span>{me?.user.coins} coins</span>
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1 text-ink font-bold">
          <IconCan size={14} className="text-leaf" />
          <span>
            {me?.cans.current}/{me?.cans.max} cans
          </span>
        </span>
        <span>·</span>
        <span>recharge every {me?.cans.rechargeRateMinutes} min</span>
      </p>

      <div className="doodle bg-[#fff6e2] p-3 border border-amber-200 shadow-sm">
        <p className="text-sm font-black">Rewarded ad</p>
        <p className="text-[11px] text-inksoft">Watch a short clip (AdMob in production) for 1 extra can.</p>
        <button
          className="btn btn-accent mt-2 w-full inline-flex items-center justify-center gap-1.5"
          disabled={adPlaying}
          onClick={() => void watchAd()}
        >
          {adPlaying ? (
            "Playing ad…"
          ) : (
            <>
              <span>Watch for +1 Can</span>
              <IconCan size={15} />
            </>
          )}
        </button>
      </div>

      <Section title="Cans">
        {group("resourcePack").map((i) => (
          <Row key={i.id} item={i} onBuy={buy} affordable={(me?.user.coins ?? 0) >= i.price} />
        ))}
      </Section>

      <Section title="Premium">
        {group("subscription").map((i) => (
          <div key={i.id} className="doodle p-3.5 space-y-2 border border-leaf/30">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf/20 border border-leaf/40 text-leaf shadow-xs">
                <IconStar size={24} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">{i.name}</p>
                <p className="text-[11px] text-inksoft">{i.description}</p>
              </div>
            </div>
            <p className="text-[10px] text-inksoft">
              Cross-platform entitlement handled by RevenueCat · SKU {i.sku}
            </p>
            <button className="btn btn-leaf mt-2 w-full" onClick={() => void buy(i.id)}>
              {me?.user.isPremiumActive ? "Cancel premium (demo)" : "Start free trial (demo)"}
            </button>
          </div>
        ))}
      </Section>

      <Section title="Cosmetics">
        {group("cosmetic").map((i) => (
          <Row
            key={i.id}
            item={i}
            onBuy={buy}
            owned={me?.user.ownedCosmetics.includes(i.id)}
            affordable={(me?.user.coins ?? 0) >= i.price}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-black uppercase tracking-widest text-inksoft">{title}</h2>
      {children}
    </section>
  );
}

function Row({
  item,
  onBuy,
  owned,
  affordable,
}: {
  item: Item;
  onBuy: (id: string) => Promise<void>;
  owned?: boolean;
  affordable: boolean;
}) {
  const isCan = item.kind === "resourcePack" || item.id.includes("can");
  const isShield = item.id.includes("shield");

  return (
    <div className="doodle flex items-center gap-3 p-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/80 border border-ink/20 shadow-xs text-leaf">
        {isCan ? (
          <IconCan size={22} className="text-leaf" />
        ) : isShield ? (
          <IconShield size={22} className="text-amber-700" />
        ) : (
          <IconSparkles size={22} className="text-accent" />
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-black truncate">{item.name}</span>
        <span className="block text-[11px] text-inksoft">{item.description}</span>
      </span>
      <button
        className="btn btn-accent shrink-0 px-3 py-1.5 inline-flex items-center gap-1"
        disabled={owned || !affordable}
        onClick={() => void onBuy(item.id)}
      >
        {owned ? (
          "Owned"
        ) : (
          <>
            <IconCoin size={13} />
            <span>{item.price}</span>
          </>
        )}
      </button>
    </div>
  );
}
