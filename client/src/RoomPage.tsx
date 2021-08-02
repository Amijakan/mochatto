import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import { Device, DeviceSelector } from './DeviceSelector'

const ENDPOINT = 'http://localhost:4000'
const socket = socketIOClient(ENDPOINT)

const peerConnection = new RTCPeerConnection({
	iceServers: [{ urls: 'stun:global.stun.twilio.com:3478?transport=udp' }],
})

function RoomPage() {
	// when new input is selected
	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		stream.getTracks().forEach((track: MediaStreamTrack) => {
			peerConnection.addTrack(track)
		})

		// send an RTC offer to server to be broadcasted
		peerConnection
			.createOffer()
			.then((offer) => {
				return peerConnection.setLocalDescription(offer)
			})
			.then(() => {
				const data = JSON.stringify({
					sdp: peerConnection.localDescription,
					id: socket.id,
				})
				socket.emit('OFFER_OUT', data)
			})
			.catch((e) => {
				console.warn(e)
			})

		stream.getTracks().forEach((track: MediaStreamTrack) => {})
	}

	// answer when offer is received
	socket.on('OFFER_IN', (data) => {
		const sdp = JSON.parse(data).sdp
		peerConnection
			.setRemoteDescription(new RTCSessionDescription(sdp))
			.then(() => {
				peerConnection
					.createAnswer()
					.then((answer) => {
						return peerConnection.setLocalDescription(answer)
					})
					.then(() => {
						const data = JSON.stringify({
							sdp: peerConnection.localDescription,
							id: socket.id,
						})
						socket.emit('ANSWER_OUT', data)
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
	socket.on('ANSWER_IN', (data) => {
		const sdp = JSON.parse(data).id
		peerConnection.setRemoteDescription(sdp)
	})

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
