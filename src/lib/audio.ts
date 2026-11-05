// Web Audio API Synthesizer & Mobile Haptics for AnimaFind
// Zero external audio files required — 100% offline & local

let audioCtx: AudioContext | null = null;
let soundMuted = false;

export function isSoundMuted(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("animafind_sound_muted") === "true";
  }
  return soundMuted;
}

export function toggleSoundMuted(): boolean {
  const current = isSoundMuted();
  const next = !current;
  soundMuted = next;
  if (typeof window !== "undefined") {
    localStorage.setItem("animafind_sound_muted", String(next));
  }
  return next;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || isSoundMuted()) return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        void ctx.resume();
      }
    } catch {
      // ignore
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" = "light") {
  if (typeof window === "undefined" || isSoundMuted() || !("navigator" in window) || !navigator.vibrate) return;
  try {
    switch (type) {
      case "light":
        navigator.vibrate(12);
        break;
      case "medium":
        navigator.vibrate(28);
        break;
      case "heavy":
        navigator.vibrate([40, 30, 40]);
        break;
      case "success":
        navigator.vibrate([20, 40, 60]);
        break;
    }
  } catch {
    // silently ignore if vibration disallowed
  }
}

export function playLockSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
    triggerHaptic("light");
  } catch {
    // audio fallback
  }
}

export function playTossSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
    triggerHaptic("medium");
  } catch {
    // audio fallback
  }
}

export function playHitSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
    triggerHaptic("success");
  } catch {
    // audio fallback
  }
}

export function playCardFlipSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
    triggerHaptic("light");
  } catch {
    // fallback
  }
}

export function playCardRevealSound(isLegendary = false) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = isLegendary
      ? [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5] // C major celestial arpeggio
      : [329.63, 392.0, 493.88, 659.25]; // E minor / meadow chord

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * (isLegendary ? 0.09 : 0.07);

      osc.type = isLegendary ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(isLegendary ? 0.18 : 0.15, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (isLegendary ? 0.6 : 0.4));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + (isLegendary ? 0.65 : 0.45));
    });

    triggerHaptic(isLegendary ? "heavy" : "success");
  } catch {
    // audio fallback
  }
}

export function playCoinSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.3);
    triggerHaptic("light");
  } catch {
    // audio fallback
  }
}

export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // audio fallback
  }
}
