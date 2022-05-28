export class AudioVisualizer {
  onAudioActivity: (gain: number) => void;
  constructor(_onAudioActivity: (gain: number) => void) {
    this.onAudioActivity = _onAudioActivity;
  }

  setStream(stream: MediaStream): void {
    if (stream) {
      if (stream.active) {
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 256;

        // chain mic -> analyser -> processor -> context
        source.connect(analyser); // feed mic audio into analyser

        this.onAudioActivity(0);
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
          window.requestAnimationFrame(draw);
        };
        draw();
      }
    }
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
