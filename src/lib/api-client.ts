import { localStore } from "./local-store";
import type { CanState, CardRow, MapPin, Me } from "./types";
import type { TaxonCategory } from "./game-data";

/**
 * 100% Local Game API Client.
 * Runs completely on-device without requiring PostgreSQL or a Node server.
 * Works seamlessly offline, inside Capacitor on Android/iOS, or in any web browser.
 */
export const gameApi = {
  async getMe(): Promise<Me> {
    return localStore.getMe();
  },

  async saveConsent(payload: {
    gdprConsent?: boolean;
    ageConfirmed?: boolean;
    locationConsent?: boolean;
    username?: string;
  }): Promise<Me> {
    return localStore.saveConsent(payload);
  },

  async updateProfile(payload: {
    username?: string;
    avatarSeed?: string;
    equip?: string | null;
    locationConsent?: boolean;
  }): Promise<Me> {
    return localStore.updateProfile(payload);
  },

  async startRound(): Promise<{ roundId: string; attemptsLeft: number; cans: CanState }> {
    return localStore.startRound();
  },

  async attemptRound(roundId: string): Promise<{ attemptsLeft: number; status: string }> {
    return localStore.attemptRound(roundId);
  },

  async submitSighting(payload: {
    roundId: string;
    photo: string;
    phash?: string;
    taxon: TaxonCategory;
    species?: string | null;
    lat?: number | null;
    lng?: number | null;
    motionScore?: number;
    screenScore?: number;
    linkedFromSightingId?: string | null;
  }): Promise<{ card: CardRow; sighting: { id: string; verificationStatus: string; isSensitiveSpecies: boolean }; me: Me }> {
    return localStore.submitSighting(payload);
  },

  async getCards(): Promise<{ cards: CardRow[] }> {
    return { cards: localStore.getCards() };
  },

  async getCard(id: string): Promise<{ card: CardRow; ownerName: string; sighting: any } | null> {
    return localStore.getCard(id);
  },

  async deleteCard(id: string): Promise<{ ok: boolean }> {
    return { ok: localStore.deleteCard(id) };
  },

  async getEncyclopedia(): Promise<{ categories: any[] }> {
    return localStore.getEncyclopedia();
  },

  async getMap(lat?: number | null, lng?: number | null): Promise<{ pins: MapPin[]; proximityMeters: number }> {
    return localStore.getMapPins(lat, lng);
  },

  async getFriends(): Promise<any> {
    return localStore.getFriends();
  },

  async friendAction(body: { action: string; userId?: string; username?: string; linkId?: string }): Promise<any> {
    return localStore.friendAction(body);
  },

  async getNotifications(): Promise<{ notifications: any[] }> {
    return localStore.getNotifications();
  },

  async markNotificationsRead(): Promise<{ ok: boolean }> {
    return localStore.markNotificationsRead();
  },

  async getPvp(): Promise<{ options: any[] }> {
    return localStore.getPvp();
  },

  async votePvp(option: string): Promise<{ ok: boolean }> {
    return localStore.votePvp(option);
  },

  async getShop(): Promise<{ items: any[]; me: Me }> {
    return localStore.getShop();
  },

  async buyShop(itemId: string): Promise<{ me: Me; message: string }> {
    return localStore.buyShopItem(itemId);
  },

  async watchAdReward(): Promise<{ me: Me }> {
    return localStore.watchAdReward();
  },

  async exportAccount(): Promise<any> {
    return localStore.exportAccount();
  },

  async deleteAccount(): Promise<{ ok: boolean }> {
    return localStore.deleteAccount();
  },
};
