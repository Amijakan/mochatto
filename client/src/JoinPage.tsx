import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DeviceSelector } from './DeviceSelector'

function JoinPage() {
	const [stream, setStream] = useState(new MediaStream())

	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		setStream(stream)
		const audio = new Audio()
		//set the audio src to the stream
		audio.srcObject = stream
		if (selectedInput != '') {
			audio.play()
		}
	}

	return (
		<>
			<DeviceSelector onSelect={onSelect} />
			<Link to="/RoomPage">Join</Link>
		</>
	)
}

export default JoinPage
