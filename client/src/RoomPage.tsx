import React, { useState, useEffect, useContext } from "react";
import socketIOClient from "socket.io-client";
import { DeviceSelector } from "./DeviceSelector";

const JoinPage = ({ socket, peerConnection, name, setName, setJoined }) => {
  const onJoin = () => {
    if (socket) {
      // notify server on join
      socket.emit("NEW_USER", name);
    }
  };

  return (
    <>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </label>
      </div>
      <div>
        <button onClick={onJoin}>Join</button>
      </div>
    </>
  );
};

function RoomPage({ socket, peerConnection }) {
  const [oldSender, setOldSender] = useState<RTCRtpSender | undefined>(undefined);
  const [announcement, setAnnouncement] = useState("");

  // when new input is selected
  const onSelect = ({ selectedInput, inputOptions, stream }) => {
    if (oldSender) {
      // if there was an old track, remove it
      peerConnection.removeTrack(oldSender);
    }
    // add the new track
    setOldSender(peerConnection.addTrack(stream.getAudioTracks()[0]));

    // emit an offer to the server to be broadcasted
    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        const data = {
          sdp: peerConnection.localDescription,
          id: socket.id,
          type: "offer",
        };
        socket.emit("OFFER", JSON.stringify(data));
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  useEffect(() => {
    const remoteStream = new MediaStream();
    const remotePlayer = document.querySelector("audio");

    // when a peer adds a track
    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      if (remotePlayer) {
        // set the new stream as the audio source
        remotePlayer.srcObject = remoteStream;
      }
    };

    // emit an answer when offer is received
    socket.on("OFFER", (dataString) => {
      const sdp = JSON.parse(dataString).sdp;
      const target = JSON.parse(dataString).id;
      peerConnection
        .setRemoteDescription(new RTCSessionDescription(sdp)) // establish connection with the sender
        .then(() => {
          peerConnection
            .createAnswer()
            .then((answer) => {
              return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
              const data = {
                sdp: peerConnection.localDescription,
                id: socket.id,
                target: target,
                type: "answer",
              };
              socket.emit("ANSWER", JSON.stringify(data));
            })
            .catch((e) => {
              console.warn(e);
            });
        })
        .catch((e) => {
          console.warn(e);
        });
    });

    // set remote description once answer is recieved to establish connection
    socket.on("ANSWER", (dataString) => {
      const sdp = JSON.parse(dataString).sdp;
      peerConnection.setRemoteDescription(sdp);
    });

    socket.on("NEW_USER", (name) => {
      setAnnouncement(name + " has joined.");
    });
  }, []);

  return (
    <>
      <div>Room page</div>
      <audio autoPlay></audio>
      <div>Input selector</div>
      <DeviceSelector onSelect={onSelect} />
      <div>{announcement}</div>
    </>
  );
}

const Page = ({ socket, peerConnection }) => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  return (
    <>
      {joined ? (
        <RoomPage socket={socket} peerConnection={peerConnection} name={name} />
      ) : (
        <JoinPage
          socket={socket}
          peerConnection={peerConnection}
          name={name}
          setName={setName}
          setJoined={setJoined}
        />
      )}
    </>
  );
};

export default Page;
