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

	// when new input is selected
	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		if (oldSender) {
			peerConnection.removeTrack(oldSender)
		}
		setOldSender(peerConnection.addTrack(stream.getAudioTracks()[0]))
		// send an RTC offer to server to be broadcasted
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
				console.log(data)
				socket.emit('OFFER_OUT', JSON.stringify(data))
			})
			.catch((e) => {
				console.warn(e)
			})
	}

	useEffect(() => {
		const remoteStream = new MediaStream()
		const remotePlayer = document.querySelector('audio')
		socket.on('connect', () => {
			console.log(socket.id)
		})

		peerConnection.ontrack = (event) => {
			console.log('remote track was added')
			remoteStream.addTrack(event.track)
			if (remotePlayer) {
				remotePlayer.srcObject = remoteStream
			}
		}

		// answer when offer is received
		socket.on('OFFER_IN', (dataString) => {
			console.log('offer in')
			const sdp = JSON.parse(dataString).sdp
			const target = JSON.parse(dataString).id
			peerConnection
				.setRemoteDescription(new RTCSessionDescription(sdp))
				.then(() => {
					peerConnection
						.createAnswer()
						.then((answer) => {
							console.log(answer)
							return peerConnection.setLocalDescription(answer)
						})
						.then(() => {
							const data = {
								sdp: peerConnection.localDescription,
								id: socket.id,
								target: target,
								type: 'answer',
							}
							console.log(data)
							socket.emit('ANSWER_OUT', JSON.stringify(data))
						})
						.catch((e) => {
							console.warn(e)
						})
				})
				.catch((e) => {
					console.warn(e)
				})
		})

		// set remote description once answer is recieved
		socket.on('ANSWER_IN', (dataString) => {
			console.log('answer in')
			const sdp = JSON.parse(dataString).sdp
			peerConnection.setRemoteDescription(sdp)
		})
	}, [])

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
