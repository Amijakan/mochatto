import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import { Device, DeviceSelector } from './DeviceSelector'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

function RoomPage() {
	const [prevMediaRecorder, setPrevMediaRecorder] = useState(
		new MediaRecorder(new MediaStream())
	)

	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		prevMediaRecorder.ondataavailable = null
		prevMediaRecorder.onstart = null
		prevMediaRecorder.onstop = null

		let mediaRecorder = new MediaRecorder(stream)
		setPrevMediaRecorder(mediaRecorder)

		let blobsQueue: Blob[] = []

		if (mediaRecorder.state === 'inactive') {
			if (mediaRecorder.stream.active) {
				// start recording if it's not already and the stream is active
				mediaRecorder.start()
			}
		}

		let chunk = [new Blob()]

		mediaRecorder.ondataavailable = (e) => {
			// push new audio data into the chunks as they become available
			chunk.push(e.data)
		}

		mediaRecorder.onstart = (e) => {
			const audio = document.querySelector('audio')
			//every second: stop recording and play the next audio chunk in queue
			setTimeout(() => {
				if (mediaRecorder.state === 'recording') {
					// stop recording if it is
					mediaRecorder.stop()
				}
				// queue a blob and play it
				let blob = blobsQueue.shift()
				if (audio && blob) {
					if (blob.size) {
						audio.src = window.URL.createObjectURL(blob)
					}
				}
			}, 500)
		}

		// when recorder stops
		mediaRecorder.onstop = (e) => {
			// create a blob from the chunk
			var blobToSend = new Blob(chunk, {
				type: 'audio/ogg; codecs=opus',
			})

			// reset the chunk after using it
			chunk = [new Blob()]

			if (blobToSend.size) {
				// emit the audio chunk
				socket.emit('SEND_USER_AUDIO', blobToSend)
				//restart the recorder if the stream is active
				if (mediaRecorder.stream.active) {
					mediaRecorder.start()
				}
			}
		}

		socket.off('BROADCAST_AUDIO')
		// listen for broadcast
		socket.on('BROADCAST_AUDIO', (broadcast) => {
			let blob = new Blob([broadcast], {
				type: 'audio/ogg; codecs=opus',
			})
			blobsQueue.push(blob)
		})
	}

	return (
		<>
			<div>Room page</div>
			<audio autoPlay></audio>
			<div>Input selector</div>
			<DeviceSelector onSelect={onSelect} />
		</>
	)
}

export default RoomPage
