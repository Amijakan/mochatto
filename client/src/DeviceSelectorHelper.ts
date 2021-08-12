export const Device = (): { value: string; label: string } => {
	const value = "";
	const label = "";
	return { value, label };
};

const defaultOnError = (e: MediaStreamError): void => {
	console.warn(e);
	return;
};

export const listInputDevices = (
	onError: (MediaStreamError) => void = defaultOnError
): { value: string; label: string }[] => {
	const inputs: { value: string; label: string }[] = [];
	navigator.mediaDevices
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
		})
		.catch((e) => {
			onError(e);
		});
	return inputs;
};

export const selectInputDevice = (
	id: string,
	useStream: (MediaStream) => void,
	onError: (MediaStreamError) => void = defaultOnError
): void => {
	navigator.mediaDevices
		.getUserMedia({
			audio: { deviceId: id },
			video: false,
		})
		.then((stream) => {
			useStream(stream);
		})
		.catch((e) => {
			onError(e);
		});
};
