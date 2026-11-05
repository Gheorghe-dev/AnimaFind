/* Deterministic end-to-end test of the AnimaFind local-first game engine.
 * Exercises the exact `gameApi` seam the UI uses (src/lib/api-client.ts). */
import { gameApi } from "../src/lib/api-client";

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    failures.push(`${name}${detail !== undefined ? ` :: ${JSON.stringify(detail)}` : ""}`);
    console.log(`  FAIL ${name}${detail !== undefined ? ` :: ${JSON.stringify(detail)}` : ""}`);
  }
}

async function main() {
  console.log("--- session + consent ---");
  const me0 = await gameApi.getMe();
  check("profile created", Boolean(me0?.user?.id), me0?.user);
  check("consent not yet given", me0.user.gdprConsentAt === null);

  const me1 = await gameApi.saveConsent({
    gdprConsent: true,
    ageConfirmed: true,
    locationConsent: true,
    username: "Tester",
  });
  check("consent stored", Boolean(me1.user.gdprConsentAt));
  check("username applied", me1.user.username === "Tester", me1.user.username);

  console.log("--- economy: round + toss ---");
  const cansBefore = me1.cans.current;
  const round = await gameApi.startRound();
  check("round started", Boolean(round.roundId));
  check("round has 3 attempts", round.attemptsLeft === 3, round.attemptsLeft);
  check("one can spent", round.cans.current === cansBefore - 1, {
    before: cansBefore,
    after: round.cans.current,
  });

  const attempt = await gameApi.attemptRound(round.roundId);
  check("attempt consumed", attempt.attemptsLeft === 2, attempt);

  console.log("--- mint a card ---");
  const photo = "data:image/svg+xml;utf8," + encodeURIComponent("<svg/>");
  const minted = await gameApi.submitSighting({
    roundId: round.roundId,
    photo,
    phash: "00112233445566aa",
    taxon: "Bird",
    species: "Common Blackbird",
    lat: 44.4268,
    lng: 26.1025,
    motionScore: 0.4,
    screenScore: 0.1,
  });
  check("card minted", Boolean(minted.card?.id), minted.card?.generatedName);
  check("card has serial", typeof minted.card.serialNumber === "number" && minted.card.serialNumber > 0);
  check(
    "card tier valid",
    ["tier1", "tier2", "tier3", "tier4", "tier5"].includes(minted.card.rarityTier),
    minted.card.rarityTier,
  );
  check("species recorded", minted.card.speciesLabel === "Common Blackbird", minted.card.speciesLabel);
  check("xp awarded", minted.me.user.xp > me1.user.xp, { before: me1.user.xp, after: minted.me.user.xp });
  check("coins awarded", minted.me.user.coins > me1.user.coins, {
    before: me1.user.coins,
    after: minted.me.user.coins,
  });

  console.log("--- THE key assertion: album sees the minted card ---");
  const album = await gameApi.getCards();
  check("album contains the card", album.cards.length === 1, album.cards.length);
  check("album card is the same card", album.cards[0]?.id === minted.card.id, {
    album: album.cards[0]?.id,
    minted: minted.card.id,
  });

  console.log("--- codex reflects discovery ---");
  const codex = await gameApi.getEncyclopedia();
  const birdCat = (codex.categories as any[]).find((c) => c.taxon === "Bird");
  check("codex counts the discovery", birdCat?.found >= 1, birdCat?.found);

  console.log("--- map shows the sighting ---");
  const map = await gameApi.getMap(44.4268, 26.1025);
  check("map has pins", map.pins.length > 0, map.pins.length);
  check("map includes my sighting", map.pins.some((p) => p.sightingId === minted.sighting.id));

  console.log("--- card detail + delete ---");
  const detail = await gameApi.getCard(minted.card.id);
  check("card detail loads", detail?.card?.id === minted.card.id);
  await gameApi.deleteCard(minted.card.id);
  check("card deleted", (await gameApi.getCards()).cards.length === 0, (await gameApi.getCards()).cards.length);

  console.log("--- friends: suggestion must add the SUGGESTED name (regression) ---");
  const fr = await gameApi.getFriends();
  check("suggestion offered", (fr.suggestions as any[]).some((s) => s.username === "BrambleFox"), fr.suggestions);
  await gameApi.friendAction({ action: "add", userId: "sug-1" });
  const fr2 = await gameApi.getFriends();
  check(
    "suggestion added by name",
    (fr2.friends as any[]).some((f: any) => f.username === "BrambleFox"),
    (fr2.friends as any[]).map((f: any) => f.username),
  );
  let dupRejected = false;
  try {
    await gameApi.friendAction({ action: "add", userId: "sug-1" });
  } catch {
    dupRejected = true;
  }
  check("duplicate friend rejected", dupRejected);
  await gameApi.friendAction({ action: "add", username: "NamedByHand" });
  check("typed name added", ((await gameApi.getFriends()).friends as any[]).some((f: any) => f.username === "NamedByHand"));

  console.log("--- shop: premium must retune the can cap (regression) ---");
  const beforePremium = await gameApi.getMe();
  check("free cap is 5", beforePremium.cans.max === 5, beforePremium.cans.max);
  const buy = await gameApi.buyShop("premium-monthly");
  check("premium activated", buy.me.user.isPremiumActive === true);
  check("premium cap is 8", buy.me.cans.max === 8, buy.me.cans.max);
  check("premium rate is 10 min", buy.me.cans.rechargeRateMinutes === 10, buy.me.cans.rechargeRateMinutes);

  console.log("--- rewarded ad ---");
  const cansBeforeAd = (await gameApi.getMe()).cans.current;
  const ad = await gameApi.watchAdReward();
  check("ad granted a can", ad.me.cans.current === cansBeforeAd + 1, {
    before: cansBeforeAd,
    after: ad.me.cans.current,
  });

  console.log("--- insufficient funds is rejected ---");
  let poorRejected = false;
  try {
    await gameApi.buyShop("frame-gold"); // 400 coins, player has ~70
  } catch (e) {
    poorRejected = /Not enough coins/.test((e as Error).message);
  }
  check("cannot overspend", poorRejected);

  console.log("--- spent round cannot mint (regression) ---");
  const r2 = await gameApi.startRound();
  await gameApi.attemptRound(r2.roundId);
  await gameApi.attemptRound(r2.roundId);
  await gameApi.attemptRound(r2.roundId);
  let spentRejected = false;
  try {
    await gameApi.submitSighting({
      roundId: r2.roundId,
      photo,
      phash: "ffffffffffffff01",
      taxon: "Bird",
      motionScore: 0.4,
      screenScore: 0.1,
    });
  } catch (e) {
    spentRejected = /No tosses left/.test((e as Error).message);
  }
  check("exhausted round rejected", spentRejected);

  console.log("--- claim distance is enforced (regression) ---");
  const r3 = await gameApi.startRound();
  let farRejected = false;
  try {
    await gameApi.submitSighting({
      roundId: r3.roundId,
      photo,
      phash: "ffffffffffffff02",
      taxon: "Bird",
      lat: 45.5,
      lng: 26.1,
      motionScore: 0.4,
      screenScore: 0.1,
      linkedFromSightingId: map.pins[0].sightingId,
    });
  } catch (e) {
    farRejected = /m away/.test((e as Error).message);
  }
  check("distant pin claim rejected", farRejected);

  console.log("--- GDPR export + erase ---");
  const exported = (await gameApi.exportAccount()) as any;
  check("export contains cards", Array.isArray(exported.cards));
  check("export contains sightings", Array.isArray(exported.sightings));
  await gameApi.deleteAccount();
  check("account erased", (await gameApi.getCards()).cards.length === 0);

  console.log("\n================ SUMMARY ================");
  console.log(`passed: ${pass}  failed: ${fail}`);
  if (failures.length) {
    console.log("\nFAILURES:");
    for (const f of failures) console.log("  - " + f);
    process.exitCode = 1;
  }
}

void main();
