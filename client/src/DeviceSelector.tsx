import React, { useState, useEffect } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { Device, listInputDevices, selectInputDevice } from "./DeviceSelectorHelper";

function DeviceSelector({ onSelect }: { onSelect: (MediaStream) => void }): JSX.Element {
	const [inputOptions, setInputOptions] = useState([{}]);
	const [selectedInput, setSelectedInput] = useState(Device());

	useEffect(() => {
		//triggers microphone permission
		selectInputDevice(selectedInput.value, (stream) => {
			//list options when permission is allowed
			setInputOptions(listInputDevices());
		});
	}, []);
	//when new option is selected
	useEffect(() => {
		selectInputDevice(selectedInput.value, (stream) => {
			onSelect(stream);
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
	onSelect: PropTypes.func,
};

export { Device, DeviceSelector };
