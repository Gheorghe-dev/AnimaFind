/* Cloud-layer smoke test with the CORRECT payload contracts. */
const BASE = process.env.BASE || "http://localhost:3000";
const jar = new Map();

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
function absorb(res) {
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const line of raw) {
    const [pair] = line.split(";");
    const i = pair.indexOf("=");
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
}
let pass = 0,
  fail = 0;
const failures = [];

async function call(method, path, body, expect) {
  const headers = { "Content-Type": "application/json" };
  const ck = cookieHeader();
  if (ck) headers.Cookie = ck;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  absorb(res);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { __raw: text.slice(0, 200) };
  }
  const expected = Array.isArray(expect) ? expect : expect ? [expect] : null;
  const ok = expected ? expected.includes(res.status) : res.status >= 200 && res.status < 300;
  if (ok) {
    pass++;
    console.log(`  ok   ${method.padEnd(6)} ${path.padEnd(22)} -> ${res.status}`);
  } else {
    fail++;
    failures.push(`${method} ${path} -> ${res.status} (want ${expected ?? "2xx"}) :: ${text.slice(0, 200)}`);
    console.log(`  FAIL ${method.padEnd(6)} ${path.padEnd(22)} -> ${res.status} :: ${text.slice(0, 200)}`);
  }
  return { status: res.status, json };
}

(async () => {
  console.log("--- session + consent ---");
  await call("GET", "/api/health");
  await call("GET", "/api/me");
  await call("POST", "/api/consent", {
    gdprConsent: true,
    ageConfirmed: true,
    locationConsent: true,
    username: "CloudTester",
  });

  console.log("--- malformed cookie must NOT 500 ---");
  const goodCookie = jar.get("cc_uid");
  jar.set("cc_uid", "not-a-valid-uuid");
  await call("GET", "/api/me", undefined, [200, 403, 401]);
  // the malformed cookie is replaced by a fresh session -> re-consent for this identity
  await call("POST", "/api/consent", {
    gdprConsent: true,
    ageConfirmed: true,
    locationConsent: true,
    username: "CloudTester",
  });
  if (goodCookie) jar.set("cc_uid", goodCookie);

  console.log("--- sighting happy path (taxon must be a TAXA value) ---");
  const r1 = await call("POST", "/api/round/start");
  const photo =
    "data:image/svg+xml;utf8," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#123"/></svg>');
  const testPhash = Math.random().toString(16).slice(2, 10).padStart(8, "0") + Date.now().toString(16).slice(-8);
  const s1 = await call("POST", "/api/sighting", {
    roundId: r1.json.roundId,
    photo,
    phash: testPhash,
    taxon: "Bird",
    species: "Common Blackbird",
    lat: 45.1,
    lng: 25.2,
    motionScore: 0.4,
    screenScore: 0.1,
  });
  console.log("     card:", s1.json?.card?.generatedName, "tier:", s1.json?.card?.rarityTier);

  console.log("--- anti-cheat ---");
  const r2 = await call("POST", "/api/round/start");
  await call("POST", "/api/sighting", {
    roundId: r2.json.roundId,
    photo: photo + "a",
    phash: "11111111111111bb",
    taxon: "Bird",
    motionScore: 0.001,
    screenScore: 0.1,
  }, 422);
  const r3 = await call("POST", "/api/round/start");
  await call("POST", "/api/sighting", {
    roundId: r3.json.roundId,
    photo: photo + "b",
    phash: "22222222222222cc",
    taxon: "Bird",
    motionScore: 0.4,
    screenScore: 0.95,
  }, 422);
  const r4 = await call("POST", "/api/round/start");
  await call("POST", "/api/sighting", {
    roundId: r4.json.roundId,
    photo: photo + "c",
    phash: testPhash,
    taxon: "Bird",
    motionScore: 0.4,
    screenScore: 0.1,
  }, 409);

  console.log("--- cards ---");
  const cards = await call("GET", "/api/cards");
  console.log("     cards:", cards.json?.cards?.length);
  const cid = cards.json?.cards?.[0]?.id;
  if (cid) await call("GET", `/api/cards/${cid}`);
  if (cid) await call("DELETE", `/api/cards/${cid}`);

  console.log("--- shop (itemId, not sku) ---");
  const shop = await call("GET", "/api/shop");
  const item = shop.json?.items?.[0];
  console.log("     first item:", item?.id, item?.kind, "price", item?.price);
  await call("POST", "/api/shop", { itemId: item?.id }, [200, 402]);
  await call("POST", "/api/shop", { itemId: "nope" }, 404);

  console.log("--- pvp (valid option ids) ---");
  const pvp = await call("GET", "/api/pvp");
  const opt = pvp.json?.options?.[0];
  console.log("     option:", opt?.id);
  await call("POST", "/api/pvp", { option: opt?.id });
  await call("POST", "/api/pvp", { option: "not-real" }, 400);

  console.log("--- friends ---");
  const fr = await call("GET", "/api/friends");
  console.log("     keys:", Object.keys(fr.json || {}).join(","));
  console.log("     friends:", fr.json?.friends?.length, "suggested:", fr.json?.suggested?.length);

  console.log("--- map / notifications / account ---");
  await call("GET", "/api/map?lat=45.1&lng=25.2");
  await call("GET", "/api/notifications");
  await call("POST", "/api/notifications");
  await call("GET", "/api/account");

  console.log("\n================ SUMMARY ================");
  console.log(`passed: ${pass}  failed: ${fail}`);
  if (failures.length) {
    console.log("\nFAILURES:");
    for (const f of failures) console.log("  - " + f);
  }
})();
