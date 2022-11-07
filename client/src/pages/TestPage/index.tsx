import React, { useState, useContext, useEffect } from 'react'
import { Socket } from "socket.io-client";
import { fromEvent, Observer } from 'rxjs'
import { SocketContext } from "@/contexts";
import { SIOChannel } from "@/contexts/SocketIOContext";
import { BaseTemplate } from "@/templates";
import { DCLabel } from '@/classes/Network'

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

const webRTCConfig = { iceServers: [{ urls: 'stun:mochatto.com:3478' }] }

// emits values

const TestPage = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
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


  const configurePeerConnectionRx = (peerConnection: RTCPeerConnection, socket: Socket, peerId: string) => {
    // {{{ configurePeerConnection
    const keys = [
      SIOChannel.SDP_RECEIVED,
      SIOChannel.ICE_CANDIDATE,
      SIOChannel.ANSWER,
      SIOChannel.LEAVE,
      WebRTCEvents.icecandidate,
      // WebRTCEvents.track,
      // WebRTCEvents.negotiationneeded,
      // WebRTCEvents.removetrack,
      // WebRTCEvents.iceconnectionstatechange,
      // WebRTCEvents.icegatheringstatechange,
      WebRTCEvents.signalingstatechange,
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
    }

    // Define Observers
    const observers = {
      // [SIOChannel.SDP_RECEIVED]: { next: () => console.log("SDP RECEIVED RX") },
      [SIOChannel.ICE_CANDIDATE]: iceCandidateObserverSocketIO(peerConnection),
      [SIOChannel.ANSWER]: answerObserver(peerConnection),
      [SIOChannel.LEAVE]: leaveObserver(),
      [WebRTCEvents.icecandidate]: iceCandidateObserver(peerId),
      [WebRTCEvents.signalingstatechange]: signalingStateChangeObserver(peerConnection)
    }

    let subscriptions = {}

    // Start Subscriptions
    for (let key of keys) {
      subscriptions[key] = observables[key].subscribe(observers[key])
    }
  }
  // }}}

  const createDataChannel = (peerConnection: RTCPeerConnection, channelName: string): RTCDataChannel => {
    return peerConnection.createDataChannel(channelName)
  }

  const createNewPeer = (peerId: string) => {
    const peerConnection = new RTCPeerConnection(webRTCConfig)
    configurePeerConnectionRx(peerConnection, socket, peerId)
    const defaultDataChannel = createDataChannel(peerConnection, DCLabel)
    return {
      id: peerId,
      connection: peerConnection,
      iceCandidates: [],
      dataChannels: {
        default: defaultDataChannel
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
    console.log(numUsers, hasPass)
    const roomExists = !!numUsers;
    if (!roomExists) {
      console.log("room doesnt exist")
    } else if (hasPass) {
      console.log("Has password")
    } else {
      console.log("Room exists and no password")
    }
    updateRoomState(info)

  }
  const handleJoin = (socket: Socket) => async (user: User) => {
    console.log("RECEIVED JOIN")
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
        console.log('has Local Description')
        // Start sending offers to other peers via signaling server
        // Telling who the other side is / who I am
        const offerPack = {
          sdp: peerConnection.localDescription, // my address
          userId: socket.id, // my user id
          receiverId: user.id, // the other user's id
          kind: "offer",
        }
        socket.emit(SIOChannel.OFFER, JSON.stringify(offerPack))
        console.log("EMITTED OFFER")
      }
    }
    else {
      console.log("My own id")
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
      console.log("EMITTED ANSWER")
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

  // ------ Observers 

  const answerObserver = (peerConnection: RTCPeerConnection): Observer<string> => ({
    next: async (dataString: string) => {
      console.log("RECEIVED ANSWER")
      const answerPack = JSON.parse(dataString)
      const peerId = answerPack.userId
      await peerConnection.setRemoteDescription(answerPack.sdp)
      socket.emit(SIOChannel.SDP_RECEIVED, peerId)
    },
    error: handleError,
    complete: () => console.log("Completed, not sure what it means")
  })

  const leaveObserver = (): Observer<string> => ({
    next: async (id) => {
      console.log("RECEIVED LEAVE")
      console.log(id)
      delete peers[id]
    },
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
    next: (candidate: RTCIceCandidate) => {
      console.log("observed ice candidate");
      socket.emit(SIOChannel.ICE_CANDIDATE, JSON.stringify({ ice: candidate, receiverId: peerId })
      )
    },
    error: handleError,
    complete: () => console.log("Completed, not sure what it means")
  })
  const signalingStateChangeObserver = (peerConnection: RTCPeerConnection) => (_event: Event) => {
    console.log(peerConnection.signalingState)
    if (peerConnection.signalingState === 'stable') updateRoomState({ joined: true })
  }

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
        {!roomState.joined && (
          <form onSubmit={handleJoinRoom}>
            <input name="password" style={{ padding: 8, border: '1px solid teal' }} />
            <button type="submit" style={{ backgroundColor: 'teal' }}>Join Room</button>
          </form>
        )}
      </>
    </BaseTemplate>
  )
}

export default TestPage
