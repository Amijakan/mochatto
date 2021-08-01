import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import { Device, DeviceSelector } from './DeviceSelector'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

function RoomPage() {
	const [stream, setStream] = useState(new MediaStream())

	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		console.log('1. input is selected')
		console.log(stream)
		console.log(selectedInput)
		let mediaRecorder = new MediaRecorder(stream)
		let blobsQueue: Blob[] = []

		if (mediaRecorder.state === 'inactive') {
			if (mediaRecorder.stream.active) {
				console.log('2. recorder starts')
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
			console.log('3. onstart is called')
			const audio = document.querySelector('audio')
			//every second: stop recording and play the next audio chunk in queue
			setTimeout(() => {
				if (mediaRecorder.state === 'recording') {
					console.log('4. stop is called after timer')
					// stop recording if it is
					mediaRecorder.stop()
				}
				// queue a blob and play it
				console.log('5. blob is queued')
				console.log(blobsQueue.length)
				let blob = blobsQueue.shift()
				console.log(blobsQueue.length)
				if (audio && blob) {
					if (blob.size) {
						console.log(
							'6. audio source is updated with the new blob'
						)
						audio.src = window.URL.createObjectURL(blob)
					}
				}
			}, 500)
		}

		// when recorder stops
		mediaRecorder.onstop = (e) => {
			console.log('7. onstop is called')
			// create a blob from the chunk
			var blobToSend = new Blob(chunk, {
				type: 'audio/ogg; codecs=opus',
			})

			// reset the chunk after using it
			chunk = [new Blob()]

			if (blobToSend.size) {
				console.log('8. blob is emitted')
				// emit the audio chunk
				socket.emit('SEND_USER_AUDIO', blobToSend)
				//restart the recorder if the stream is active
				if (mediaRecorder.stream.active) {
					console.log(
						'9. recorder is started again and goes back to 4.'
					)
					mediaRecorder.start()
				}
			}
		}

		// listen for broadcast
		socket.on('BROADCAST_AUDIO', (broadcast) => {
			console.log(broadcast)
			let blob = new Blob([broadcast], {
				type: 'audio/ogg; codecs=opus',
			})
			console.log('async. new blob is pushed to queue')
			blobsQueue.push(blob)
			console.log(blobsQueue)
			console.log(blobsQueue.length)
		})
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
