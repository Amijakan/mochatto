import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DeviceSelector } from './DeviceSelector'
import socketIOClient from 'socket.io-client'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

function JoinPage() {
	const [audio, setAudio] = useState(document.querySelector('audio'))
	const [name, setName] = useState('')

	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		if (audio) {
			//set the audio src to the stream
			;(audio as HTMLAudioElement).srcObject = stream
		}
	}

	useEffect(() => {
		setAudio(document.querySelector('audio'))
	}, [])

	const onJoin = () => {
		setAudio(null)
		socket.emit('NEW_USER', name)
	}

	return (
		<>
			<audio autoPlay></audio>
			Select your input device:
			<DeviceSelector onSelect={onSelect} />
			<div>
				<label>
					Name:
					<input
						type="text"
						name="name"
						onChange={(e) => {
							setName(e.target.value)
						}}
					/>
				</label>
			</div>
			<div>
				<Link to="/RoomPage" onClick={onJoin}>
					Join
				</Link>
			</div>
		</>
	)
}

export default JoinPage
