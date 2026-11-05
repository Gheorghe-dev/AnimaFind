import type { FC } from "react";

export const FoxIllustration: FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg
    viewBox="0 0 400 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Aurora Red Fox"
  >
    <defs>
      <linearGradient id="foxBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2c1a0e" />
        <stop offset="50%" stopColor="#4a2612" />
        <stop offset="100%" stopColor="#8a3c1b" />
      </linearGradient>
      <radialGradient id="foxGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#f6ad55" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#e2703a" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#2c1a0e" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f6e05e" />
        <stop offset="50%" stopColor="#faf089" />
        <stop offset="100%" stopColor="#d69e2e" />
      </linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="url(#foxBg)" />
    <circle cx="200" cy="140" r="130" fill="url(#foxGlow)" />
    {/* Forest foliage silhouettes */}
    <path d="M-20 320 L60 210 L140 320 Z" fill="#1b120c" opacity="0.7" />
    <path d="M260 320 L340 190 L420 320 Z" fill="#1b120c" opacity="0.7" />
    <path d="M30 320 L100 240 L170 320 Z" fill="#140d08" />
    <path d="M220 320 L300 230 L380 320 Z" fill="#140d08" />
    {/* Celestial particles / fireflies */}
    <circle cx="80" cy="90" r="2.5" fill="#fef08a" opacity="0.8" />
    <circle cx="120" cy="60" r="3" fill="#fef08a" opacity="0.9" />
    <circle cx="280" cy="70" r="2" fill="#fef08a" opacity="0.7" />
    <circle cx="320" cy="110" r="3.5" fill="#fde047" opacity="0.8" />
    <circle cx="200" cy="40" r="2.5" fill="#fff" opacity="0.9" />
    {/* Fox Body */}
    <path d="M120 320 C120 220 160 170 200 170 C240 170 280 220 280 320 Z" fill="#dd6b20" />
    {/* Chest fur white */}
    <path d="M165 320 C165 240 180 200 200 200 C220 200 235 240 235 320 Z" fill="#fffaf0" />
    {/* Ears */}
    <path d="M140 150 L115 80 L175 120 Z" fill="#c05621" />
    <path d="M135 140 L125 95 L165 122 Z" fill="#4a1d0d" />
    <path d="M260 150 L285 80 L225 120 Z" fill="#c05621" />
    <path d="M265 140 L275 95 L235 122 Z" fill="#4a1d0d" />
    {/* Fox Head */}
    <polygon points="130,140 270,140 200,225" fill="#dd6b20" />
    {/* Cheeks white */}
    <polygon points="130,140 175,185 155,200" fill="#fffaf0" />
    <polygon points="270,140 225,185 245,200" fill="#fffaf0" />
    {/* Snout */}
    <polygon points="180,175 220,175 200,218" fill="#fffaf0" />
    <circle cx="200" cy="216" r="6" fill="#1a202c" />
    {/* Eyes */}
    <ellipse cx="170" cy="155" rx="7" ry="4" transform="rotate(-12 170 155)" fill="#2d3748" />
    <ellipse cx="230" cy="155" rx="7" ry="4" transform="rotate(12 230 155)" fill="#2d3748" />
    <circle cx="171" cy="154" r="2" fill="#fff" />
    <circle cx="229" cy="154" r="2" fill="#fff" />
    {/* Forehead mark */}
    <path d="M196 135 L204 135 L202 155 L198 155 Z" fill="#fffaf0" opacity="0.8" />
    {/* Whiskers */}
    <line x1="165" y1="210" x2="120" y2="205" stroke="#fffaf0" strokeWidth="1.5" opacity="0.6" />
    <line x1="165" y1="215" x2="115" y2="218" stroke="#fffaf0" strokeWidth="1.5" opacity="0.6" />
    <line x1="235" y1="210" x2="280" y2="205" stroke="#fffaf0" strokeWidth="1.5" opacity="0.6" />
    <line x1="235" y1="215" x2="285" y2="218" stroke="#fffaf0" strokeWidth="1.5" opacity="0.6" />
    {/* Legendary golden halo ring */}
    <ellipse cx="200" cy="150" rx="110" ry="105" stroke="url(#goldRim)" strokeWidth="2.5" strokeDasharray="6 8" opacity="0.85" />
  </svg>
);

export const OwlIllustration: FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg
    viewBox="0 0 400 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Twilight Barn Owl"
  >
    <defs>
      <linearGradient id="owlBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#140f2d" />
        <stop offset="50%" stopColor="#251b4d" />
        <stop offset="100%" stopColor="#3d2a73" />
      </linearGradient>
      <radialGradient id="moonGlow" cx="50%" cy="35%" r="45%">
        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#140f2d" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="url(#owlBg)" />
    <circle cx="200" cy="110" r="90" fill="url(#moonGlow)" />
    {/* Stars */}
    <circle cx="70" cy="50" r="1.5" fill="#e9d5ff" />
    <circle cx="110" cy="90" r="2" fill="#fff" />
    <circle cx="310" cy="45" r="2" fill="#fff" />
    <circle cx="340" cy="85" r="1.5" fill="#e9d5ff" />
    <circle cx="280" cy="130" r="1.5" fill="#fff" />
    {/* Perch Branch */}
    <path d="M-10 270 Q160 260 410 280" stroke="#4a3b32" strokeWidth="16" strokeLinecap="round" />
    {/* Owl Body */}
    <ellipse cx="200" cy="205" rx="58" ry="75" fill="#d8b4fe" opacity="0.9" />
    <ellipse cx="200" cy="215" rx="42" ry="60" fill="#f5f3ff" />
    {/* Wings */}
    <path d="M142 160 C130 200 135 260 160 280 C150 250 148 200 156 170 Z" fill="#7e22ce" />
    <path d="M258 160 C270 200 265 260 240 280 C250 250 252 200 244 170 Z" fill="#7e22ce" />
    {/* Heart-shaped facial disc */}
    <path d="M200 145 C185 115 150 115 155 145 C158 165 185 185 200 195 C215 185 242 165 245 145 C250 115 215 115 200 145 Z" fill="#faf5ff" stroke="#a855f7" strokeWidth="2" />
    {/* Eyes */}
    <circle cx="180" cy="150" r="10" fill="#1e1b4b" />
    <circle cx="220" cy="150" r="10" fill="#1e1b4b" />
    <circle cx="182" cy="148" r="3.5" fill="#fbbf24" />
    <circle cx="218" cy="148" r="3.5" fill="#fbbf24" />
    <circle cx="183" cy="147" r="1" fill="#fff" />
    <circle cx="219" cy="147" r="1" fill="#fff" />
    {/* Beak */}
    <polygon points="197,162 203,162 200,175" fill="#f59e0b" />
  </svg>
);

export const HedgehogIllustration: FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg
    viewBox="0 0 400 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Hedgerow Hedgehog"
  >
    <defs>
      <linearGradient id="hedgBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e2d1d" />
        <stop offset="60%" stopColor="#30442e" />
        <stop offset="100%" stopColor="#476244" />
      </linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="url(#hedgBg)" />
    {/* Hedgerow leaves & mushrooms */}
    <circle cx="60" cy="270" r="18" fill="#7f9c6a" opacity="0.6" />
    <circle cx="95" cy="285" r="14" fill="#a3b18a" opacity="0.7" />
    <circle cx="330" cy="275" r="22" fill="#7f9c6a" opacity="0.6" />
    {/* Hedgehog quill body */}
    <path
      d="M110 240 C90 190 120 130 190 120 C260 110 310 150 315 220 C315 250 280 270 210 270 C150 270 120 260 110 240 Z"
      fill="#443627"
    />
    {/* Individual Quills */}
    {Array.from({ length: 18 }).map((_, i) => {
      const angle = (i / 17) * Math.PI;
      const x = 205 - Math.cos(angle) * 75;
      const y = 200 - Math.sin(angle) * 70;
      const dx = -Math.cos(angle) * 22;
      const dy = -Math.sin(angle) * 22;
      return (
        <line
          key={i}
          x1={x}
          y1={y}
          x2={x + dx}
          y2={y + dy}
          stroke={i % 2 === 0 ? "#d4a373" : "#faedcd"}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      );
    })}
    {/* Snout face */}
    <path d="M125 210 Q90 225 80 235 Q115 255 140 245 Z" fill="#e9d8a6" />
    <circle cx="80" cy="235" r="6" fill="#1b120c" />
    <circle cx="115" cy="225" r="4.5" fill="#1b120c" />
    <circle cx="116" cy="224" r="1.5" fill="#fff" />
  </svg>
);

export const ButterflyIllustration: FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg
    viewBox="0 0 400 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Meadow Swallowtail"
  >
    <defs>
      <linearGradient id="bfBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0c2d3e" />
        <stop offset="60%" stopColor="#175069" />
        <stop offset="100%" stopColor="#2c7a9b" />
      </linearGradient>
      <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#67e8f9" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="url(#bfBg)" />
    {/* Wings */}
    <g transform="translate(200, 150)">
      {/* Left Top Wing */}
      <path d="M-6 -10 C-60 -90 -130 -80 -140 -20 C-145 20 -90 40 -6 10 Z" fill="url(#wingGrad)" stroke="#082f49" strokeWidth="3" />
      {/* Right Top Wing */}
      <path d="M6 -10 C60 -90 130 -80 140 -20 C145 20 90 40 6 10 Z" fill="url(#wingGrad)" stroke="#082f49" strokeWidth="3" />
      {/* Left Bottom Wing */}
      <path d="M-6 10 C-80 50 -100 110 -50 125 C-20 135 -10 60 -4 15 Z" fill="#38bdf8" stroke="#082f49" strokeWidth="3" />
      {/* Right Bottom Wing */}
      <path d="M6 10 C80 50 100 110 50 125 C20 135 10 60 4 15 Z" fill="#38bdf8" stroke="#082f49" strokeWidth="3" />
      {/* Spots */}
      <circle cx="-70" cy="-30" r="8" fill="#082f49" />
      <circle cx="70" cy="-30" r="8" fill="#082f49" />
      <circle cx="-50" cy="80" r="6" fill="#f43f5e" />
      <circle cx="50" cy="80" r="6" fill="#f43f5e" />
      {/* Body */}
      <ellipse cx="0" cy="15" rx="5" ry="38" fill="#0c1924" />
      <circle cx="0" cy="-25" r="7" fill="#0c1924" />
      {/* Antennae */}
      <path d="M-2 -30 Q-25 -55 -40 -50" stroke="#0c1924" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M2 -30 Q25 -55 40 -50" stroke="#0c1924" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

export const BeetleIllustration: FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg
    viewBox="0 0 400 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Emberwood Stag Beetle"
  >
    <defs>
      <linearGradient id="beetleBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2e1509" />
        <stop offset="50%" stopColor="#542512" />
        <stop offset="100%" stopColor="#8a3c1b" />
      </linearGradient>
    </defs>
    <rect width="400" height="320" rx="16" fill="url(#beetleBg)" />
    {/* Ember particles */}
    <circle cx="90" cy="80" r="3" fill="#fdba74" opacity="0.8" />
    <circle cx="310" cy="110" r="2.5" fill="#fb923c" opacity="0.9" />
    <circle cx="140" cy="240" r="2" fill="#fed7aa" opacity="0.7" />
    <circle cx="280" cy="260" r="3" fill="#fdba74" opacity="0.8" />
    {/* Beetle Silhouette */}
    <g transform="translate(200, 160)">
      {/* Mandibles */}
      <path d="M-15 -60 Q-45 -115 -10 -125 Q-30 -90 -8 -60" fill="#2d1306" stroke="#ea580c" strokeWidth="1.5" />
      <path d="M15 -60 Q45 -115 10 -125 Q30 -90 8 -60" fill="#2d1306" stroke="#ea580c" strokeWidth="1.5" />
      {/* Legs */}
      <path d="M-30 -20 Q-80 -40 -95 -20" stroke="#2d1306" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M30 -20 Q80 -40 95 -20" stroke="#2d1306" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-35 15 Q-95 15 -105 35" stroke="#2d1306" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M35 15 Q95 15 105 35" stroke="#2d1306" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-30 50 Q-85 90 -95 110" stroke="#2d1306" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M30 50 Q85 90 95 110" stroke="#2d1306" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Head */}
      <rect x="-24" y="-60" width="48" height="26" rx="8" fill="#1f0d04" />
      {/* Thorax */}
      <ellipse cx="0" cy="-15" rx="36" ry="24" fill="#3b1708" stroke="#ea580c" strokeWidth="1" />
      {/* Elytra (wing cases) */}
      <path d="M-36 10 C-40 70 -25 110 0 125 C25 110 40 70 36 10 Z" fill="#5c240c" stroke="#ea580c" strokeWidth="1.5" />
      <line x1="0" y1="10" x2="0" y2="124" stroke="#1f0d04" strokeWidth="2.5" />
    </g>
  </svg>
);
