import React, { useState } from 'react'
import socketIOClient from 'socket.io-client'
import { DeviceSelector } from './DeviceSelector'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

function RoomPage() {
	const [listenOnce, setListenOnce] = useState(false)
	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		let mediaRecorder = new MediaRecorder(stream)
		let blobsQueue: Blob[] = []

		if (mediaRecorder.state === 'inactive') {
			if (mediaRecorder.stream.active) {
				// start recording if it's not already and the stream is active
				mediaRecorder.start()
			}
		}

		let chunk = [new Blob()]

		if (!listenOnce) {
			setListenOnce(true)
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
				}, 2000)
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
					console.log('emit')
					// emit the audio chunk
					socket.emit('SEND_USER_AUDIO', blobToSend)
					//restart the recorder if the stream is active
					if (mediaRecorder.stream.active) {
						mediaRecorder.start()
					}
				}
			}

			// listen for broadcast
			socket.on('BROADCAST_AUDIO', (broadcast) => {
				let blob = new Blob([broadcast], {
					type: 'audio/ogg; codecs=opus',
				})
				blobsQueue.push(blob)
			})
		}
	}

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
