import Socket from "socket.io-client";
import User from "./User";

let socket = null as any;

// initialize socketio (exported)
const setSocket = (s: any) => {
  socket = s;
};

const users: User[] = [];

// add user to the network (exported)
const addUser = (id: string) => {
  users.push(new User(id));
};

const getUsers = () => {
  return users;
};

const findUserById = (id: string) => {
  return getUsers().find((user) => {
    user.id = id;
  });
};

// update tracks for all peer connections (exported)
const updateAllTracks = (track: MediaStreamTrack) => {
  users.forEach((user) => {
    user.updateTrack(track);
  });
};

// send out offer to every user on network (exported)
const sendOffer = () => {
  // for each user
  users.forEach((user) => {
    // emit an offer to the server to be broadcasted
    user.peerConnection
      .createOffer()
      .then((offer) => {
        return user.peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        const data = {
          sdp: user.peerConnection.localDescription,
          id: socket.id,
          type: "offer",
        };
        socket.emit("OFFER", JSON.stringify(data));
      })
      .catch((e) => {
        console.warn(e);
      });
  });
};

// emit an answer when offer is received
socket.on("OFFER", (dataString) => {
  const sdp = JSON.parse(dataString).sdp;
  const target = JSON.parse(dataString).id;
  const user = findUserById(target);
  const peerConnection = (user as User).peerConnection;
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
  const target = JSON.parse(dataString).id;
  const user = findUserById(target);
  const peerConnection = (user as User).peerConnection;
  peerConnection.setRemoteDescription(sdp);
});

export { addUser, setSocket, updateAllTracks, sendOffer };
