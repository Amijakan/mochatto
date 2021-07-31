import React, { useState, useEffect } from 'react'
import Select from 'react-select'

const Device = () => {
	const value = ''
	const label = ''
	return { value, label }
}

function DeviceSelector(props) {
	const [inputOptions, setInputOptions] = useState([{}])
	const [selectedInput, setSelectedInput] = useState(Device())

	//when new input is selected
	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({
				audio: { deviceId: selectedInput.value },
				video: false,
			})
			.then((stream) => {
				//enumerate through media devices
				navigator.mediaDevices.enumerateDevices().then((devices) => {
					var inputs = [{}]
					devices.map((device) => {
						var input = Device()
						input.value = device.deviceId
						input.label = device.label
						inputs.push(input)
					})
					setInputOptions(inputs)
				})
				props.onSelect({ selectedInput, inputOptions, stream })
			})
	}, [selectedInput])

	return (
		<>
			<Select
				value={selectedInput}
				options={inputOptions}
				onChange={(selection) => {
					setSelectedInput(selection)
				}}
			/>
		</>
	)
}

export { Device, DeviceSelector }
