// Simple audio system using Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playSound(
  frequency: number,
  duration: number = 0.1,
  type: 'sine' | 'square' | 'sawtooth' = 'sine',
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log('Audio not available');
  }
}

export function playAttackSound() {
  playSound(400, 0.08, 'square', 0.25);
  setTimeout(() => playSound(500, 0.08, 'square', 0.2), 30);
}

export function playBlockSound() {
  playSound(600, 0.12, 'sine', 0.3);
  setTimeout(() => playSound(800, 0.1, 'sine', 0.25), 50);
}

export function playSpecialSound() {
  playSound(300, 0.1, 'sawtooth', 0.3);
  setTimeout(() => playSound(500, 0.15, 'sawtooth', 0.3), 80);
  setTimeout(() => playSound(700, 0.12, 'sawtooth', 0.25), 150);
}

export function playHitSound() {
  playSound(200, 0.06, 'sine', 0.25);
}

export function playDamageSound() {
  playSound(150, 0.15, 'square', 0.3);
}

export function playCollectSound() {
  playSound(800, 0.08, 'sine', 0.2);
  setTimeout(() => playSound(1000, 0.08, 'sine', 0.2), 80);
}

let fightThemeOscillators: OscillatorNode[] = [];
let fightThemeGain: GainNode | null = null;

export function startFightTheme() {
  try {
    const ctx = getAudioContext();
    
    // Stop existing theme
    stopFightTheme();

    fightThemeGain = ctx.createGain();
    fightThemeGain.connect(ctx.destination);
    fightThemeGain.gain.setValueAtTime(0.15, ctx.currentTime);

    // Create a simple repeating bass pattern
    const baseFrequencies = [110, 110, 165, 147, 110, 110, 165, 147]; // A3, A3, E3, D3, A3, A3, E3, D3
    const beatDuration = 0.3;

    let beatIndex = 0;
    const playBeat = () => {
      if (!fightThemeGain) return;

      const freq = baseFrequencies[beatIndex % baseFrequencies.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(fightThemeGain);

      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + beatDuration * 0.9);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + beatDuration * 0.9);

      fightThemeOscillators.push(osc);
      beatIndex++;

      setTimeout(playBeat, beatDuration * 1000);
    };

    playBeat();
  } catch (e) {
    console.log('Fight theme not available');
  }
}

export function stopFightTheme() {
  try {
    fightThemeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    fightThemeOscillators = [];

    if (fightThemeGain) {
      fightThemeGain.gain.setValueAtTime(0.15, getAudioContext().currentTime);
      fightThemeGain.gain.exponentialRampToValueAtTime(0.01, getAudioContext().currentTime + 0.5);
    }
  } catch (e) {
    console.log('Stop theme error');
  }
}
