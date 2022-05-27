export const Device = (): { value: string; label: string } => {
  const value = "default";
  const label = "";
  return { value, label };
};

const defaultOnError = (e: EndOfStreamError): void => {
  console.warn(e);
  return;
};

// return a list of available input audio devices
export const listInputDevices = (
  onError: (MediaStreamError) => void = defaultOnError
): Promise<{ value: string; label: string }[]> => {
  const inputs: { value: string; label: string }[] = [];
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      devices.map((device) => {
        if (device.kind === "audioinput") {
          const input = Device();
          input.value = device.deviceId;
          input.label = device.label;
          inputs.push(input);
          return null;
        }
      });
      return inputs;
    })
    .catch((e) => {
      onError(e);
      return [Device()];
    });
};

// select a device as the input device
export const selectInputDevice = (
  id: string,
  useStream: (MediaStream) => void,
  options: { autoGainControl: boolean; echoCancellation: boolean; noiseSuppression: boolean },
  onError: (MediaStreamError) => void = defaultOnError
): void => {
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        deviceId: id,
        autoGainControl: options.autoGainControl,
        echoCancellation: options.echoCancellation,
        noiseSuppression: options.noiseSuppression,
      },
      video: false,
    })
    .then((stream) => {
      useStream(stream);
    })
    .catch((e) => {
      onError(e);
    });
};
