import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DeviceSelector } from './DeviceSelector'

function JoinPage() {
	const audio = document.querySelector('audio')
	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		if (audio) {
			//set the audio src to the stream
			;(audio as HTMLAudioElement).srcObject = stream
		}
	}

	return (
		<>
			<audio autoPlay></audio>
			<DeviceSelector onSelect={onSelect} />
			<Link to="/RoomPage">Join</Link>
		</>
	)
}

export default JoinPage
