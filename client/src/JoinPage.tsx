import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DeviceSelector } from './DeviceSelector'

function JoinPage() {
	const [stream, setStream] = useState(new MediaStream())

	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		setStream(stream)
	}

	const audio = document.querySelector('audio')
	//if the stream changes
	useEffect(() => {
		if (audio) {
			//set the audio src to the stream
			;(audio as HTMLAudioElement).srcObject = stream
		}
	}, [stream, audio])

	return (
		<>
			<audio autoPlay></audio>
			<DeviceSelector onSelect={onSelect} />
			<Link to="/RoomPage">Join</Link>
		</>
	)
}

export default JoinPage
