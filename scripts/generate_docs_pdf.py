#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AnimaFind Full Master Documentation PDF Generator
Generates a comprehensive, professional, multi-page Master Documentation PDF.
"""

import os
import subprocess
import time
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Alex\Desktop\AnimaFind")
HTML_PATH = WORKSPACE / "docs" / "full_documentation.html"
PDF_PATH = WORKSPACE / "docs" / "AnimaFind_Full_Documentation.pdf"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def build_html_content() -> str:
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AnimaFind — Comprehensive Technical Documentation & Architecture Manual</title>
<style>
  @page {
    size: A4 portrait;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
      content: "Page " counter(page);
      font-size: 8.5pt;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #888;
    }
    @bottom-left {
      content: "AnimaFind (Critter Codex) · Technical Documentation v1.0.0";
      font-size: 8.5pt;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #888;
    }
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.55;
    color: #27231d;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }

  .page-break {
    page-break-before: always;
  }

  .avoid-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ─── COVER PAGE ─── */
  .cover {
    min-height: 92vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 30px 20px 20px 20px;
    border: 3px solid #27231d;
    border-radius: 20px;
    background: linear-gradient(180deg, #faf7ee 0%, #f4ead6 100%);
    box-shadow: 6px 6px 0 #27231d;
  }

  .cover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cover-badge {
    display: inline-block;
    background: #2e6f40;
    color: #ffffff;
    font-weight: 800;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 4px 12px;
    border-radius: 12px;
    border: 1.5px solid #27231d;
  }

  .cover-title {
    margin-top: 25px;
    font-size: 34pt;
    font-weight: 900;
    line-height: 1.1;
    color: #1e1b18;
    letter-spacing: -0.5px;
  }

  .cover-subtitle {
    margin-top: 10px;
    font-size: 14pt;
    font-weight: 700;
    color: #e2703a;
    line-height: 1.35;
  }

  .cover-desc {
    margin-top: 16px;
    font-size: 10.5pt;
    color: #555047;
    max-width: 90%;
    line-height: 1.6;
  }

  .cover-art-box {
    margin: 24px 0;
    background: #201a15;
    border-radius: 16px;
    border: 2px solid #27231d;
    padding: 16px;
    text-align: center;
    box-shadow: 4px 4px 0 #27231d;
  }

  .cover-art-box svg {
    max-height: 240px;
    width: auto;
  }

  .cover-metadata-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 15px;
    border-top: 2px solid #27231d;
    padding-top: 16px;
  }

  .meta-item-label {
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #78716c;
    letter-spacing: 0.5px;
  }

  .meta-item-value {
    font-size: 9.5pt;
    font-weight: 800;
    color: #1e1b18;
    margin-top: 2px;
  }

  /* ─── TYPOGRAPHY & SECTIONS ─── */
  h1 {
    font-size: 19pt;
    font-weight: 900;
    color: #1e1b18;
    margin: 0 0 12px 0;
    padding-bottom: 6px;
    border-bottom: 2.5px solid #2e6f40;
    letter-spacing: -0.3px;
  }

  h2 {
    font-size: 13.5pt;
    font-weight: 800;
    color: #2e6f40;
    margin: 18px 0 8px 0;
    letter-spacing: -0.2px;
  }

  h3 {
    font-size: 11pt;
    font-weight: 800;
    color: #e2703a;
    margin: 14px 0 6px 0;
  }

  p {
    margin: 0 0 8px 0;
  }

  ul, ol {
    margin: 0 0 10px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }

  /* ─── TABLES ─── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 8.5pt;
    border: 1.5px solid #27231d;
    border-radius: 8px;
    overflow: hidden;
  }

  th {
    background: #27231d;
    color: #ffffff;
    font-weight: 800;
    text-align: left;
    padding: 7px 10px;
    letter-spacing: 0.3px;
  }

  td {
    padding: 6px 10px;
    border-bottom: 1px solid #e7e5e4;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: #fafaf9;
  }

  tr:last-child td {
    border-bottom: none;
  }

  /* ─── CODE & PRE ─── */
  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 8.5pt;
    background: #f5f5f4;
    color: #b91c1c;
    padding: 1.5px 5px;
    border-radius: 4px;
    border: 1px solid #e5e5e5;
  }

  pre {
    background: #1c1917;
    color: #f5f5f4;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 8pt;
    line-height: 1.45;
    overflow-x: auto;
    margin: 8px 0 12px 0;
    border: 1.5px solid #27231d;
  }

  pre code {
    background: none;
    color: inherit;
    padding: 0;
    border: none;
  }

  /* ─── CALLOUT BOXES ─── */
  .callout {
    border-radius: 10px;
    padding: 10px 14px;
    margin: 10px 0 14px 0;
    border-left: 4.5px solid #2e6f40;
    background: #f4fbf5;
    font-size: 9pt;
  }

  .callout-title {
    font-weight: 800;
    color: #2e6f40;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .callout-warning {
    border-left-color: #e2703a;
    background: #fff8f5;
  }

  .callout-warning .callout-title {
    color: #e2703a;
  }

  .callout-info {
    border-left-color: #0284c7;
    background: #f0f9ff;
  }

  .callout-info .callout-title {
    color: #0284c7;
  }

  /* ─── GRID CARDS ─── */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 12px 0;
  }

  .card-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 12px 0;
  }

  .box-card {
    background: #fafaf9;
    border: 1.5px solid #27231d;
    border-radius: 10px;
    padding: 10px 12px;
    box-shadow: 2px 2px 0 #27231d;
  }

  .box-card-title {
    font-size: 9.5pt;
    font-weight: 800;
    color: #1e1b18;
    margin-bottom: 3px;
  }

  .box-card-desc {
    font-size: 8.5pt;
    color: #555047;
    line-height: 1.4;
  }

  /* ─── DIAGRAMS ─── */
  .flow-diagram {
    background: #faf7ee;
    border: 2px solid #27231d;
    border-radius: 12px;
    padding: 14px;
    margin: 12px 0;
    text-align: center;
    box-shadow: 3px 3px 0 #27231d;
  }

  .flow-step-box {
    display: inline-block;
    background: #ffffff;
    border: 1.5px solid #27231d;
    border-radius: 8px;
    padding: 6px 12px;
    font-weight: 800;
    font-size: 8.5pt;
    color: #1e1b18;
    box-shadow: 2px 2px 0 #27231d;
    margin: 4px;
  }

  .flow-arrow {
    display: inline-block;
    color: #e2703a;
    font-weight: 900;
    margin: 0 4px;
  }

  /* TOC */
  .toc-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 4px 0;
    border-bottom: 1px dotted #d6d3d1;
    font-size: 9pt;
  }

  .toc-num {
    font-weight: 800;
    color: #2e6f40;
    margin-right: 8px;
  }

  .toc-name {
    font-weight: 700;
    color: #1e1b18;
  }

  .badge-tier {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 12px;
    font-size: 7.5pt;
    font-weight: 800;
    color: #fff;
    border: 1px solid #27231d;
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- COVER PAGE                                                          -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="cover">
  <div>
    <div class="cover-header">
      <span class="cover-badge">Official Engineering Manual</span>
      <span style="font-size: 8.5pt; font-weight: 800; color: #78716c;">CONFIDENTIAL & PROPRIETARY</span>
    </div>

    <div class="cover-title">AnimaFind</div>
    <div class="cover-subtitle">Critter Codex — System Architecture, Computer Vision & Development Reference</div>
    <div class="cover-desc">
      A comprehensive technical manual covering real-world wildlife exploration, client-side heuristic computer vision, physics-based gamification, offline-first dual-engine storage, interactive Leaflet/OpenStreetMap geospatial mapping, and native mobile cross-compilation for Android &amp; iOS.
    </div>

    <div class="cover-art-box">
      <!-- High-res Aurora Red Fox Vector Art -->
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2c180e"/>
            <stop offset="60%" stop-color="#4d2412"/>
            <stop offset="100%" stop-color="#7c3316"/>
          </linearGradient>
          <radialGradient id="cGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#f97316" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#2c180e" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="400" height="240" rx="12" fill="url(#cBg)"/>
        <circle cx="200" cy="110" r="95" fill="url(#cGlow)"/>
        <path d="M-20 240 L70 160 L160 240 Z" fill="#170c06" opacity="0.8"/>
        <path d="M240 240 L330 150 L420 240 Z" fill="#170c06" opacity="0.8"/>
        <!-- Fireflies & Celestial Aura -->
        <circle cx="70" cy="50" r="2.5" fill="#fde047" opacity="0.9"/>
        <circle cx="330" cy="65" r="2" fill="#fef08a" opacity="0.8"/>
        <circle cx="200" cy="30" r="2.5" fill="#ffffff" opacity="0.95"/>
        <circle cx="110" cy="90" r="2" fill="#fef08a" opacity="0.7"/>
        <circle cx="290" cy="95" r="3" fill="#facc15" opacity="0.85"/>
        <ellipse cx="200" cy="120" rx="95" ry="85" stroke="#facc15" stroke-width="2" stroke-dasharray="6 6" opacity="0.75"/>
        <!-- Fox Body -->
        <path d="M140 240 C140 165 170 130 200 130 C230 130 260 165 260 240 Z" fill="#ea580c"/>
        <path d="M175 240 C175 180 185 155 200 155 C215 155 225 180 225 240 Z" fill="#fffaf0"/>
        <!-- Fox Ears -->
        <path d="M150 115 L130 65 L175 95 Z" fill="#c2410c"/>
        <path d="M148 108 L138 75 L168 96 Z" fill="#431407"/>
        <path d="M250 115 L270 65 L225 95 Z" fill="#c2410c"/>
        <path d="M252 108 L262 75 L232 96 Z" fill="#431407"/>
        <!-- Fox Head -->
        <polygon points="145,110 255,110 200,175" fill="#ea580c"/>
        <polygon points="145,110 180,145 165,155" fill="#fffaf0"/>
        <polygon points="255,110 220,145 235,155" fill="#fffaf0"/>
        <polygon points="185,138 215,138 200,170" fill="#fffaf0"/>
        <circle cx="200" cy="168" r="4.5" fill="#18181b"/>
        <!-- Eyes -->
        <ellipse cx="178" cy="122" rx="5.5" ry="3.2" transform="rotate(-12 178 122)" fill="#18181b"/>
        <ellipse cx="222" cy="122" rx="5.5" ry="3.2" transform="rotate(12 222 122)" fill="#18181b"/>
        <circle cx="179" cy="121" r="1.5" fill="#ffffff"/>
        <circle cx="221" cy="121" r="1.5" fill="#ffffff"/>
        <!-- Whiskers -->
        <line x1="175" y1="164" x2="135" y2="160" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>
        <line x1="175" y1="168" x2="130" y2="171" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>
        <line x1="225" y1="164" x2="265" y2="160" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>
        <line x1="225" y1="168" x2="270" y2="171" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>
      </svg>
    </div>
  </div>

  <div class="cover-metadata-grid">
    <div>
      <div class="meta-item-label">Version</div>
      <div class="meta-item-value">v1.0.0 Production</div>
    </div>
    <div>
      <div class="meta-item-label">Mobile Target</div>
      <div class="meta-item-value">Android (API 36) · iOS 15+</div>
    </div>
    <div>
      <div class="meta-item-label">Core Engine</div>
      <div class="meta-item-value">Next.js 16 · React 19</div>
    </div>
    <div>
      <div class="meta-item-label">Publication Date</div>
      <div class="meta-item-value">November 2026</div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- TABLE OF CONTENTS                                                   -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>Table of Contents</h1>
<div style="margin-top: 18px;">
  <div class="toc-item"><span class="toc-name"><span class="toc-num">1.</span> Executive Summary &amp; Product Mission</span><span>Page 3</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">2.</span> High-Level Architecture &amp; Dual-Engine Data Flow</span><span>Page 4</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">3.</span> On-Device Computer Vision &amp; Anti-Cheat Pipeline</span><span>Page 5</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">4.</span> Free Interactive Map Service (OpenStreetMap &amp; Leaflet 1.9)</span><span>Page 6</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">5.</span> Custom SVG Icon Design System &amp; Procedural Specimen Artwork</span><span>Page 7</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">6.</span> Physics-Based Tin-Can Toss Minigame &amp; 3D Holographic Cards</span><span>Page 8</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">7.</span> Complete 35-Species European Biodiversity Encyclopedia (Codex)</span><span>Page 9</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">8.</span> Local Development, Tooling &amp; Installation Tutorial</span><span>Page 10</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">9.</span> Mobile Native Compilation Pipeline (Android APK &amp; iOS IPA)</span><span>Page 11</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">10.</span> CI/CD GitHub Actions Automation &amp; Release Engineering</span><span>Page 12</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">11.</span> Comprehensive Troubleshooting Runbook</span><span>Page 13</span></div>
  <div class="toc-item"><span class="toc-name"><span class="toc-num">12.</span> Security, Privacy &amp; Wildlife Ethics Manifesto</span><span>Page 14</span></div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 1: EXECUTIVE SUMMARY                                        -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>1. Executive Summary &amp; Product Mission</h1>

<p>
  <strong>AnimaFind ("Critter Codex")</strong> bridges real-world biodiversity appreciation with procedural collectible card gaming. Designed as a mobile-first, privacy-respecting progressive web and native mobile application, AnimaFind allows outdoor explorers, birdwatchers, and families to discover wildlife in their natural habitats, verify encounters using on-device computer vision heuristics, and mint unique, tradeable trading cards.
</p>

<div class="flow-diagram">
  <div class="flow-step-box">1. Real-World Discovery</div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step-box">2. Canvas AI Lock-On</div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step-box">3. Tin-Can Physics Toss</div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step-box">4. Mint 3D Procedural Card</div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step-box">5. Codex &amp; Proximity Map</div>
</div>

<h2>Core Problem Space &amp; Strategic Solutions</h2>
<div class="card-grid">
  <div class="box-card">
    <div class="box-card-title">Problem: Remote Offline Inaccessibility</div>
    <div class="box-card-desc">Most wildlife encounters occur in deep forest trails, coastal cliffs, and national reserves with zero cellular reception. Traditional cloud-dependent apps fail completely.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Solution: Dual-Engine Local-First Persistence</div>
    <div class="box-card-desc">Operates 100% offline via IndexedDB with automatic storage quota pruning. Cards, energy recharges, sightings, and codex updates happen on-device without network pings.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Problem: Digital Screen Spoofing &amp; Cheating</div>
    <div class="box-card-desc">Players easily cheat card-collecting games by pointing their cameras at Google Images on a computer monitor or holding printed photos.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Solution: Real-Time Optical Anti-Cheat</div>
    <div class="box-card-desc">Tracks motion parallax across consecutive video frames (verifying 3D depth) and runs 2D spatial frequency filters to detect monitor pixel grids (moiré interference).</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Problem: Poaching &amp; Disturbance of Sensitive Taxa</div>
    <div class="box-card-desc">Publishing precise GPS coordinates of endangered animals invites poachers, illegal pet collectors, and intrusive crowds that destroy fragile breeding grounds.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Solution: Differential Geofuzzing Engine</div>
    <div class="box-card-desc">Non-sensitive common species are fuzzed by ~150m for neighborhood discovery; protected or sensitive taxa (e.g. Fire Salamander, Barn Owl) are cloaked to a 5 km obfuscation perimeter.</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 2: SYSTEM ARCHITECTURE                                      -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>2. High-Level Architecture &amp; Dual-Engine Data Flow</h1>

<p>
  AnimaFind is architected as a layered system where the presentation tier remains decoupled from the data persistence engine through a unified API abstraction layer (<code>gameApi</code>).
</p>

<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technologies</th>
      <th>Architectural Responsibility</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Presentation (UI)</strong></td>
      <td>Next.js 16 (App Router), React 19, TailwindCSS v4</td>
      <td>Glassmorphism tactile theme, mobile-first responsive viewports, 3D CSS transforms, Web Audio API sound synthesis.</td>
    </tr>
    <tr>
      <td><strong>Mobile Bridge</strong></td>
      <td>Capacitor 8 Core, Android &amp; iOS Bridges</td>
      <td>Hardware camera capture, flashlight toggle, native haptic feedback, WKWebView / Android WebView lifecycle handling.</td>
    </tr>
    <tr>
      <td><strong>Interactive Mapping</strong></td>
      <td>Leaflet 1.9 + OpenStreetMap Raster Tiles</td>
      <td>100% free open-access mapping without billing accounts or API keys; 250m proximity claiming circles, custom HTML pins.</td>
    </tr>
    <tr>
      <td><strong>Primary Data Engine</strong></td>
      <td>LocalStoreEngine (IndexedDB + LocalStorage)</td>
      <td>Zero-latency, fully autonomous offline game loop running directly on-device.</td>
    </tr>
    <tr>
      <td><strong>Cloud Backend (Optional)</strong></td>
      <td>PostgreSQL + Drizzle ORM + Next.js API Routes</td>
      <td>Multiplayer crew leaderboards, cross-device sync, and community sighting aggregations.</td>
    </tr>
  </tbody>
</table>

<h2>Dual-Engine State Synchronization Architecture</h2>
<p>
  When executing on mobile hardware or offline in a browser, <code>src/lib/local-store.ts</code> acts as the single source of truth. The abstraction layer in <code>src/lib/api-client.ts</code> transparently intercepts all operations (<code>getMe</code>, <code>startRound</code>, <code>submitSighting</code>, <code>getCards</code>, <code>getEncyclopedia</code>):
</p>

<pre><code>// Client abstraction in src/lib/api-client.ts
export const gameApi = {
  async getMe(): Promise&lt;Me&gt; {
    if (isOfflineMode()) {
      return localStore.getMe();
    }
    return fetchJSON&lt;Me&gt;("/api/me");
  },
  async submitSighting(payload: SightingSubmission): Promise&lt;CaptureResult&gt; {
    if (isOfflineMode()) {
      return localStore.submitSighting(payload);
    }
    return postJSON&lt;CaptureResult&gt;("/api/sighting", payload);
  }
};</code></pre>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 3: COMPUTER VISION & ANTI-CHEAT                             -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>3. On-Device Computer Vision &amp; Anti-Cheat Pipeline</h1>

<p>
  To guarantee uncompromising user privacy while preventing digital image forgery, the entire computer vision feature extraction pipeline executes locally on the device at 60 FPS using an off-screen HTML5 Canvas.
</p>

<div class="card-grid">
  <div class="box-card">
    <div class="box-card-title">1. Luminance Matrix Extraction</div>
    <div class="box-card-desc">
      Sub-samples camera frames into a normalized 32×32 luminance buffer (1,024 float points). Computes center-weighted spatial contrast ratios and edge gradients without sending raw image pixels over the network.
    </div>
  </div>
  <div class="box-card">
    <div class="box-card-title">2. Parallax Motion Scoring</div>
    <div class="box-card-desc">
      Measures optical flow deltas between consecutive frames. Handheld micro-tremors reveal true 3D spatial depth across foreground and background. Stationary 2D paper printouts produce near-zero motion parallax and fail the lock threshold.
    </div>
  </div>
  <div class="box-card">
    <div class="box-card-title">3. Moiré Frequency Filter</div>
    <div class="box-card-desc">
      Executes a high-pass 2D frequency analysis across high-contrast edges. The physical subpixel aperture grid of computer monitors, tablets, and smartphones produces telltale periodic interference bands. When moiré scores exceed 0.72, the HUD warns the player.
    </div>
  </div>
  <div class="box-card">
    <div class="box-card-title">4. 64-Bit Perceptual Hashing (pHash)</div>
    <div class="box-card-desc">
      Generates a 16-hex-character perceptual hash of each captured image. Hashes are cross-referenced in local storage to prevent players from re-scanning identical photos to farm coins and duplicate cards.
    </div>
  </div>
</div>

<div class="callout callout-info avoid-break">
  <div class="callout-title">Camera Hardware Access &amp; Fallback Resilience</div>
  The scanner utilizes a multi-tier WebRTC constraint fallback cascade (<code>ideal: "environment"</code> at 1080p, falling back to 720p, then to any available video stream). For environments lacking a physical webcam (e.g. desktop browsers, automated CI environments), the tactile <strong>Specimen Simulator (IconDice)</strong> generates realistic synthetic wildlife specimens with proper mathematical signatures.
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 4: FREE INTERACTIVE MAP SERVICE                             -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>4. Free Interactive Map Service (OpenStreetMap &amp; Leaflet 1.9)</h1>

<p>
  AnimaFind integrates a 100% free, production-hardened interactive mapping solution powered by <strong>Leaflet 1.9</strong> and <strong>OpenStreetMap (OSM)</strong> standard raster tiles.
</p>

<h2>Why OpenStreetMap + Leaflet was Selected</h2>
<ul>
  <li><strong>Zero Billing &amp; Zero API Keys:</strong> Requires no credit card, no billing subscription, and no third-party API tokens that can expire or leak.</li>
  <li><strong>Capacitor Mobile WebView Resilience:</strong> Heavy WebGL engines (Mapbox GL / MapLibre) frequently experience catastrophic GPU context loss when mobile apps switch tabs. Leaflet uses clean HTML5 canvas and DOM elements, guaranteeing crash-free rendering across Android WebViews and iOS WKWebView.</li>
  <li><strong>Lightweight Bundle Footprint:</strong> Adds only ~140 KB to the client bundle, enabling near-instant cold starts on slow outdoor cellular networks.</li>
</ul>

<h2>Critical Implementation Safeguards</h2>
<table>
  <thead>
    <tr>
      <th>Engineering Requirement</th>
      <th>Technical Challenge</th>
      <th>Engineered Solution in AnimaFind</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Next.js SSR Hydration</strong></td>
      <td>Leaflet accesses browser globals (<code>window</code>, <code>document</code>) immediately upon import, crashing server-side Next.js prerendering.</td>
      <td>Dynamically imported via <code>next/dynamic</code> with <code>{ ssr: false }</code> in <code>src/app/map/page.tsx</code>, paired with an animated loading skeleton.</td>
    </tr>
    <tr>
      <td><strong>Container Dimensions</strong></td>
      <td>Leaflet calculates coordinate projections from container size. Without explicit CSS height, height collapses to 0px and tiles fail to draw.</td>
      <td>Guaranteed explicit CSS height bounds (<code>style={{ height: "440px" }}</code>) with responsive flex wrappers.</td>
    </tr>
    <tr>
      <td><strong>Unmount Lifecycle Teardown</strong></td>
      <td>Navigating away without disposing of Leaflet creates detached DOM nodes and memory leaks.</td>
      <td>Strictly executes <code>mapRef.current.remove()</code> in the <code>useEffect</code> cleanup phase.</td>
    </tr>
    <tr>
      <td><strong>Tile Load Resilience</strong></td>
      <td>Spotty cellular network can drop tile packets.</td>
      <td>Listens to <code>tileerror</code> events on the tile layer, displaying a non-intrusive warning banner while keeping interactive pins active.</td>
    </tr>
  </tbody>
</table>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 5: CUSTOM ICONS & SPECIMEN ART                             -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>5. Custom SVG Icon Design System &amp; Specimen Art</h1>

<p>
  Every plain emoji in the application has been replaced with a unified design system of <strong>60+ custom SVG icons</strong> located in <code>src/components/icons/AppIcons.tsx</code>, alongside a procedural zoological vector art generator in <code>src/lib/specimen-art.tsx</code>.
</p>

<h2>Design Tokens &amp; Standard Contracts</h2>
<ul>
  <li><strong>Uniform Viewport:</strong> <code>viewBox="0 0 24 24"</code> across all interface icons.</li>
  <li><strong>Consistent Stroke Weight:</strong> Standard <code>strokeWidth={2}</code> (or <code>2.5</code> for active checkmarks).</li>
  <li><strong>Joint &amp; Cap Geometry:</strong> <code>strokeLinecap="round"</code> and <code>strokeLinejoin="round"</code>.</li>
  <li><strong>Theme Inheritance:</strong> Built with <code>stroke="currentColor"</code> and <code>fill="none"</code>, allowing seamless adaptation to parent Tailwind CSS classes (e.g. <code>text-leaf</code>, <code>text-accent</code>, <code>text-amber-500</code>).</li>
</ul>

<h2>Procedural Specimen Vector Art Engine</h2>
<p>
  When players inspect cards, explore the Codex, or test without a live camera, <code>src/lib/specimen-art.tsx</code> dynamically generates museum-grade botanical and zoological plates for all 35 species across the 6 taxonomic classes:
</p>

<div class="card-grid">
  <div class="box-card">
    <div class="box-card-title">Mammals (Fox, Deer, Badger, Bat, Hedgehog)</div>
    <div class="box-card-desc">Layered ear anatomy, white cheek contours, whiskers, eye gleams, branching antlers, bicolored quills, and starry twilight backdrops.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Birds (Owl, Kingfisher, Robin, Stork)</div>
    <div class="box-card-desc">Heart-shaped facial discs, dagger bills, turquoise dorsal mantles, scarlet breast plates, and celestial moonlit perches.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Insects (Stag Beetle, Butterfly, Bumblebee)</div>
    <div class="box-card-desc">Polished mahogany elytra, segmented pincer mandibles, scalloped gradient wings, fuzzy pollen bands, and ember spark motes.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Amphibians &amp; Reptiles (Frog, Salamander, Lizard, Snake)</div>
    <div class="box-card-desc">Bulbous golden eyes with horizontal pupils, dewy water lily pads, sulfur-yellow fire blotches, winding S-curves, and sunbaked rocks.</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 6: MINIGAME & 3D HOLOGRAPHIC CARDS                          -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>6. Physics Tin-Can Toss &amp; 3D Holographic Cards</h1>

<h2>Normalized Parabolic Physics Engine</h2>
<p>
  Once an animal is locked in the viewfinder, players spend 1 tin can (energy) to initiate the flick-and-toss minigame. The physics calculation in <code>src/components/scan/TossGame.tsx</code> uses normalized delta-time integration:
</p>
<pre><code>// Normalized to 60 FPS (16.667ms base) across 60Hz, 90Hz, 120Hz displays
const dtScale = dtMs / 16.667;
pos.x += vel.x * dtScale;
pos.y += vel.y * dtScale;
vel.x *= Math.pow(0.995, dtScale); // Air resistance
vel.y += 0.0016 * dtScale;          // Gravitational acceleration</code></pre>

<h2>3D Holographic Foil Cards &amp; Dual Plate Mode</h2>
<div class="card-grid">
  <div class="box-card">
    <div class="box-card-title">Pointer-Tracking 3D Tilt</div>
    <div class="box-card-desc">Calculates relative pointer coordinates (<code>rotateX</code>, <code>rotateY</code>) to dynamically tilt the card with genuine perspective depth during mouse hover or mobile touch drag.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Iridescent Specular Sheen</div>
    <div class="box-card-desc">High-tier cards (Twilight, Emberwood, Aurora) render an interactive rainbow gradient with <code>mix-blend-color-dodge</code> that responds to the dynamic lighting angle.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Dual Plate Switcher</div>
    <div class="box-card-desc">A tactile toggle allows players to alternate between their verified raw camera field photo and the collector's zoological specimen plate.</div>
  </div>
  <div class="box-card">
    <div class="box-card-title">Synthesized Audio &amp; Haptics</div>
    <div class="box-card-desc">Flipping a card triggers an offline Web Audio synthesizer sound (<code>playCardFlipSound()</code>) and tactile haptic vibration with header mute control.</div>
  </div>
</div>

<h2>Rarity Tier Progression Matrix</h2>
<table>
  <thead>
    <tr>
      <th>Tier</th>
      <th>Series Name</th>
      <th>Rarity Weight</th>
      <th>Stat Bonus</th>
      <th>XP Award</th>
      <th>Coins</th>
      <th>Visual Styling</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="badge-tier" style="background: #7f9c6a;">Tier 1</span></td>
      <td><strong>Hedgerow</strong></td>
      <td>50%</td>
      <td>+0</td>
      <td>20 XP</td>
      <td>6</td>
      <td>Forest green borders, earthy leaf accents</td>
    </tr>
    <tr>
      <td><span class="badge-tier" style="background: #4a9ec4;">Tier 2</span></td>
      <td><strong>Meadow</strong></td>
      <td>27%</td>
      <td>+8</td>
      <td>35 XP</td>
      <td>12</td>
      <td>Azure glints, cyan atmospheric backdrops</td>
    </tr>
    <tr>
      <td><span class="badge-tier" style="background: #8c6bd6;">Tier 3</span></td>
      <td><strong>Twilight</strong></td>
      <td>14%</td>
      <td>+16</td>
      <td>60 XP</td>
      <td>22</td>
      <td>Violet starlight dust, iridescent sheen</td>
    </tr>
    <tr>
      <td><span class="badge-tier" style="background: #e2703a;">Tier 4</span></td>
      <td><strong>Emberwood</strong></td>
      <td>7%</td>
      <td>+26</td>
      <td>110 XP</td>
      <td>45</td>
      <td>Fiery orange ember sparks, flame particles</td>
    </tr>
    <tr>
      <td><span class="badge-tier" style="background: #e8b53c;">Tier 5</span></td>
      <td><strong>Aurora</strong></td>
      <td>2%</td>
      <td>+38</td>
      <td>240 XP</td>
      <td>120</td>
      <td>Dual golden celestial halo, animated sparkles</td>
    </tr>
  </tbody>
</table>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 7: CODEX ENCYCLOPEDIA                                       -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>7. Complete 35-Species European Wildlife Codex</h1>

<p>
  The Codex represents the curated European biodiversity encyclopedia, tracking discovery progress across 35 species divided into 6 taxonomic classes:
</p>

<table>
  <thead>
    <tr>
      <th>Class</th>
      <th>Species Label</th>
      <th>Scarcity</th>
      <th>Specialty Stat</th>
      <th>PvP Advantage</th>
      <th>Conservation / Privacy</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Mammal</strong></td>
      <td>Domestic Cat, Domestic Dog, Grey Squirrel</td>
      <td>★☆☆☆☆</td>
      <td>Grit</td>
      <td>Insects</td>
      <td>Public (150m fuzz)</td>
    </tr>
    <tr>
      <td><strong>Mammal</strong></td>
      <td>Red Fox, European Hedgehog, Roe Deer, Brown Bat</td>
      <td>★★★☆☆ to ★★★★★</td>
      <td>Grit</td>
      <td>Insects</td>
      <td><strong>Confidential (5km cloak)</strong></td>
    </tr>
    <tr>
      <td><strong>Bird</strong></td>
      <td>House Sparrow, Rock Pigeon, Great Tit, Blackbird</td>
      <td>★☆☆☆☆ to ★★☆☆☆</td>
      <td>Speed</td>
      <td>Reptiles</td>
      <td>Public (150m fuzz)</td>
    </tr>
    <tr>
      <td><strong>Bird</strong></td>
      <td>White Stork, Common Kestrel, Kingfisher</td>
      <td>★★★★☆ to ★★★★★</td>
      <td>Speed</td>
      <td>Reptiles</td>
      <td><strong>Confidential (5km cloak)</strong></td>
    </tr>
    <tr>
      <td><strong>Insect</strong></td>
      <td>Honey Bee, Cabbage White, Seven-spot Ladybird</td>
      <td>★☆☆☆☆ to ★★☆☆☆</td>
      <td>Swarm</td>
      <td>Amphibians</td>
      <td>Public (150m fuzz)</td>
    </tr>
    <tr>
      <td><strong>Insect</strong></td>
      <td>Emperor Dragonfly, Stag Beetle</td>
      <td>★★★☆☆ to ★★★★★</td>
      <td>Swarm</td>
      <td>Amphibians</td>
      <td><strong>Confidential (5km cloak)</strong></td>
    </tr>
    <tr>
      <td><strong>Reptile</strong></td>
      <td>Common Wall Lizard, Slow Worm, Grass Snake, Pond Turtle</td>
      <td>★★☆☆☆ to ★★★★★</td>
      <td>Camouflage</td>
      <td>Mammals</td>
      <td><strong>Confidential (5km cloak)</strong></td>
    </tr>
    <tr>
      <td><strong>Amphibian</strong></td>
      <td>Common Frog, Common Toad, Fire Salamander</td>
      <td>★★☆☆☆ to ★★★★★</td>
      <td>Moisture</td>
      <td>Birds</td>
      <td><strong>Confidential (5km cloak)</strong></td>
    </tr>
    <tr>
      <td><strong>Other</strong></td>
      <td>Garden Snail, Common Earthworm, Garden Spider, Woodlouse</td>
      <td>★☆☆☆☆ to ★★☆☆☆</td>
      <td>Mystery</td>
      <td>Other</td>
      <td>Public (150m fuzz)</td>
    </tr>
  </tbody>
</table>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 8: INSTALLATION & LOCAL DEV                                 -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>8. Local Development &amp; Installation Tutorial</h1>

<h2>Step 1: System Prerequisites</h2>
<ul>
  <li><strong>Node.js:</strong> <code>v20.0.0</code> or higher (LTS v22 or v24 recommended).</li>
  <li><strong>npm:</strong> <code>v10.0.0</code> or higher.</li>
  <li><strong>Java JDK:</strong> <code>JDK 21 LTS</code> (mandatory for Android Gradle Plugin 8.13).</li>
  <li><strong>Android Studio:</strong> Ladybug / Otter or newer with Android SDK API 36.</li>
  <li><strong>Xcode:</strong> 15.0+ on macOS with Swift 5.9 (for iOS builds).</li>
</ul>

<h2>Step 2: Setup &amp; Verification Commands</h2>
<pre><code># 1. Clone repository
git clone https://github.com/Gheorghe-dev/AnimaFind.git
cd AnimaFind

# 2. Install production and development dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env

# 4. Launch Next.js development server with Turbopack
npm run dev

# 5. Run the complete automated test suite (42 tests across 8 suites)
npm test

# 6. Verify strict TypeScript compliance
npm run typecheck

# 7. Verify ESLint clean code style
npm run lint</code></pre>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 9: MOBILE BUILD PIPELINE                                    -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>9. Mobile Native Compilation Pipeline</h1>

<p>
  AnimaFind utilizes a custom build script (<code>scripts/build-mobile.cjs</code>) to compile Next.js into a clean static web export (<code>./out</code>) while isolating server API routes, followed by native Capacitor synchronization.
</p>

<h2>Android Compilation (APK)</h2>
<pre><code># Compile static assets & sync into Android native project
npm run build:mobile

# Build Debug APK for testing
npm run android:debug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Build Production Release APK (with R8 / ProGuard optimization)
npm run android:release
# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk (or signed app-release.apk)</code></pre>

<h2>iOS Compilation (Xcode Archive)</h2>
<pre><code># Sync web assets to iOS Xcode project
npm run cap:ios

# In Xcode: Select target device/simulator, press Cmd+R to run, or Product -> Archive for App Store</code></pre>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 10: CI/CD AUTOMATION                                        -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>10. GitHub Actions CI/CD &amp; Release Automation</h1>

<table>
  <thead>
    <tr>
      <th>Workflow File</th>
      <th>Trigger Event</th>
      <th>Validation &amp; Packaging Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>.github/workflows/android-build.yml</code></td>
      <td>Push to <code>main</code>, Pull Requests</td>
      <td>Sets up JDK 21, validates Node dependencies, runs 42 unit tests, compiles Next.js static bundle, executes Gradle assembleRelease, and uploads unsigned release APK as build artifact.</td>
    </tr>
    <tr>
      <td><code>.github/workflows/ios-build.yml</code></td>
      <td>Push to <code>main</code>, Pull Requests</td>
      <td>Executes on <code>macos-14</code> runner, verifies Swift Package Manager dependencies, compiles iOS Xcode archive for simulator validation.</td>
    </tr>
    <tr>
      <td><code>.github/workflows/release.yml</code></td>
      <td>Semantic Version Tags (<code>v*.*.*</code>)</td>
      <td>Builds production APK, signs with release keystore secrets, compiles release notes, and attaches production artifacts to GitHub Releases.</td>
    </tr>
  </tbody>
</table>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 11: TROUBLESHOOTING                                         -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>11. Comprehensive Troubleshooting Runbook</h1>

<div class="card-grid">
  <div class="box-card avoid-break">
    <div class="box-card-title">Web: Camera Permission Denied</div>
    <div class="box-card-desc"><strong>Cause:</strong> WebRTC requires a secure context (HTTPS or <code>http://localhost</code>).<br><strong>Fix:</strong> Access exclusively via localhost, or use the <strong>Specimen Simulator button</strong> in the viewfinder to simulate valid wildlife frames.</div>
  </div>
  <div class="box-card avoid-break">
    <div class="box-card-title">Android: Unsupported Class Version</div>
    <div class="box-card-desc"><strong>Cause:</strong> Android Gradle Plugin 8.13 requires Java 21.<br><strong>Fix:</strong> Ensure <code>JAVA_HOME</code> points to JDK 21 (e.g. <code>$env:JAVA_HOME = "C:\\Program Files\\Android\\openjdk\\jdk-21.0.8"</code>).</div>
  </div>
  <div class="box-card avoid-break">
    <div class="box-card-title">Android: SDK Location Not Found</div>
    <div class="box-card-desc"><strong>Cause:</strong> Missing <code>local.properties</code>.<br><strong>Fix:</strong> Create <code>android/local.properties</code> with <code>sdk.dir=C:\\Users\\Alex\\AppData\\Local\\Android\\Sdk</code>.</div>
  </div>
  <div class="box-card avoid-break">
    <div class="box-card-title">Static Export: API Route Errors</div>
    <div class="box-card-desc"><strong>Cause:</strong> Next.js <code>output: export</code> rejects dynamic API routes.<br><strong>Fix:</strong> Always run <code>npm run build:mobile</code>, which automatically isolates <code>src/app/api</code> during static export.</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- SECTION 12: ETHICS & MANIFESTO                                      -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
<div class="page-break"></div>

<h1>12. Security, Privacy &amp; Wildlife Ethics Manifesto</h1>

<p>
  AnimaFind was created to connect humans with the natural world without disrupting it. We enforce strict technical and behavioral boundaries:
</p>

<ul>
  <li><strong>Leave No Trace:</strong> Never touch, chase, bait, or corner wildlife for a photo or game stat. Respect nesting sites and keep a safe, non-intrusive distance.</li>
  <li><strong>Anti-Poaching Privacy Shield:</strong> The location of rare, vulnerable, or protected species is strictly cloaked to a 5-kilometer radius. Raw GPS coordinates for sensitive taxa never touch public APIs or public community feeds.</li>
  <li><strong>On-Device Privacy:</strong> Unverified camera frames are analyzed entirely within device memory and discarded immediately. No video stream is ever streamed to cloud servers.</li>
  <li><strong>No Pay-to-Win Mechanics:</strong> Card power ratings, combat stats, and discovery achievements are earned exclusively by observing nature outdoors. Premium tiers only accelerate energy recharge rates without offering unfair combat stat boosts.</li>
</ul>

<div style="margin-top: 40px; text-align: center; border-top: 2px solid #27231d; padding-top: 20px;">
  <p style="font-weight: 800; font-size: 11pt; color: #1e1b18;">AnimaFind (Critter Codex) · Open-Source Biodiversity Gaming</p>
  <p style="font-size: 8.5pt; color: #78716c;">Licensed under the MIT License · GitHub: https://github.com/Gheorghe-dev/AnimaFind</p>
</div>

</body>
</html>
"""

def generate_pdf():
    print(f"[*] Writing full documentation HTML to {HTML_PATH}...")
    HTML_PATH.write_text(build_html_content(), encoding="utf-8")
    
    print(f"[*] Generating PDF via Headless Chrome to {PDF_PATH}...")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        f"--print-to-pdf={PDF_PATH}",
        "--no-pdf-header-footer",
        str(HTML_PATH)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    time.sleep(2)
    
    if PDF_PATH.exists() and PDF_PATH.stat().st_size > 1000:
        size_kb = PDF_PATH.stat().st_size / 1024
        print(f"[OK] Successfully generated PDF! File size: {size_kb:.1f} KB ({PDF_PATH})")
    else:
        print(f"[!] Error generating PDF. Chrome output: {result.stdout} {result.stderr}")

if __name__ == "__main__":
    generate_pdf()
