import React, { useState, useEffect } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { Device, listInputDevices, selectInputDevice } from "./DeviceSelectorHelper";

function DeviceSelector({ onSelect }) {
	const [inputOptions, setInputOptions] = useState([{}]);
	const [selectedInput, setSelectedInput] = useState(Device());

	useEffect(() => {
		setInputOptions(listInputDevices());
	}, []);

	//when new option is selected
	useEffect(() => {
		onSelect(selectInputDevice(selectedInput.value));
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
