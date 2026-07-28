// Web Audio API Sound Synthesizer for offline, dependency-free audio effects
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClick() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

export function playSuccess() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a happy 3-note ascending arpeggio (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      const time = now + index * 0.08;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // softer sound than square, fuller than sine
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.2);
    });
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

export function playFailure() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a cute "oops" descending slide (e.g., sliding down from a high pitch)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine'; // Sine wave is soft and cute
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3); // Slide down pitch
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05); // Quick attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Fade out
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

export function playVictory() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // A triumphant fanfare: C5 (0s) -> G5 (0.1s) -> C5 (0.2s) -> E5 (0.3s) -> G5 (0.4s) -> C6 (0.5s)
    const notes = [
      { f: 523.25, d: 0.1 }, // C5
      { f: 392.00, d: 0.1 }, // G4
      { f: 523.25, d: 0.1 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.50, d: 0.4 }  // C6
    ];
    
    let currentStart = now;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, currentStart);
      
      gain.gain.setValueAtTime(0, currentStart);
      gain.gain.linearRampToValueAtTime(0.15, currentStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, currentStart + note.d);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(currentStart);
      osc.stop(currentStart + note.d);
      
      currentStart += note.d * 0.8; // overlap slightly
    });
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}
