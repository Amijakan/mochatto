import React, { useState, useEffect } from "react";
import Select from "react-select";
import PropTypes from "prop-types";

const Device = () => {
	const value = "";
	const label = "";
	return { value, label };
};

function DeviceSelector(props) {
	const [inputOptions, setInputOptions] = useState([{}]);
	const [selectedInput, setSelectedInput] = useState(Device());

	//when new input is selected
	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({
				audio: { deviceId: selectedInput.value },
				video: false,
			})
			.then((stream) => {
				//if microphone permission is allowed
				//enumerate through media devices
				navigator.mediaDevices.enumerateDevices().then((devices) => {
					const inputs = [{}];
					devices.map((device) => {
						const input = Device();
						input.value = device.deviceId;
						input.label = device.label;
						inputs.push(input);
						return null;
					});
					setInputOptions(inputs);
				});
				props.onSelect({ selectedInput, inputOptions, stream });
			});
	}, [selectedInput]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<>
			<Select
				value={selectedInput}
				options={inputOptions}
				onChange={(selection) => {
					setSelectedInput(selection);
				}}
			/>
		</>
	);
}

DeviceSelector.propTypes = {
	onSelect: Function,
};

export { Device, DeviceSelector };
