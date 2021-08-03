import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import { DeviceSelector } from './DeviceSelector'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

const peerConnection = new RTCPeerConnection({
	iceServers: [{ urls: 'stun:iphone-stun.strato-iphone.de:3478' }],
})

function RoomPage() {
	const [oldSender, setOldSender] = useState<RTCRtpSender | undefined>(
		undefined
	)
	const [announcement, setAnnouncement] = useState('')

	// when new input is selected
	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		if (oldSender) {
			// if there was an old track, remove it
			peerConnection.removeTrack(oldSender)
		}
		// add the new track
		setOldSender(peerConnection.addTrack(stream.getAudioTracks()[0]))

		// emit an offer to the server to be broadcasted
		peerConnection
			.createOffer()
			.then((offer) => {
				return peerConnection.setLocalDescription(offer)
			})
			.then(() => {
				const data = {
					sdp: peerConnection.localDescription,
					id: socket.id,
					type: 'offer',
				}
				socket.emit('OFFER', JSON.stringify(data))
			})
			.catch((e) => {
				console.warn(e)
			})
	}

	useEffect(() => {
		const remoteStream = new MediaStream()
		const remotePlayer = document.querySelector('audio')

		// when a peer adds a track
		peerConnection.ontrack = (event) => {
			remoteStream.addTrack(event.track)
			if (remotePlayer) {
				// set the new stream as the audio source
				remotePlayer.srcObject = remoteStream
			}
		}

		// emit an answer when offer is received
		socket.on('OFFER', (dataString) => {
			const sdp = JSON.parse(dataString).sdp
			const target = JSON.parse(dataString).id
			peerConnection
				.setRemoteDescription(new RTCSessionDescription(sdp)) // establish connection with the sender
				.then(() => {
					peerConnection
						.createAnswer()
						.then((answer) => {
							return peerConnection.setLocalDescription(answer)
						})
						.then(() => {
							const data = {
								sdp: peerConnection.localDescription,
								id: socket.id,
								target: target,
								type: 'answer',
							}
							socket.emit('ANSWER', JSON.stringify(data))
						})
						.catch((e) => {
							console.warn(e)
						})
				})
				.catch((e) => {
					console.warn(e)
				})
		})

		// set remote description once answer is recieved to establish connection
		socket.on('ANSWER', (dataString) => {
			const sdp = JSON.parse(dataString).sdp
			peerConnection.setRemoteDescription(sdp)
		})

		socket.on('NEW_USER', (name) => {
			setAnnouncement(name + ' has joined.')
		})
	}, [])

	return (
		<>
			<div>Room page</div>
			<audio autoPlay></audio>
			<div>Input selector</div>
			<DeviceSelector onSelect={onSelect} />
			<div>{announcement}</div>
		</>
	)
}

export default RoomPage
