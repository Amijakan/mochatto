export class AudioVisualizer {
  intervalId: number;
  onAudioActivity: (gain: number) => void;
  constructor(_onAudioActivity: (gain: number) => void) {
    this.intervalId = 0;
    this.onAudioActivity = _onAudioActivity;
  }

  stop(): void {
    window.clearInterval(this.intervalId);
  }

  setStream(stream: MediaStream): void {
    if (
      !stream ||
      !stream.active ||
      !stream.getAudioTracks().length ||
      stream.getAudioTracks()[0].readyState != "live"
    ) {
      return;
    }
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    // chain mic -> analyser -> processor -> context
    source.connect(analyser); // feed mic audio into analyser

    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.onAudioActivity(0);
    }
    const draw = () => {
      const array = new Uint8Array(analyser.fftSize);
      analyser.getByteFrequencyData(array);

      let sum = 0;
      array.forEach((e) => {
        sum += e * 4;
      });
      const average = sum / array.length;
      if (average != 0) {
        this.onAudioActivity(average);
      }
    };
    this.intervalId = window.setInterval(draw, 50);
  }
}
export const gainToMultiplier = (gain: number): number => {
  const max = 150;
  let _multiplier = 0;
  if (gain < max) {
    _multiplier = gain / max;
  } else {
    _multiplier = 1;
  }
  return _multiplier;
};
