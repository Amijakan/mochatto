export const Device = () => {
	const value = "";
	const label = "";
	return { value, label };
};

export const listInputDevices = (): {}[] => {
	// eslint-disable-line
	const inputs = [{}];
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

export const selectInputDevice = (id: string): MediaStream => {
	let returnStream = null as unknown as MediaStream;
	navigator.mediaDevices
		.getUserMedia({
			audio: { deviceId: id },
			video: false,
		})
		.then((stream) => {
			returnStream = stream;
		});
	return returnStream;
};
