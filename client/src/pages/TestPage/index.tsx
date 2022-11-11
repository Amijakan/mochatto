import React, { useState, useContext, useEffect, useRef } from 'react'
import { Socket } from "socket.io-client";
import { fromEvent, Observer } from 'rxjs'
import { SocketContext, DeviceContext } from "@/contexts";
import { SIOChannel } from "@/contexts/SocketIOContext";
import { BaseTemplate } from "@/templates";
import { DCLabel } from '@/classes/Network'
import { Draggable, DeviceSelector } from '@/components'
import { EventEmitter } from 'events'

interface RoomState {
  name: string,
  numUsers: number,
  hasPass: boolean,
  joined: boolean,
}

interface User {
  id: string, // socketID
  name: string,
}

enum WebRTCEvents {
  icecandidate = 'icecandidate',
  track = 'track',
  negotiationneeded = 'negotiationneeded',
  removetrack = 'removetrack',
  iceconnectionstatechange = 'iceconnectionstatechange',
  icegatheringstatechange = 'icegatheringstatechange',
  signalingstatechange = 'signalingstatechange',
}

enum PeerEvents {
  position = 'position',
  audio = 'audio',
  video = 'video',
  screenshare = 'screenshare'
}

enum ChannelEvents {
  open = 'open',
  message = 'message',
  close = 'close'
}

interface Position {
  x: number,
  y: number
}

const webRTCConfig = { iceServers: [{ urls: 'stun:mochatto.com:3478' }] }

const TestPage = (): JSX.Element => {
  const [localEventEmitter, _setLocalEventEmitter] = useState(new EventEmitter())

  const { stream, setStream } = useContext(DeviceContext)
  const { socket } = useContext(SocketContext);
  const [selfPosition, _setSelfPosition] = useState<Position>({ x: 100, y: 100 })
  const setSelfPosition = (newPos: Position) => {
    _setSelfPosition(newPos)
    localEventEmitter.emit(PeerEvents.position, newPos)
  }

  const [roomState, setRoomState] = useState<RoomState>({
    name: "test",
    numUsers: 0,
    hasPass: false,
    joined: false,
  })
  const updateRoomState = (newValue: Partial<RoomState>) => {
    setRoomState({ ...roomState, ...newValue })
  }

  const peers: { [key: string]: any } = {}

  const configurePeerConnection = (peerConnection: RTCPeerConnection, channel: RTCDataChannel, socket: Socket, peerId: string) => {
    // {{{ configurePeerConnection
    const keys = [
      SIOChannel.SDP_RECEIVED,
      SIOChannel.ICE_CANDIDATE,
      SIOChannel.ANSWER,
      SIOChannel.LEAVE,
      WebRTCEvents.icecandidate,
      WebRTCEvents.track,
      // WebRTCEvents.negotiationneeded,
      // WebRTCEvents.removetrack,
      // WebRTCEvents.iceconnectionstatechange,
      // WebRTCEvents.icegatheringstatechange,
      WebRTCEvents.signalingstatechange,
      PeerEvents.audio,
      ChannelEvents.open,
      ChannelEvents.message
    ]

    // Define Observables
    let observables = {}
    for (let key of keys) {
      if (key in SIOChannel) {
        observables[key] = fromEvent(socket, key)
      }
      else if (key in WebRTCEvents) {
        observables[key] = fromEvent(peerConnection, key)
      }
      else if (key in PeerEvents) {
        observables[key] = fromEvent(localEventEmitter, key)
      }
      else if (key in ChannelEvents) {
        observables[key] = fromEvent(channel, key)
      }
    }

    // Define Observers
    const observers = {
      // [SIOChannel.SDP_RECEIVED]: { next: () => console.log("SDP RECEIVED RX") },
      [SIOChannel.ICE_CANDIDATE]: iceCandidateObserverSocketIO(peerConnection),
      [SIOChannel.ANSWER]: answerObserver(peerConnection),
      [SIOChannel.LEAVE]: leaveObserver(),
      [WebRTCEvents.icecandidate]: iceCandidateObserver(peerId),
      [WebRTCEvents.track]: trackObserver(peerId),
      [WebRTCEvents.signalingstatechange]: signalingStateChangeObserver(peerConnection),
      [PeerEvents.audio]: peerAudioObserver(peerConnection),
      [PeerEvents.video]: peerVideoObserver(peerConnection),
      [ChannelEvents.open]: () => channel.send("HELLO"),
      [ChannelEvents.message]: (item: string) => console.log(item)
    }

    let subscriptions = {}

    // Start Subscriptions
    for (let key of keys) {
      subscriptions[key] = observables[key].subscribe(observers[key])
    }

    // Not sure what to do with subscriptions
  }
  // }}}
  //

  const createDataChannel = (peerConnection: RTCPeerConnection, channelName: string): RTCDataChannel => {
    return peerConnection.createDataChannel(channelName)
  }

  const createNewPeer = (peerId: string) => {
    const peerConnection = new RTCPeerConnection(webRTCConfig)
    const dataChannel = createDataChannel(peerConnection, DCLabel)
    dataChannel.onopen = () => console.log('open')
    dataChannel.onmessage = () => console.log('message')
    configurePeerConnection(peerConnection, dataChannel, socket, peerId)
    return {
      id: peerId,
      connection: peerConnection,
      iceCandidates: [],
      dataChannels: {
        default: dataChannel,
      }
    }
  }

  const handleError = (e: Error) => console.error(e)
  const handleAuthenticate = (socket: Socket) => (result: number) => {
    if (result === 200) {
      socket.emit(SIOChannel.JOIN, "username")
    }
  }

  const handleOnRoomInfo = (info: Partial<RoomState>) => {
    const { numUsers, hasPass } = info;
    const roomExists = !!numUsers;
    if (!roomExists) {
    } else if (hasPass) {
    } else {
    }
    updateRoomState(info)

  }
  const handleJoin = (socket: Socket) => async (user: User) => {
    if (socket.id != user.id) {
      const newPeer = createNewPeer(user.id)
      const peerConnection = newPeer.connection
      peers[user.id] = newPeer
      // Creates identity
      const offer = await peerConnection.createOffer()
      // Sets the identity to local
      await peerConnection.setLocalDescription(offer)
      // If the identity is set appropriately
      if (peerConnection.localDescription) {
        // Start sending offers to other peers via signaling server
        // Telling who the other side is / who I am
        const offerPack = {
          sdp: peerConnection.localDescription, // my address
          userId: socket.id, // my user id
          receiverId: user.id, // the other user's id
          kind: "offer",
        }
        socket.emit(SIOChannel.OFFER, JSON.stringify(offerPack))
      }
    }
  }

  const handleOffer = (socket: Socket) => async (dataString: string) => {
    const offerPack = JSON.parse(dataString);
    const peerId = offerPack.userId;
    let peer = peers[peerId]
    if (!peer) {
      peer = createNewPeer(peerId)
      peers[peerId] = peer
    }
    try {
      await peer.connection.setRemoteDescription(offerPack.sdp)
      // Let the other peer know that I have received the offer
      socket.emit(SIOChannel.SDP_RECEIVED, peerId)
      const answer = await peer.connection.createAnswer()
      await peer.connection.setLocalDescription(answer)
      const answerPack = {
        sdp: answer,
        userId: socket.id,
        receiverId: offerPack.userId,
        kind: 'answer'
      }
      socket.emit(SIOChannel.ANSWER, JSON.stringify(answerPack))
    }
    catch (e) {
      console.error(e)
    }
  }
  const handleJoinRoom = (e: React.FormEvent & { target: { password: { value: string } } }) => {
    e.preventDefault()
    const password = e.target.password.value
    socket.emit(SIOChannel.AUTHENTICATE, password)
  }

  const peerAudioObserver = (peerConnection: RTCPeerConnection): Observer<MediaStreamTrack> => ({
    next: (audioTrack: MediaStreamTrack) => {
      console.log('AUDIO');
      const resp = peerConnection.addTrack(audioTrack)
      console.log("ADDED TRRAKC", resp)
    },
    error: handleError,
    complete: () => console.log('completed audio observer')

  })

  const peerVideoObserver = (peerConnection: RTCPeerConnection) => (audioTrack: MediaStreamTrack) => {
    console.log('Video');
    peerConnection.addTrack(audioTrack)
  }

  // ------ Observers 

  const answerObserver = (peerConnection: RTCPeerConnection): Observer<string> => ({
    next: async (dataString: string) => {
      const answerPack = JSON.parse(dataString)
      const peerId = answerPack.userId
      await peerConnection.setRemoteDescription(answerPack.sdp)
      socket.emit(SIOChannel.SDP_RECEIVED, peerId)
    },
    error: handleError,
    complete: () => console.log("Completed, not sure what it means")
  })

  const leaveObserver = (): Observer<string> => ({
    next: async (id) => delete peers[id],
    error: handleError,
    complete: () => console.log("Completed, not sure what it means")
  })

  const iceCandidateObserverSocketIO = (peerConnection: RTCPeerConnection): Observer<string> => ({
    next: (dataString: string) => {
      const data = JSON.parse(dataString)
      if (peerConnection.signalingState != "closed") {
        // This will fire onicecandidate
        peerConnection.addIceCandidate(data.ice).catch((e) => console.warn(e))
      }
    },
    error: handleError,
    complete: () => console.log('Completed icecandiadate socketio')
  })

  const iceCandidateObserver = (peerId: string): Observer<RTCIceCandidate> => ({
    next: (candidate: RTCIceCandidate) => socket.emit(SIOChannel.ICE_CANDIDATE, JSON.stringify({ ice: candidate, receiverId: peerId })),
    error: handleError,
    complete: () => console.log("Completed, not sure what it means")
  })
  const signalingStateChangeObserver = (peerConnection: RTCPeerConnection) => (_event: Event) => {
    console.log(peerConnection.signalingState)
    if (peerConnection.signalingState === 'stable') updateRoomState({ joined: true })
  }

  const trackObserver = (peerId: string): Observer<MediaStreamTrack> => ({
    next: (track: MediaStreamTrack) => {
      console.log("REMOTE TRACK", track)
      const peer = peers[peerId]
      if (!track.readyState) {
        return
      }
      switch (track.kind) {
        case PeerEvents.audio:
          peer.datachannels[PeerEvents.audio]
          break
        case PeerEvents.video:
          break
      }
    },
    error: handleError,
    complete: () => console.log("Completed, not sure what it means")
  })

  const openNewChannel = (peerId: string, channelName: string) => {
    const peer = peers[peerId]
    let errorMessage = ""
    if (peer) {
      const peerConnection = peer.connection
      if (peerConnection) {
        if (!peer.dataChannels[channelName]) {
          const newDataChannel = createDataChannel(peerConnection, channelName)
          peer.dataChannels[channelName] = newDataChannel
          return newDataChannel
        } else {
          errorMessage = "Given Channel Name Already Exists"
        }
      } else {
        errorMessage = "Peer Connection does not exist"
      }
    } else {
      errorMessage = "There are no such peer"
    }
    console.error(errorMessage)

    return null
  }

  useEffect(() => {
    if (stream.getAudioTracks().length) {
      console.log(stream.getAudioTracks()[0])
      localEventEmitter.emit(PeerEvents.audio, stream.getAudioTracks()[0])
    }
    if (stream.getVideoTracks().length) {
      console.log(stream.getVideoTracks()[0])
      localEventEmitter.emit(PeerEvents.video, stream.getVideoTracks()[0])
    }
  }, [stream])

  // Information Listener Layer

  useEffect(() => {
    if (socket) {
      socket.emit(SIOChannel.ROOM_INFO);
      socket.on(SIOChannel.ROOM_INFO, handleOnRoomInfo);
      socket.on(SIOChannel.AUTHENTICATE, handleAuthenticate(socket))
      // When different user joins the room, the existing users send them offer to communicate with them
      socket.on(SIOChannel.JOIN, handleJoin(socket))
      socket.on(SIOChannel.OFFER, handleOffer(socket))
      socket.on(SIOChannel.CONNECT_ERROR, handleError)
      return () => socket.emit(SIOChannel.LEAVE)
    }
    return () => { }
  }, [socket])


  return (
    <BaseTemplate>
      <>
        <div>RoomName: {roomState.name}</div>
        <div>NumUsers: {roomState.numUsers}</div>
        <div>HasPass: {roomState.hasPass ? "True" : "False"}</div>
        <DeviceSelector onSelect={setStream} />
        {!roomState.joined && (
          <form onSubmit={handleJoinRoom}>
            <input name="password" style={{ padding: 8, border: '1px solid teal' }} />
            <button type="submit" style={{ backgroundColor: 'teal' }}>Join Room</button>
          </form>
        )}
        <Draggable position={selfPosition} onPositionChange={setSelfPosition} draggable={true}>
          <div style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: 'red' }} />
        </Draggable>
      </>
    </BaseTemplate>
  )
}

export default TestPage
