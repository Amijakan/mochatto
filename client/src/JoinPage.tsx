import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { DeviceSelector } from './DeviceSelector'
import socketIOClient from 'socket.io-client'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

function JoinPage() {
	const [name, setName] = useState('')

	const onJoin = () => {
		// notify server on join
		socket.emit('NEW_USER', name)
	}

	return (
		<>
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
