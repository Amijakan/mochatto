export class AudioVisualizer {
  onAudioActivity: (gain: number) => void;
  animationFrameId: number | undefined;
  constructor(_onAudioActivity: (gain: number) => void) {
    this.onAudioActivity = _onAudioActivity;
    this.animationFrameId = undefined;
  }

  setStream(stream: MediaStream): void {
    // Check to see whether there's an active audio track.
    if (
      !stream ||
      !stream.active ||
      !stream.getAudioTracks().length ||
      stream.getAudioTracks()[0].readyState != "live"
    ) {
      return;
    }

    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
    }

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 256;

    // chain mic -> analyser -> processor -> context
    // Feed mic. audio into the analyser.
    source.connect(analyser);

    this.onAudioActivity(0);
    this.animationFrameId = window.requestAnimationFrame(this.draw(analyser, 0));
  }

  draw = (analyser: AnalyserNode, prevAverage: number) => (_step: number) => {
    const array = new Uint8Array(analyser.fftSize);
    analyser.getByteFrequencyData(array);

    const sum = array.reduce((current, next) => current + next * 4);
    const average = sum / array.length;
    if (isSignificantlyDifferent(prevAverage, average, 7)) {
      this.onAudioActivity(average);
      // Update previous average once current average meets threshold
      prevAverage = average;
    }

    this.animationFrameId = window.requestAnimationFrame(this.draw(analyser, 0));
  };
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
  return Math.min(gain / max, 1);
};
