// Sound notifications using Web Audio API — no external files needed

let audioCtx = null;

const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

const beep = (frequency, duration, type = 'sine', volume = 0.3, delay = 0) => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch (e) {
    console.warn('Sound blocked:', e);
  }
};

// 🔔 Chat message — soft ding
export const playChatSound = () => {
  beep(880, 0.15, 'sine', 0.25);
  beep(1100, 0.15, 'sine', 0.2, 0.12);
};

// 📅 New booking received — double chime
export const playBookingSound = () => {
  beep(660, 0.2, 'sine', 0.3);
  beep(880, 0.25, 'sine', 0.3, 0.2);
  beep(1100, 0.3, 'sine', 0.25, 0.4);
};

// ✅ Booking approved — success chime
export const playApprovedSound = () => {
  beep(523, 0.15, 'sine', 0.3);
  beep(659, 0.15, 'sine', 0.3, 0.15);
  beep(784, 0.15, 'sine', 0.3, 0.3);
  beep(1047, 0.3, 'sine', 0.25, 0.45);
};

// ❌ Booking rejected — low thud
export const playRejectedSound = () => {
  beep(300, 0.2, 'triangle', 0.3);
  beep(200, 0.3, 'triangle', 0.25, 0.2);
};

// 📋 Task assigned — alert ping
export const playTaskSound = () => {
  beep(740, 0.1, 'square', 0.15);
  beep(988, 0.2, 'sine', 0.25, 0.1);
};

// 👤 Member added — welcome tone
export const playMemberSound = () => {
  beep(440, 0.15, 'sine', 0.25);
  beep(554, 0.15, 'sine', 0.25, 0.15);
  beep(659, 0.25, 'sine', 0.2, 0.3);
};

// ✏️ Member updated — soft blip
export const playUpdateSound = () => {
  beep(660, 0.1, 'sine', 0.2);
  beep(880, 0.15, 'sine', 0.15, 0.1);
};

// 🔔 General notification — single ping
export const playNotifSound = () => {
  beep(800, 0.2, 'sine', 0.25);
};
