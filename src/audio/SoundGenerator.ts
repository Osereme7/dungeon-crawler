import Phaser from 'phaser';

export function generateAllSounds(scene: Phaser.Scene): void {
  const audioCtx = new AudioContext();

  generateSound(scene, audioCtx, 'sfx-hit', createHitSound);
  generateSound(scene, audioCtx, 'sfx-kill', createKillSound);
  generateSound(scene, audioCtx, 'sfx-hurt', createHurtSound);
  generateSound(scene, audioCtx, 'sfx-pickup', createPickupSound);
  generateSound(scene, audioCtx, 'sfx-potion', createPotionSound);
  generateSound(scene, audioCtx, 'sfx-stairs', createStairsSound);
  generateSound(scene, audioCtx, 'sfx-levelup', createLevelUpSound);
  generateSound(scene, audioCtx, 'sfx-step', createStepSound);
  generateSound(scene, audioCtx, 'sfx-crit', createCritSound);

  audioCtx.close();
}

function generateSound(
  scene: Phaser.Scene,
  audioCtx: AudioContext,
  key: string,
  generator: (ctx: OfflineAudioContext) => void,
): void {
  const sampleRate = 22050;
  const duration = 0.5;
  const offline = new OfflineAudioContext(1, sampleRate * duration, sampleRate);

  generator(offline);

  offline.startRendering().then((buffer) => {
    const wavData = audioBufferToWav(buffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    // Load as audio via the scene's loader
    scene.load.audio(key, url);
    scene.load.start();
  });
}

function createHitSound(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, 0);
  osc.frequency.exponentialRampToValueAtTime(80, 0.1);
  gain.gain.setValueAtTime(0.3, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start(0);
  osc.stop(0.15);
}

function createKillSound(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, 0);
  osc.frequency.exponentialRampToValueAtTime(100, 0.3);
  gain.gain.setValueAtTime(0.25, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start(0);
  osc.stop(0.35);
}

function createHurtSound(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, 0);
  osc.frequency.exponentialRampToValueAtTime(100, 0.2);
  gain.gain.setValueAtTime(0.2, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start(0);
  osc.stop(0.2);
}

function createPickupSound(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, 0);
  osc.frequency.exponentialRampToValueAtTime(800, 0.1);
  gain.gain.setValueAtTime(0.2, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start(0);
  osc.stop(0.15);
}

function createPotionSound(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, 0);
  osc.frequency.linearRampToValueAtTime(600, 0.1);
  osc.frequency.linearRampToValueAtTime(500, 0.2);
  gain.gain.setValueAtTime(0.2, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start(0);
  osc.stop(0.25);
}

function createStairsSound(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(500, 0);
  osc.frequency.exponentialRampToValueAtTime(150, 0.4);
  gain.gain.setValueAtTime(0.2, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.45);
  osc.connect(gain).connect(ctx.destination);
  osc.start(0);
  osc.stop(0.45);
}

function createLevelUpSound(ctx: OfflineAudioContext): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(400, 0);
  osc1.frequency.setValueAtTime(500, 0.1);
  osc1.frequency.setValueAtTime(600, 0.2);
  osc1.frequency.setValueAtTime(800, 0.3);
  osc2.frequency.setValueAtTime(600, 0);
  osc2.frequency.setValueAtTime(750, 0.1);
  osc2.frequency.setValueAtTime(900, 0.2);
  osc2.frequency.setValueAtTime(1200, 0.3);
  gain.gain.setValueAtTime(0.15, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.45);
  osc1.connect(gain).connect(ctx.destination);
  osc2.connect(gain);
  osc1.start(0);
  osc2.start(0);
  osc1.stop(0.45);
  osc2.stop(0.45);
}

function createStepSound(ctx: OfflineAudioContext): void {
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.1;
  }
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.05);
  noise.connect(gain).connect(ctx.destination);
  noise.start(0);
}

function createCritSound(ctx: OfflineAudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, 0);
  osc.frequency.exponentialRampToValueAtTime(200, 0.05);
  osc.frequency.setValueAtTime(500, 0.05);
  osc.frequency.exponentialRampToValueAtTime(100, 0.2);
  gain.gain.setValueAtTime(0.3, 0);
  gain.gain.exponentialRampToValueAtTime(0.01, 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start(0);
  osc.stop(0.25);
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const data = buffer.getChannelData(0);
  const dataLength = data.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Audio data
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
