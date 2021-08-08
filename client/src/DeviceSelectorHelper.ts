export const Device = (): { value: string; label: string } => {
	const value = "";
	const label = "";
	return { value, label };
};

export const listInputDevices = (): { value: string; label: string }[] => {
	const inputs: { value: string; label: string }[] = [];
	navigator.mediaDevices.enumerateDevices().then((devices) => {
		devices.map((device) => {
			const input = Device();
			input.value = device.deviceId;
			input.label = device.label;
			inputs.push(input);
			return null;
		});
	});
	return inputs;
};

export const selectInputDevice = (id: string, useStream: (MediaStream) => void): void => {
	navigator.mediaDevices
		.getUserMedia({
			audio: { deviceId: id },
			video: false,
		})
		.then((stream) => {
			useStream(stream);
		});
};
