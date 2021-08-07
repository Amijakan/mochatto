export const Device = () => {
	const value = "";
	const label = "";
	return { value, label };
};

export const listInputDevices = () => {
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

export const selectInputDevice = (id: string) => {
	navigator.mediaDevices
		.getUserMedia({
			audio: { deviceId: id },
			video: false,
		})
		.then((stream) => {
			return stream;
		});
};
