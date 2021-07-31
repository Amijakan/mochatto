import React, { useState, useEffect, useContext } from 'react'
import socketIOClient from 'socket.io-client'
import Select from 'react-select'
import { Link } from 'react-router-dom'
import DeviceSelector from './DeviceSelector'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

const Device = () => {
	const value = ''
	const label = ''
	return { value, label }
}

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
			socket.emit('SEND_USER_AUDIO', stream)
		}
	}, [selectedInput])

	return (
		<>
			<audio controls autoPlay></audio>
			<DeviceSelector onSelect={onSelect} />
			<Link to="/RoomPage">Join</Link>
		</>
	)
}

export default JoinPage
