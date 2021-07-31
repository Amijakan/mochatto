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
		let mediaRecorder = new MediaRecorder(stream)
		if (stream.active) {
			let chunks
			mediaRecorder.onstart = function (e) {
				chunks = []
			}
			mediaRecorder.ondataavailable = function (e) {
				chunks.push(e.data)
			}
			mediaRecorder.start()
			mediaRecorder.onstop = function (e) {
				var blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' })
				socket.emit('SEND_USER_AUDIO', blob)
				// Start recording again
				mediaRecorder.start()
			}
		}

		//stop recording every second
		setInterval(function () {
			console.log(mediaRecorder.state)
			if (mediaRecorder.state == 'recording') {
				mediaRecorder.stop()
			}
		}, 1000)
		const audio = document.querySelector('audio')
		socket.on('BROADCAST_AUDIO', (broadcast) => {
			if (audio) {
				//;(audio as HTMLAudioElement).srcObject = broadcast
				var blob = new Blob([broadcast], {
					type: 'audio/ogg; codecs=opus',
				})
				audio.src = window.URL.createObjectURL(blob)
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
