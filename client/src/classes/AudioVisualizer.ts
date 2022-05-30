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

        // Previous average to compare to current.
        let prevAverage = 0;
        this.onAudioActivity(0);
        const draw = () => {
          const array = new Uint8Array(analyser.fftSize);
          analyser.getByteFrequencyData(array);

          const sum = array.reduce((current, next) => current + next * 4);
          const average = sum / array.length;
          if (isSignificantlyDifferent(prevAverage, average, 7)) {
            this.onAudioActivity(average);
            // Update previous average once current average meets threshold
            prevAverage = average;
          }
          window.requestAnimationFrame(draw);
        };
        draw();
      }
    }
  }
}

export const isSignificantlyDifferent = (
  prev: number,
  curr: number,
  threshold: number
): boolean => {
  return Math.abs(prev - curr) > threshold;
};

export const gainToMultiplier = (gain: number): number => {
  const max = 250;
  return gain < max ? gain / max : 1;
};
