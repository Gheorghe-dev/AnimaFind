"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CardFull } from "@/components/CardViews";
import { useApp } from "@/components/AppProvider";
import { gameApi } from "@/lib/api-client";
import { IconMapPin, IconSearch } from "@/components/icons/AppIcons";
import type { CardRow } from "@/lib/types";

type Payload = {
  card: CardRow;
  ownerName: string;
  sighting: {
    timestamp: string;
    detectedSpeciesLabel: string | null;
    isSensitiveSpecies: boolean;
    verificationStatus: string;
    linkedFromSightingId: string | null;
    hasLocation: boolean;
  };
};

export function CardDetailView({ id }: { id: string }) {
  const { me, toast, refresh } = useApp();
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [missing, setMissing] = useState(!id);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!id) return;
    void gameApi
      .getCard(id)
      .then((d) => {
        if (!active) return;
        setData(d);
        setMissing(!d);
      })
      .catch((err) => {
        console.error("[CardDetailView] Failed to load card:", err);
        if (active) {
          setData(null);
          setMissing(true);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (missing) {
    return (
      <div className="space-y-3">
        <Link href="/album" className="text-[11px] font-black underline">
          ← Back to album
        </Link>
        <div className="doodle tape p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-paper2/80 border-2 border-ink text-inksoft shadow-xs">
            <IconSearch size={28} />
          </div>
          <p className="mt-3 font-black">This card is not in your field journal.</p>
          <p className="mt-1 text-xs text-inksoft">It may have been deleted, or it belongs to another naturalist.</p>
          <Link href="/album" className="btn btn-accent mt-4 inline-block">
            Open the album
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return <p className="p-8 text-center font-bold text-inksoft">Fetching the card…</p>;

  const mine = data.card.ownerUserId === me?.user.id;

  async function share() {
    if (!data) return;
    const url = `${window.location.origin}/card?id=${data.card.id}`;
    const text = `${data.card.generatedName} — logged in Critter Codex`;
    if (navigator.share) await navigator.share({ title: data.card.generatedName, text, url }).catch(() => {});
    else {
      await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
      toast("Deep link copied to clipboard.");
    }
  }

  async function remove() {
    if (!data || deleting) return;
    setDeleting(true);
    try {
      await gameApi.deleteCard(data.card.id);
      toast("Card released back into the wild.");
      await refresh();
      router.push("/album");
    } catch (err: unknown) {
      toast((err as Error).message || "Could not delete card.", "error");
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-3">
      <Link href="/album" className="text-[11px] font-black underline focus:outline-hidden" aria-label="Back to field journal album">
        ← Back to album
      </Link>
      <CardFull card={data.card} />
      <div className="doodle p-3 text-xs">
        <p className="font-black">Sighting record</p>
        <ul className="mt-1 space-y-1 text-inksoft">
          <li>Collector: {data.ownerName}</li>
          <li>Logged: {new Date(data.sighting.timestamp).toLocaleString()}</li>
          <li>Species: {data.sighting.detectedSpeciesLabel ?? "Unidentified"}</li>
          <li>Verification: {data.sighting.verificationStatus}</li>
          <li>
            Location:{" "}
            {data.sighting.isSensitiveSpecies
              ? "hidden — protected species"
              : data.sighting.hasLocation
                ? "stored, fuzzed on the public map"
                : "not recorded"}
          </li>
          {data.sighting.linkedFromSightingId && (
            <li className="flex items-center gap-1">
              <IconMapPin size={12} className="text-leaf" />
              <span>Linked from a community pin</span>
            </li>
          )}
        </ul>
      </div>

      <div className="flex gap-2">
        <button
          className="btn btn-accent flex-1"
          onClick={() => void share()}
          aria-label="Share card with others"
        >
          Share card
        </button>
        {mine && (
          <button
            className="btn flex-1 hover:border-red-400 hover:text-red-600 transition-colors"
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Release card from journal"
          >
            Release card
          </button>
        )}
      </div>

      {showConfirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="doodle max-w-sm w-full p-4 space-y-3 bg-paper shadow-xl">
            <h3 id="confirm-delete-title" className="text-base font-black text-ink">
              Release {data.card.generatedName}?
            </h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Are you sure you want to release this card back into nature? This action will remove it permanently from your album.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                className="btn flex-1"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
              >
                Keep card
              </button>
              <button
                className="btn btn-accent flex-1 bg-red-600 hover:bg-red-700 text-white border-red-800"
                onClick={() => void remove()}
                disabled={deleting}
              >
                {deleting ? "Releasing…" : "Yes, release"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
