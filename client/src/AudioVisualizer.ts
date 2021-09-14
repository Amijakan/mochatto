class AudioVisualizer {
  intervalId: number;
  onAudioActivity: (gain: number) => void;
  constructor(_onAudioActivity) {
    this.intervalId = 0;
    this.onAudioActivity = _onAudioActivity;
  }

  setStream(stream) {
    if (stream) {
      if (stream.active) {
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
          array.forEach((e, i) => {
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
  }
}

export default AudioVisualizer;
