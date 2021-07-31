import React, { useState, useEffect, useContext } from 'react'
import Select from 'react-select'
import { Link } from 'react-router-dom'
import { Device, DeviceSelector } from './DeviceSelector'

function JoinPage() {
	const [inputOptions, setInputOptions] = useState([{}])
	const [selectedInput, setSelectedInput] = useState(Device())
	const [stream, setStream] = useState(new MediaStream())

	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		setSelectedInput(selectedInput)
		setInputOptions(inputOptions)
		setStream(stream)
	}

	const audio = document.querySelector('audio')
	useEffect(() => {
		if (audio) {
			;(audio as HTMLAudioElement).srcObject = stream
		}
	}, [stream])

	return (
		<>
			<audio controls autoPlay></audio>
			<DeviceSelector onSelect={onSelect} />
			<Link to="/RoomPage">Join</Link>
		</>
	)
}

export default JoinPage
