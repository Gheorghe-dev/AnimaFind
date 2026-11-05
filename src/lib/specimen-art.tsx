import type { FC } from "react";
import type { TaxonCategory, RarityTier } from "./game-data";

export type SpecimenArtOptions = {
  taxon: TaxonCategory;
  species?: string | null;
  tier?: RarityTier;
  className?: string;
  size?: number;
};

// Generates an ultra-crisp, stylized, museum-grade botanical/zoological vector illustration
export function getSpecimenSvgString(
  taxon: TaxonCategory,
  speciesLabel?: string | null,
  tier: RarityTier = "tier1"
): string {
  const norm = (speciesLabel ?? "").toLowerCase();

  // Tier-based environmental accents
  const isAurora = tier === "tier5";
  const isEmber = tier === "tier4";
  const isTwilight = tier === "tier3";

  // Accent particles based on tier
  const particles = isAurora
    ? `<circle cx="60" cy="50" r="3" fill="#fde047" opacity="0.9"/><circle cx="340" cy="70" r="2.5" fill="#fef08a" opacity="0.8"/><circle cx="200" cy="35" r="3" fill="#ffffff" opacity="0.95"/><circle cx="100" cy="110" r="2" fill="#fef08a" opacity="0.7"/><circle cx="300" cy="120" r="3.5" fill="#facc15" opacity="0.85"/>`
    : isEmber
    ? `<circle cx="80" cy="70" r="3" fill="#fb923c" opacity="0.85"/><circle cx="320" cy="90" r="2.5" fill="#fdba74" opacity="0.8"/><circle cx="150" cy="40" r="2" fill="#fed7aa" opacity="0.75"/><circle cx="270" cy="50" r="3" fill="#f97316" opacity="0.9"/>`
    : isTwilight
    ? `<circle cx="70" cy="45" r="1.5" fill="#e9d5ff"/><circle cx="110" cy="85" r="2" fill="#ffffff"/><circle cx="310" cy="40" r="2" fill="#ffffff"/><circle cx="330" cy="80" r="1.5" fill="#e9d5ff"/>`
    : `<circle cx="60" cy="270" r="16" fill="#7f9c6a" opacity="0.25"/><circle cx="340" cy="260" r="20" fill="#7f9c6a" opacity="0.25"/>`;

  // Golden halo for Aurora tier
  const auroraHalo = isAurora
    ? `<ellipse cx="200" cy="150" rx="125" ry="115" stroke="#facc15" stroke-width="2" stroke-dasharray="8 6" opacity="0.75"/><circle cx="200" cy="35" r="5" fill="#fef08a"/><circle cx="75" cy="150" r="4" fill="#fef08a"/><circle cx="325" cy="150" r="4" fill="#fef08a"/>`
    : "";

  // 1. MAMMAL ILLUSTRATIONS
  if (taxon === "Mammal") {
    if (norm.includes("fox")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2c180e"/><stop offset="60%" stop-color="#4d2412"/><stop offset="100%" stop-color="#7c3316"/></linearGradient>
    <radialGradient id="mGlow" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#f97316" stop-opacity="0.6"/><stop offset="100%" stop-color="#2c180e" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="320" rx="16" fill="url(#mBg)"/>
  <circle cx="200" cy="140" r="130" fill="url(#mGlow)"/>
  <path d="M-20 320 L70 210 L160 320 Z" fill="#170c06" opacity="0.8"/>
  <path d="M240 320 L330 200 L420 320 Z" fill="#170c06" opacity="0.8"/>
  ${particles}
  ${auroraHalo}
  <path d="M120 320 C120 220 160 170 200 170 C240 170 280 220 280 320 Z" fill="#ea580c"/>
  <path d="M165 320 C165 240 180 200 200 200 C220 200 235 240 235 320 Z" fill="#fffaf0"/>
  <path d="M140 150 L115 80 L175 120 Z" fill="#c2410c"/>
  <path d="M135 140 L125 95 L165 122 Z" fill="#431407"/>
  <path d="M260 150 L285 80 L225 120 Z" fill="#c2410c"/>
  <path d="M265 140 L275 95 L235 122 Z" fill="#431407"/>
  <polygon points="130,140 270,140 200,225" fill="#ea580c"/>
  <polygon points="130,140 175,185 155,200" fill="#fffaf0"/>
  <polygon points="270,140 225,185 245,200" fill="#fffaf0"/>
  <polygon points="180,175 220,175 200,218" fill="#fffaf0"/>
  <circle cx="200" cy="216" r="6" fill="#18181b"/>
  <ellipse cx="170" cy="155" rx="7" ry="4" transform="rotate(-12 170 155)" fill="#18181b"/>
  <ellipse cx="230" cy="155" rx="7" ry="4" transform="rotate(12 230 155)" fill="#18181b"/>
  <circle cx="171" cy="154" r="2" fill="#ffffff"/>
  <circle cx="229" cy="154" r="2" fill="#ffffff"/>
  <line x1="165" y1="210" x2="115" y2="205" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
  <line x1="165" y1="216" x2="110" y2="218" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
  <line x1="235" y1="210" x2="285" y2="205" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
  <line x1="235" y1="216" x2="290" y2="218" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
</svg>`;
    }

    if (norm.includes("hedgehog")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1c2819"/><stop offset="60%" stop-color="#2d3d29"/><stop offset="100%" stop-color="#465a42"/></linearGradient>
  </defs>
  <rect width="400" height="320" rx="16" fill="url(#hBg)"/>
  <circle cx="65" cy="275" r="20" fill="#7f9c6a" opacity="0.6"/>
  <circle cx="330" cy="275" r="24" fill="#7f9c6a" opacity="0.6"/>
  ${particles}
  ${auroraHalo}
  <path d="M110 240 C90 190 120 130 190 120 C260 110 310 150 315 220 C315 250 280 270 210 270 C150 270 120 260 110 240 Z" fill="#38291a"/>
  <!-- Individual layered quills -->
  <line x1="130" y1="180" x2="110" y2="160" stroke="#d4a373" stroke-width="4" stroke-linecap="round"/>
  <line x1="150" y1="155" x2="135" y2="130" stroke="#faedcd" stroke-width="4" stroke-linecap="round"/>
  <line x1="180" y1="135" x2="175" y2="105" stroke="#d4a373" stroke-width="4" stroke-linecap="round"/>
  <line x1="210" y1="130" x2="215" y2="100" stroke="#faedcd" stroke-width="4" stroke-linecap="round"/>
  <line x1="240" y1="140" x2="255" y2="110" stroke="#d4a373" stroke-width="4" stroke-linecap="round"/>
  <line x1="270" y1="160" x2="295" y2="135" stroke="#faedcd" stroke-width="4" stroke-linecap="round"/>
  <line x1="290" y1="190" x2="320" y2="175" stroke="#d4a373" stroke-width="4" stroke-linecap="round"/>
  <line x1="295" y1="220" x2="325" y2="215" stroke="#faedcd" stroke-width="4" stroke-linecap="round"/>
  <path d="M125 210 Q90 225 80 235 Q115 255 140 245 Z" fill="#e9d8a6"/>
  <circle cx="80" cy="235" r="6" fill="#1b120c"/>
  <circle cx="115" cy="225" r="4.5" fill="#1b120c"/>
  <circle cx="116" cy="224" r="1.5" fill="#ffffff"/>
  <ellipse cx="140" cy="265" rx="10" ry="6" fill="#d4a373"/>
  <ellipse cx="250" cy="265" rx="10" ry="6" fill="#d4a373"/>
</svg>`;
    }

    if (norm.includes("deer")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e2920"/><stop offset="50%" stop-color="#324536"/><stop offset="100%" stop-color="#556b50"/></linearGradient>
    <radialGradient id="dSun" cx="50%" cy="30%" r="50%"><stop offset="0%" stop-color="#fef08a" stop-opacity="0.4"/><stop offset="100%" stop-color="#1e2920" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="320" rx="16" fill="url(#dBg)"/>
  <circle cx="200" cy="110" r="110" fill="url(#dSun)"/>
  ${particles}
  ${auroraHalo}
  <!-- Antlers -->
  <path d="M175 110 Q160 50 130 40 M150 70 Q130 75 115 65 M160 55 Q165 30 180 20" stroke="#78350f" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <path d="M225 110 Q240 50 270 40 M250 70 Q270 75 285 65 M240 55 Q235 30 220 20" stroke="#78350f" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <!-- Body & Neck -->
  <path d="M150 320 L165 190 Q200 180 235 190 L250 320 Z" fill="#9a3412"/>
  <!-- Head -->
  <polygon points="170,120 230,120 200,215" fill="#c2410c"/>
  <!-- Cheeks & Muzzle -->
  <path d="M185 180 Q200 175 215 180 L200 215 Z" fill="#fed7aa"/>
  <circle cx="200" cy="210" r="5" fill="#1c1917"/>
  <!-- Ears -->
  <path d="M165 130 Q120 110 135 145 Z" fill="#9a3412"/>
  <path d="M235 130 Q280 110 265 145 Z" fill="#9a3412"/>
  <!-- Eyes -->
  <circle cx="178" cy="145" r="5" fill="#1c1917"/>
  <circle cx="222" cy="145" r="5" fill="#1c1917"/>
  <circle cx="179" cy="144" r="1.5" fill="#ffffff"/>
  <circle cx="221" cy="144" r="1.5" fill="#ffffff"/>
</svg>`;
    }

    if (norm.includes("squirrel")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="sqBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2d2215"/><stop offset="100%" stop-color="#60482d"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#sqBg)"/>
  ${particles}
  ${auroraHalo}
  <!-- Bushy Tail -->
  <path d="M210 260 C260 270 320 230 310 160 C300 100 240 70 210 90 C230 110 250 140 230 190 C220 215 200 240 210 260 Z" fill="#c2410c"/>
  <!-- Body -->
  <ellipse cx="175" cy="220" rx="45" ry="60" fill="#9a3412"/>
  <ellipse cx="165" cy="225" rx="30" ry="45" fill="#ffedd5"/>
  <!-- Head -->
  <circle cx="160" cy="145" r="32" fill="#c2410c"/>
  <polygon points="140,125 145,95 155,120" fill="#9a3412"/>
  <polygon points="165,120 175,95 180,125" fill="#9a3412"/>
  <ellipse cx="140" cy="155" rx="15" ry="12" fill="#ffedd5"/>
  <circle cx="132" cy="153" r="4" fill="#1c1917"/>
  <circle cx="152" cy="140" r="5" fill="#1c1917"/>
  <circle cx="153" cy="139" r="1.5" fill="#ffffff"/>
  <!-- Holding Acorn -->
  <ellipse cx="145" cy="205" rx="10" ry="12" fill="#78350f"/>
  <path d="M135 198 Q145 192 155 198" stroke="#451a03" stroke-width="4" fill="none"/>
</svg>`;
    }

    if (norm.includes("bat")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="btBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f0c1b"/><stop offset="100%" stop-color="#211738"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#btBg)"/>
  <circle cx="200" cy="100" r="55" fill="#fef08a" opacity="0.3"/>
  ${particles}
  ${auroraHalo}
  <!-- Wings -->
  <path d="M185 160 Q120 90 40 120 Q70 170 85 220 Q120 190 145 225 Q165 190 185 180 Z" fill="#2e2042" stroke="#581c87" stroke-width="2"/>
  <path d="M215 160 Q280 90 360 120 Q330 170 315 220 Q280 190 255 225 Q235 190 215 180 Z" fill="#2e2042" stroke="#581c87" stroke-width="2"/>
  <!-- Body -->
  <ellipse cx="200" cy="190" rx="22" ry="40" fill="#1e1329"/>
  <!-- Ears -->
  <polygon points="185,155 175,115 195,140" fill="#3b0764"/>
  <polygon points="215,155 225,115 205,140" fill="#3b0764"/>
  <!-- Head -->
  <circle cx="200" cy="160" r="18" fill="#1e1329"/>
  <!-- Eyes -->
  <circle cx="193" cy="158" r="3" fill="#fde047"/>
  <circle cx="207" cy="158" r="3" fill="#fde047"/>
</svg>`;
    }

    // Default Mammal (Generic Forest Mammal / Badger / Dog / Cat)
    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="gmBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1f2421"/><stop offset="100%" stop-color="#3b443f"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#gmBg)"/>
  ${particles}
  ${auroraHalo}
  <circle cx="200" cy="180" r="70" fill="#272e29"/>
  <polygon points="145,130 135,80 170,115" fill="#4a574f"/>
  <polygon points="255,130 265,80 230,115" fill="#4a574f"/>
  <polygon points="150,140 250,140 200,220" fill="#7f9c6a"/>
  <!-- White Badger Stripe / Muzzle -->
  <path d="M190 140 L210 140 L205 215 L195 215 Z" fill="#ffffff" opacity="0.9"/>
  <circle cx="200" cy="214" r="6" fill="#18181b"/>
  <circle cx="175" cy="155" r="5" fill="#18181b"/>
  <circle cx="225" cy="155" r="5" fill="#18181b"/>
  <circle cx="176" cy="154" r="1.5" fill="#ffffff"/>
  <circle cx="224" cy="154" r="1.5" fill="#ffffff"/>
</svg>`;
  }

  // 2. BIRD ILLUSTRATIONS
  if (taxon === "Bird") {
    if (norm.includes("owl")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="owBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#140f2d"/><stop offset="60%" stop-color="#251b4d"/><stop offset="100%" stop-color="#3d2a73"/></linearGradient>
    <radialGradient id="owMoon" cx="50%" cy="35%" r="45%"><stop offset="0%" stop-color="#c084fc" stop-opacity="0.6"/><stop offset="100%" stop-color="#140f2d" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="320" rx="16" fill="url(#owBg)"/>
  <circle cx="200" cy="110" r="90" fill="url(#owMoon)"/>
  ${particles}
  ${auroraHalo}
  <path d="M-10 270 Q160 260 410 280" stroke="#4a3b32" stroke-width="16" stroke-linecap="round"/>
  <!-- Owl Body -->
  <ellipse cx="200" cy="205" rx="58" ry="75" fill="#d8b4fe" opacity="0.9"/>
  <ellipse cx="200" cy="215" rx="42" ry="60" fill="#f5f3ff"/>
  <path d="M142 160 C130 200 135 260 160 280 C150 250 148 200 156 170 Z" fill="#7e22ce"/>
  <path d="M258 160 C270 200 265 260 240 280 C250 250 252 200 244 170 Z" fill="#7e22ce"/>
  <!-- Heart-shaped facial disc -->
  <path d="M200 145 C185 115 150 115 155 145 C158 165 185 185 200 195 C215 185 242 165 245 145 C250 115 215 115 200 145 Z" fill="#faf5ff" stroke="#a855f7" stroke-width="2"/>
  <circle cx="180" cy="150" r="10" fill="#1e1b4b"/>
  <circle cx="220" cy="150" r="10" fill="#1e1b4b"/>
  <circle cx="182" cy="148" r="3.5" fill="#fbbf24"/>
  <circle cx="218" cy="148" r="3.5" fill="#fbbf24"/>
  <circle cx="183" cy="147" r="1" fill="#ffffff"/>
  <circle cx="219" cy="147" r="1" fill="#ffffff"/>
  <polygon points="197,162 203,162 200,175" fill="#f59e0b"/>
</svg>`;
    }

    if (norm.includes("kingfisher")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="kfBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#082f49"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="400" height="320" rx="16" fill="url(#kfBg)"/>
  ${particles}
  ${auroraHalo}
  <!-- Perch Branch -->
  <path d="M-10 240 Q120 250 280 230" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
  <!-- Body (Orange rufous chest + Azure back) -->
  <ellipse cx="190" cy="190" rx="38" ry="50" fill="#ea580c"/>
  <path d="M190 145 C150 160 145 220 180 240 C170 210 165 170 190 145 Z" fill="#06b6d4"/>
  <!-- Head -->
  <circle cx="215" cy="140" r="28" fill="#0891b2"/>
  <path d="M195 125 Q215 110 235 125" stroke="#0e7490" stroke-width="4" fill="none"/>
  <!-- Long Dagger Bill -->
  <polygon points="235,135 315,145 235,150" fill="#18181b"/>
  <!-- Eye -->
  <circle cx="218" cy="138" r="4.5" fill="#18181b"/>
  <circle cx="219" cy="137" r="1.5" fill="#ffffff"/>
  <!-- White neck flash -->
  <ellipse cx="195" cy="155" rx="8" ry="12" fill="#ffffff"/>
</svg>`;
    }

    if (norm.includes("stork")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="stBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#stBg)"/>
  ${particles}
  ${auroraHalo}
  <!-- Long Red Bill -->
  <polygon points="230,95 330,115 230,105" fill="#dc2626"/>
  <!-- Head & Neck -->
  <path d="M170 240 Q175 140 215 95 C230 95 235 115 220 135 Q190 170 190 240 Z" fill="#ffffff"/>
  <!-- Black wing feathers -->
  <path d="M150 200 C120 230 110 280 180 280 C150 260 140 230 150 200 Z" fill="#18181b"/>
  <circle cx="215" cy="100" r="4" fill="#18181b"/>
</svg>`;
    }

    // Default Bird (Robin / Songbird)
    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="rbBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1c2d27"/><stop offset="100%" stop-color="#3d5a45"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#rbBg)"/>
  ${particles}
  ${auroraHalo}
  <path d="M20 260 Q180 250 380 270" stroke="#543825" stroke-width="12" stroke-linecap="round"/>
  <!-- Robin Body -->
  <ellipse cx="190" cy="180" rx="48" ry="55" fill="#713f12"/>
  <!-- Scarlet / Orange Breast -->
  <path d="M185 145 C220 145 240 180 220 220 C180 225 160 200 185 145 Z" fill="#ea580c"/>
  <!-- Head -->
  <circle cx="205" cy="140" r="26" fill="#713f12"/>
  <!-- Eye -->
  <circle cx="212" cy="135" r="5" fill="#09090b"/>
  <circle cx="213" cy="134" r="1.5" fill="#ffffff"/>
  <!-- Beak -->
  <polygon points="225,138 250,144 225,147" fill="#292524"/>
  <!-- Tail -->
  <polygon points="145,185 90,210 135,215" fill="#543825"/>
</svg>`;
  }

  // 3. INSECT ILLUSTRATIONS
  if (taxon === "Insect") {
    if (norm.includes("beetle")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="btlBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2e1206"/><stop offset="60%" stop-color="#4d1f0d"/><stop offset="100%" stop-color="#7c3316"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#btlBg)"/>
  ${particles}
  ${auroraHalo}
  <g transform="translate(200, 160)">
    <!-- Mandibles -->
    <path d="M-15 -60 Q-45 -115 -10 -125 Q-30 -90 -8 -60" fill="#2d1306" stroke="#ea580c" stroke-width="1.5"/>
    <path d="M15 -60 Q45 -115 10 -125 Q30 -90 8 -60" fill="#2d1306" stroke="#ea580c" stroke-width="1.5"/>
    <!-- Legs -->
    <path d="M-30 -20 Q-80 -40 -95 -20" stroke="#2d1306" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M30 -20 Q80 -40 95 -20" stroke="#2d1306" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-35 15 Q-95 15 -105 35" stroke="#2d1306" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M35 15 Q95 15 105 35" stroke="#2d1306" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-30 50 Q-85 90 -95 110" stroke="#2d1306" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M30 50 Q85 90 95 110" stroke="#2d1306" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Body -->
    <rect x="-24" y="-60" width="48" height="26" rx="8" fill="#1f0d04"/>
    <ellipse cx="0" cy="-15" rx="36" ry="24" fill="#3b1708" stroke="#ea580c" stroke-width="1"/>
    <path d="M-36 10 C-40 70 -25 110 0 125 C25 110 40 70 36 10 Z" fill="#5c240c" stroke="#ea580c" stroke-width="1.5"/>
    <line x1="0" y1="10" x2="0" y2="124" stroke="#1f0d04" stroke-width="2.5"/>
  </g>
</svg>`;
    }

    if (norm.includes("butterfly")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bfBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0c2d3e"/><stop offset="100%" stop-color="#2c7a9b"/></linearGradient>
    <linearGradient id="wGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#67e8f9"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
  </defs>
  <rect width="400" height="320" rx="16" fill="url(#bfBg)"/>
  ${particles}
  ${auroraHalo}
  <g transform="translate(200, 150)">
    <path d="M-6 -10 C-60 -90 -130 -80 -140 -20 C-145 20 -90 40 -6 10 Z" fill="url(#wGrad)" stroke="#082f49" stroke-width="3"/>
    <path d="M6 -10 C60 -90 130 -80 140 -20 C145 20 90 40 6 10 Z" fill="url(#wGrad)" stroke="#082f49" stroke-width="3"/>
    <path d="M-6 10 C-80 50 -100 110 -50 125 C-20 135 -10 60 -4 15 Z" fill="#38bdf8" stroke="#082f49" stroke-width="3"/>
    <path d="M6 10 C80 50 100 110 50 125 C20 135 10 60 4 15 Z" fill="#38bdf8" stroke="#082f49" stroke-width="3"/>
    <circle cx="-70" cy="-30" r="8" fill="#082f49"/>
    <circle cx="70" cy="-30" r="8" fill="#082f49"/>
    <circle cx="-50" cy="80" r="6" fill="#f43f5e"/>
    <circle cx="50" cy="80" r="6" fill="#f43f5e"/>
    <ellipse cx="0" cy="15" rx="5" ry="38" fill="#0c1924"/>
    <circle cx="0" cy="-25" r="7" fill="#0c1924"/>
    <path d="M-2 -30 Q-25 -55 -40 -50" stroke="#0c1924" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M2 -30 Q25 -55 40 -50" stroke="#0c1924" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
    }

    // Default Bee / Bumblebee / Ladybird
    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="beeBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2e2007"/><stop offset="100%" stop-color="#714e0f"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#beeBg)"/>
  ${particles}
  ${auroraHalo}
  <g transform="translate(200, 160)">
    <!-- Gossamer Wings -->
    <ellipse cx="-40" cy="-45" rx="35" ry="20" transform="rotate(-30 -40 -45)" fill="#e0f2fe" opacity="0.75" stroke="#38bdf8" stroke-width="1.5"/>
    <ellipse cx="40" cy="-45" rx="35" ry="20" transform="rotate(30 40 -45)" fill="#e0f2fe" opacity="0.75" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- Striped Abdomen -->
    <ellipse cx="0" cy="25" rx="36" ry="46" fill="#facc15"/>
    <path d="M-34 10 H34 M-36 30 H36 M-32 50 H32" stroke="#1c1917" stroke-width="12"/>
    <!-- Thorax -->
    <circle cx="0" cy="-15" r="28" fill="#1c1917"/>
    <!-- Head -->
    <circle cx="0" cy="-45" r="18" fill="#1c1917"/>
    <circle cx="-8" cy="-47" r="4" fill="#fbbf24"/>
    <circle cx="8" cy="-47" r="4" fill="#fbbf24"/>
  </g>
</svg>`;
  }

  // 4. REPTILE ILLUSTRATIONS
  if (taxon === "Reptile") {
    if (norm.includes("snake")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="snBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#14231b"/><stop offset="100%" stop-color="#2b4737"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#snBg)"/>
  ${particles}
  ${auroraHalo}
  <!-- S-Coil Snake Body -->
  <path d="M80 230 C120 130 200 130 220 220 C240 280 320 260 330 180 C335 130 290 90 230 100" stroke="#166534" stroke-width="26" stroke-linecap="round" fill="none"/>
  <!-- Snake Head -->
  <ellipse cx="230" cy="100" rx="20" ry="14" transform="rotate(-15 230 100)" fill="#15803d"/>
  <!-- Yellow Collar Markings -->
  <path d="M238 92 L244 105" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>
  <!-- Eye -->
  <circle cx="225" cy="97" r="3.5" fill="#facc15"/>
  <circle cx="225" cy="97" r="1.5" fill="#18181b"/>
  <!-- Forked Tongue -->
  <path d="M210 104 L190 108 M190 108 L180 102 M190 108 L180 114" stroke="#dc2626" stroke-width="2" fill="none"/>
</svg>`;
    }

    // Default Lizard / Turtle
    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="lzBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2d2812"/><stop offset="100%" stop-color="#5c4d1f"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#lzBg)"/>
  ${particles}
  ${auroraHalo}
  <!-- Sunbaked Rock -->
  <ellipse cx="200" cy="260" rx="150" ry="50" fill="#3f3f46"/>
  <!-- Lizard Body & Tail -->
  <path d="M120 240 Q160 170 200 180 Q250 190 300 230" stroke="#4ade80" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M295 230 Q330 250 360 230" stroke="#4ade80" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- Head -->
  <polygon points="125,230 85,245 125,255" fill="#22c55e"/>
  <!-- Eye -->
  <circle cx="110" cy="242" r="3" fill="#ca8a04"/>
  <circle cx="110" cy="242" r="1.2" fill="#09090b"/>
  <!-- Claws -->
  <line x1="140" y1="245" x2="135" y2="265" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="240" y1="240" x2="250" y2="265" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;
  }

  // 5. AMPHIBIAN ILLUSTRATIONS
  if (taxon === "Amphibian") {
    if (norm.includes("salamander")) {
      return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="salBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#141416"/><stop offset="100%" stop-color="#27272a"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#salBg)"/>
  ${particles}
  ${auroraHalo}
  <!-- Sinuous Black Body -->
  <path d="M110 230 Q160 160 210 180 Q270 200 320 170" stroke="#09090b" stroke-width="26" stroke-linecap="round" fill="none"/>
  <!-- Yellow Fire Blotches -->
  <ellipse cx="140" cy="205" rx="10" ry="14" fill="#facc15"/>
  <ellipse cx="210" cy="180" rx="12" ry="8" fill="#facc15"/>
  <ellipse cx="270" cy="190" rx="9" ry="12" fill="#facc15"/>
  <!-- Head -->
  <circle cx="105" cy="235" r="18" fill="#09090b"/>
  <ellipse cx="100" cy="230" rx="8" ry="5" fill="#facc15"/>
  <circle cx="98" cy="232" r="3" fill="#09090b"/>
</svg>`;
    }

    // Default Frog / Toad
    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="frBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0e281b"/><stop offset="100%" stop-color="#1b4d35"/></linearGradient>
  </defs>
  <rect width="400" height="320" rx="16" fill="url(#frBg)"/>
  <!-- Water Lily Leaf -->
  <ellipse cx="200" cy="250" rx="150" ry="50" fill="#15803d"/>
  <polygon points="200,250 350,230 350,270" fill="#0e281b"/>
  ${particles}
  ${auroraHalo}
  <!-- Frog Body -->
  <ellipse cx="200" cy="200" rx="55" ry="45" fill="#22c55e"/>
  <!-- Throat -->
  <ellipse cx="200" cy="215" rx="35" ry="25" fill="#bbf7d0"/>
  <!-- Eyes with Golden Rings -->
  <circle cx="170" cy="165" r="18" fill="#16a34a"/>
  <circle cx="230" cy="165" r="18" fill="#16a34a"/>
  <circle cx="170" cy="165" r="12" fill="#facc15"/>
  <circle cx="230" cy="165" r="12" fill="#facc15"/>
  <ellipse cx="170" cy="165" rx="9" ry="3" fill="#09090b"/>
  <ellipse cx="230" cy="165" rx="9" ry="3" fill="#09090b"/>
  <!-- Smile -->
  <path d="M175 205 Q200 220 225 205" stroke="#14532d" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
  }

  // 6. OTHER ILLUSTRATIONS (Snail / Spider / Worm)
  if (norm.includes("spider")) {
    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="spBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#18181b"/><stop offset="100%" stop-color="#3f3f46"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#spBg)"/>
  <!-- Cobweb lines -->
  <path d="M0 0 L400 320 M400 0 L0 320 M200 0 V320 M0 160 H400" stroke="#71717a" stroke-width="1" opacity="0.3"/>
  ${particles}
  ${auroraHalo}
  <g transform="translate(200, 160)">
    <!-- Legs -->
    <path d="M-20 -10 Q-70 -40 -90 -10" stroke="#18181b" stroke-width="3" fill="none"/>
    <path d="M20 -10 Q70 -40 90 -10" stroke="#18181b" stroke-width="3" fill="none"/>
    <path d="M-20 0 Q-80 0 -95 30" stroke="#18181b" stroke-width="3" fill="none"/>
    <path d="M20 0 Q80 0 95 30" stroke="#18181b" stroke-width="3" fill="none"/>
    <path d="M-20 10 Q-70 40 -85 70" stroke="#18181b" stroke-width="3" fill="none"/>
    <path d="M20 10 Q70 40 85 70" stroke="#18181b" stroke-width="3" fill="none"/>
    <!-- Abdomen with cross mark -->
    <ellipse cx="0" cy="20" rx="28" ry="36" fill="#a16207"/>
    <path d="M0 5 V35 M-10 15 H10" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="0" cy="-15" r="16" fill="#18181b"/>
  </g>
</svg>`;
  }

  // Default Snail
  return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="snlBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1c251c"/><stop offset="100%" stop-color="#3d4d3d"/></linearGradient></defs>
  <rect width="400" height="320" rx="16" fill="url(#snlBg)"/>
  ${particles}
  ${auroraHalo}
  <!-- Snail Body -->
  <path d="M80 250 C130 250 240 250 310 250 C320 250 330 240 325 230 C310 210 280 230 230 230" stroke="#a3e635" stroke-width="22" stroke-linecap="round" fill="none"/>
  <!-- Eyestalks -->
  <line x1="315" y1="230" x2="330" y2="180" stroke="#a3e635" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="330" cy="180" r="5" fill="#4d7c0f"/>
  <circle cx="331" cy="179" r="1.5" fill="#ffffff"/>
  <line x1="322" y1="232" x2="345" y2="190" stroke="#a3e635" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="345" cy="190" r="5" fill="#4d7c0f"/>
  <circle cx="346" cy="189" r="1.5" fill="#ffffff"/>
  <!-- Spiral Shell -->
  <circle cx="190" cy="185" r="62" fill="#ca8a04" stroke="#713f12" stroke-width="4"/>
  <path d="M190 185 m-45 0 a45 45 0 1 0 90 0 a45 45 0 1 0 -90 0 m20 0 a25 25 0 1 0 50 0 a25 25 0 1 0 -50 0" stroke="#713f12" stroke-width="3.5" fill="none"/>
</svg>`;
}

export function getSpecimenDataUri(
  taxon: TaxonCategory,
  speciesLabel?: string | null,
  tier: RarityTier = "tier1"
): string {
  const svg = getSpecimenSvgString(taxon, speciesLabel, tier);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SpecimenArtwork: FC<SpecimenArtOptions> = ({
  taxon,
  species,
  tier = "tier1",
  className = "w-full h-full object-cover",
}) => {
  const svg = getSpecimenSvgString(taxon, species, tier);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label={`${species ?? taxon} specimen artwork`}
    />
  );
};
