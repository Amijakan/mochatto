import React, { useState, useEffect } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { Device, listInputDevices, selectInputDevice } from "./DeviceSelectorHelper";

function DeviceSelector({ onSelect }): JSX.Element {
	// eslint-disable-line
	const [inputOptions, setInputOptions] = useState([{}]);
	const [selectedInput, setSelectedInput] = useState(Device());

	useEffect(() => {
		setInputOptions(listInputDevices());
	}, []);

	return (
		<>
			<Select
				value={selectedInput}
				options={inputOptions}
				onChange={(selection) => {
					selectInputDevice(selection.value, (stream) => {
						onSelect(stream);
					});
				}}
			/>
		</>
	);
}

DeviceSelector.propTypes = {
	onSelect: PropTypes.func,
};

export { Device, DeviceSelector };
