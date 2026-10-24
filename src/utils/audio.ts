// Web Audio API Synthesizer for high-fidelity interactive game sound effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = localStorage.getItem('geoSoundMuted') === 'true';

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('geoSoundMuted', String(muted));
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  playCorrect() {
    try {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pleasant bright ascending dual-tone chime
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.12); // E5

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  playWrong() {
    try {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Flat descending low pitch buzz
      osc.frequency.setValueAtTime(220.00, this.ctx.currentTime); // A3
      osc.frequency.setValueAtTime(146.83, this.ctx.currentTime + 0.1); // D3

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  playComplete() {
    try {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Rising arpeggio for quiz completion
      osc.frequency.setValueAtTime(329.63, this.ctx.currentTime); // E4
      osc.frequency.setValueAtTime(392.00, this.ctx.currentTime + 0.08); // G4
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime + 0.16); // C5

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.55);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }
}

export const sound = new SoundEngine();
export default sound;
