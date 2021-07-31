import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import { Device, DeviceSelector } from './DeviceSelector'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

function RoomPage() {
	const [inputOptions, setInputOptions] = useState([{}])
	const [selectedInput, setSelectedInput] = useState(Device())
	const [stream, setStream] = useState(new MediaStream())

	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		setSelectedInput(selectedInput)
		setInputOptions(inputOptions)
		setStream(stream)
	}

	useEffect(() => {
		console.log(stream)
		socket.emit('SEND_USER_AUDIO', JSON.stringify(stream))
		const audio = document.querySelector('audio')
		socket.on('BROADCAST_AUDIO', (broadcast) => {
			if (audio) {
				;(audio as HTMLAudioElement).srcObject = JSON.parse(broadcast)
			}
		})
	}, [stream])

	return (
		<>
			<div>Room page</div>
			<div>Broadcasted audio</div>
			<audio controls autoPlay></audio>
			<div>Input selector</div>
			<DeviceSelector onSelect={onSelect} />
		</>
	)
}

export default RoomPage
