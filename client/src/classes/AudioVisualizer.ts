const audioThreshold = 75;
const audibleFramerate = 2; // Lower framerate when sound is already audible.
const inAudibleFramerate = 15; // Increase the framerate when inaudible to make visualizer more responsive.

export class AudioVisualizer {
  onAudioActivity: (isAudible: boolean) => void;
  animationFrameId: number | undefined;
  constructor(_onAudioActivity: (isAudible: boolean) => void) {
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

    this.animationFrameId = window.requestAnimationFrame(this.draw(analyser, true));
  }

  draw(analyser: AnalyserNode, prevIsAudible: boolean): RequestAnimationFrameCallback {
    return (_step: number) => {
      const array = new Uint8Array(analyser.fftSize);
      analyser.getByteFrequencyData(array);

      const sum = array.reduce((current, next) => current + next * 4);
      const average = sum / array.length;

      let isAudible = prevIsAudible;
      let isAudibleDirty = false;

      if (average > audioThreshold && !prevIsAudible) {
        isAudible = true;
        isAudibleDirty = true;
      } else if (average <= audioThreshold && prevIsAudible) {
        isAudible = false;
        isAudibleDirty = true;
      }

      if (isAudibleDirty) {
        this.onAudioActivity(isAudible);
      }

      const framerate = isAudible ? audibleFramerate : inAudibleFramerate;

      setTimeout(() => {
        this.animationFrameId = window.requestAnimationFrame(this.draw(analyser, isAudible));
      }, 1000 / framerate);
    };
  }
}

type RequestAnimationFrameCallback = (step: number) => void;
