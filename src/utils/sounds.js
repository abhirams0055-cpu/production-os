// Sound notifications using Web Audio API — no external files needed

let audioCtx = null;
let unlocked = false;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

// Call this on first user interaction to unlock audio
export const unlockAudio = () => {
  if (unlocked) return;
  try {
    const ctx = getCtx();
    // Play a silent buffer to unlock
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    if (ctx.state === 'suspended') ctx.resume();
    unlocked = true;
  } catch (e) {}
};

const beep = (frequency, duration, type = 'sine', volume = 0.4, delay = 0) => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch (e) {
    console.warn('Sound error:', e);
  }
};

// 💬 Chat message — soft double ding
export const playChatSound = () => {
  beep(880, 0.12, 'sine', 0.3);
  beep(1100, 0.15, 'sine', 0.25, 0.13);
};

// 📅 New booking received — triple rising chime
export const playBookingSound = () => {
  beep(523, 0.15, 'sine', 0.35);
  beep(659, 0.15, 'sine', 0.35, 0.18);
  beep(880, 0.25, 'sine', 0.3, 0.36);
};

// ✅ Booking approved — 4-note success melody
export const playApprovedSound = () => {
  beep(523, 0.12, 'sine', 0.3);
  beep(659, 0.12, 'sine', 0.3, 0.14);
  beep(784, 0.12, 'sine', 0.3, 0.28);
  beep(1047, 0.3, 'sine', 0.25, 0.42);
};

// ❌ Booking rejected — low descending thud
export const playRejectedSound = () => {
  beep(320, 0.2, 'triangle', 0.35);
  beep(220, 0.3, 'triangle', 0.3, 0.22);
};

// 📋 Task assigned — alert ping
export const playTaskSound = () => {
  beep(740, 0.08, 'square', 0.2);
  beep(988, 0.25, 'sine', 0.3, 0.1);
};

// 👤 Member added — welcome 3-note tone
export const playMemberSound = () => {
  beep(440, 0.15, 'sine', 0.3);
  beep(554, 0.15, 'sine', 0.3, 0.18);
  beep(659, 0.3, 'sine', 0.25, 0.36);
};

// ✏️ Member updated — soft blip
export const playUpdateSound = () => {
  beep(660, 0.08, 'sine', 0.25);
  beep(880, 0.15, 'sine', 0.2, 0.1);
};
