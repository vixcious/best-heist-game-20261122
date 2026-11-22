// Midnight Vault — sound, synthesised live with WebAudio. No audio files, no network.
// One file, one job: every beep, sting and siren the game makes lives here.
export function createAudio() {
  let ctx = null;
  let siren = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0) {
    const c = ensure();
    if (!c) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + when);
      o.stop(c.currentTime + when + dur);
    } catch {
      // Sound is garnish: a failure here must never break the game.
    }
  }

  return {
    unlock() {
      ensure();
    },
    pickup() {
      tone(880, 0.12, 'sine', 0.12);
      tone(1320, 0.18, 'sine', 0.1, 0.08);
    },
    smoke() {
      tone(220, 0.3, 'triangle', 0.08);
    },
    emp() {
      tone(1400, 0.08, 'square', 0.06);
      tone(700, 0.15, 'square', 0.06, 0.07);
    },
    alert() {
      tone(520, 0.14, 'square', 0.1);
      tone(390, 0.2, 'square', 0.1, 0.12);
    },
    crackTick() {
      tone(1200, 0.05, 'sine', 0.05);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.12));
    },
    caught() {
      [392, 311, 233].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.08, i * 0.16));
    },
    // A slow two-tone siren while the alarm is in HUNT; silent otherwise.
    setSiren(on) {
      const c = ensure();
      if (!c) return;
      try {
        if (on && !siren) {
          siren = c.createOscillator();
          const g = c.createGain();
          g.gain.value = 0.04;
          siren.type = 'sine';
          siren.frequency.value = 660;
          const lfo = c.createOscillator();
          lfo.frequency.value = 0.8;
          const lfoGain = c.createGain();
          lfoGain.gain.value = 180;
          lfo.connect(lfoGain);
          lfoGain.connect(siren.frequency);
          siren.connect(g);
          g.connect(c.destination);
          siren.start();
          lfo.start();
          siren._lfo = lfo;
          siren._gain = g;
        } else if (!on && siren) {
          siren.stop();
          siren._lfo.stop();
          siren = null;
        }
      } catch {
        siren = null;
      }
    },
  };
}
