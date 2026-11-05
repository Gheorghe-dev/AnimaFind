"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { RARITY_META, TIER_ORDER } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";

type Summary = {
  id: string;
  username: string;
  avatarSeed: string;
  level: number;
  totalCards: number;
  speciesDiversity: number;
  totalSightings: number;
  byTier: Record<string, number>;
  rarest: { id: string; name: string; tier: keyof typeof RARITY_META } | null;
  linkId?: string;
};

type Payload = {
  me: Summary;
  friends: Summary[];
  incoming: Summary[];
  outgoing: Summary[];
  suggestions: { id: string; username: string; avatarSeed: string; level: number }[];
};

type NotificationRow = { id: number; title: string; body: string; createdAt: string; readAt: string | null };

export default function FriendsPage() {
  const { toast } = useApp();
  const [data, setData] = useState<Payload | null>(null);
  const [compare, setCompare] = useState<Summary | null>(null);
  const [name, setName] = useState("");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  const load = useCallback(async () => {
    const [f, n] = await Promise.all([gameApi.getFriends(), gameApi.getNotifications()]);
    setData(f as Payload);
    setNotifications((n as { notifications: NotificationRow[] }).notifications);
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([gameApi.getFriends(), gameApi.getNotifications()])
      .then(([f, n]) => {
        if (active) {
          setData(f as Payload);
          setNotifications((n as { notifications: NotificationRow[] }).notifications);
        }
      })
      .catch((err) => {
        console.error("[FriendsPage] Failed to load the field crew:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  async function act(
    body: { action: string; userId?: string; username?: string; linkId?: string },
    okMessage: string,
  ) {
    try {
      await gameApi.friendAction(body);
      toast(okMessage);
    } catch (err: unknown) {
      toast((err as Error).message || "Something went wrong.", "error");
    }
    await load();
  }

  async function handleAddByName() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Please enter a naturalist field name.", "error");
      return;
    }
    try {
      await gameApi.friendAction({ action: "add", username: trimmed });
      toast(`Request sent to ${trimmed}.`);
      setName("");
      await load();
    } catch (err: unknown) {
      toast((err as Error).message || "Something went wrong.", "error");
    }
  }

  if (!data) return <p className="p-8 text-center font-bold text-inksoft">Rounding up the field crew…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Field crew</h1>

      <div className="doodle p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Add a naturalist</p>
        <div className="mt-1 flex gap-2">
          <input
            className="doodle-soft flex-1 bg-white/70 px-3 py-2 text-sm focus:outline-hidden"
            placeholder="Their field name"
            value={name}
            aria-label="Naturalist username"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAddByName();
              }
            }}
          />
          <button
            className="btn btn-accent disabled:opacity-50"
            disabled={!name.trim()}
            onClick={() => void handleAddByName()}
            aria-label="Send friend request"
          >
            Add
          </button>
        </div>
        {data.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {data.suggestions.map((s) => (
              <button
                key={s.id}
                className="rounded-full border-2 border-ink bg-white/70 px-2 py-1 text-[10px] font-bold"
                onClick={() => void act({ action: "add", userId: s.id }, `Request sent to ${s.username}.`)}
              >
                + {s.username} · Lv{s.level}
              </button>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="doodle p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Push feed</p>
            <button
              className="text-[10px] font-black underline"
              onClick={async () => {
                await gameApi.markNotificationsRead();
                await load();
              }}
            >
              mark read
            </button>
          </div>
          <ul className="mt-1 space-y-1">
            {notifications.slice(0, 5).map((n) => (
              <li key={n.id} className={`text-xs ${n.readAt ? "text-inksoft" : "font-bold"}`}>
                🔔 {n.title} — {n.body}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.incoming.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-inksoft">Requests</h2>
          {data.incoming.map((f) => (
            <div key={f.id} className="doodle flex items-center gap-3 p-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-white text-lg shadow-xs">
                {f.avatarSeed || "🧑‍🌾"}
              </span>
              <span className="flex-1 text-sm font-black truncate">{f.username}</span>
              <button className="btn btn-leaf px-3 py-1 text-xs" onClick={() => void act({ action: "accept", linkId: f.linkId }, "Friend added!")}>
                Accept
              </button>
              <button className="btn px-2.5 py-1 text-xs" onClick={() => void act({ action: "remove", linkId: f.linkId }, "Dismissed.")}>
                ✕
              </button>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-inksoft">Friends ({data.friends.length})</h2>
        {data.friends.length === 0 && (
          <p className="doodle-soft bg-white/60 px-3 py-2 text-xs text-inksoft">
            No crew yet. Add someone above to compare albums.
          </p>
        )}
        {data.friends.map((f) => (
          <div key={f.id} className="doodle p-2.5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-white text-lg shadow-xs">
                {f.avatarSeed || "🧑‍🌾"}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-black truncate">{f.username}</span>
                <span className="block text-[10px] text-inksoft font-semibold truncate">
                  Lv {f.level} · {f.totalCards} cards · {f.speciesDiversity} species
                </span>
              </span>
              <button className="btn px-3 py-1 text-xs shrink-0" onClick={() => setCompare(compare?.id === f.id ? null : f)}>
                {compare?.id === f.id ? "Close" : "Compare"}
              </button>
            </div>
            {compare?.id === f.id && <Comparison me={data.me} them={f} />}
          </div>
        ))}
      </section>

      {data.outgoing.length > 0 && (
        <p className="text-center text-[11px] text-inksoft">
          Pending sent requests: {data.outgoing.map((o) => o.username).join(", ")}
        </p>
      )}
    </div>
  );
}

function Comparison({ me, them }: { me: Summary; them: Summary }) {
  const rows: [string, string | number, string | number][] = [
    ["Level", me.level, them.level],
    ["Cards", me.totalCards, them.totalCards],
    ["Species diversity", me.speciesDiversity, them.speciesDiversity],
    ["Sightings", me.totalSightings, them.totalSightings],
    ["Rarest", me.rarest ? RARITY_META[me.rarest.tier].name : "—", them.rarest ? RARITY_META[them.rarest.tier].name : "—"],
    ...TIER_ORDER.map(
      (t) => [RARITY_META[t].name, me.byTier[t] ?? 0, them.byTier[t] ?? 0] as [string, number, number],
    ),
  ];
  return (
    <table className="mt-2 w-full text-[11px]">
      <thead>
        <tr className="text-left text-inksoft">
          <th className="font-black">Stat</th>
          <th className="font-black">You</th>
          <th className="font-black">{them.username}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, a, b]) => (
          <tr key={k} className="border-t border-dashed border-ink/20">
            <td className="py-0.5">{k}</td>
            <td className={`py-0.5 font-black ${a > b ? "text-leaf" : ""}`}>{a}</td>
            <td className={`py-0.5 font-black ${b > a ? "text-leaf" : ""}`}>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
