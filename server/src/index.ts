import express from "express";
import { Server } from "socket.io";
import { createHash } from "crypto";
import { AuthenticationEnum } from './shared/authentication'
import { SIOChannel } from './shared/socketIO'
import path from "path";

const app = express();
const port = 4000;
const isProd = process.env.MODE === "prod";
const server = app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: isProd ? "*" : ["http://localhost:4500", "http://localhost:4600"],
  },
});

// Holds info about all existing rooms.
const rooms: { [key: string]: { numUsers: number; passHash: string } } = {};

const getHash = (prehash: string) => {
  return createHash("sha256").update(prehash).digest("hex");
};

// Function that returns the default hash (when a user provides no password).
// Needs to be in agreement with the frontend.
const getDefaultHash = (roomName: string) => {
  return getHash(roomName + getHash(roomName));
};

const authenticate = (roomName: string, pass: string) => {
  const prehash = roomName + pass;
  const hash = getHash(prehash);
  const room = rooms[roomName];

  // If room doesn't exist, return.
  if (!room) {
    rooms[roomName] = { numUsers: 0, passHash: hash };
    return AuthenticationEnum.Success;
  } else {
    const roomHash = room.passHash;
    // If room password is set, authenticate, and if not, set password and allow connection.
    if (roomHash) {
      if (roomHash === hash) return AuthenticationEnum.Success;
      else return AuthenticationEnum.Unauthorized;
    }
  }
};

const getRoomName = (nsp: string) => {
  return encodeURIComponent(path.basename(nsp));
};

app.get("/", (req, res) => {
  res.send({ body: "Hello world, 4" });
});

io.on("connection", (socket) => {
  socket.on(SIOChannel.NUM_USERS, (nspName) => {
    const roomName = getRoomName(nspName);
    if (rooms[roomName]) {
      socket.emit(SIOChannel.NUM_USERS, rooms[roomName].numUsers);
    } else {
      socket.emit(SIOChannel.NUM_USERS, 0);
    }
  });
});

io.of((nsp, query, next) => {
  const { token } = query;
  // authentication

  // If success
  next(null, true);
}).on("connection", (socket) => {
  const roomName = getRoomName(socket.nsp.name);

  socket.on(SIOChannel.ROOM_INFO, () => {
    if (rooms[roomName]) {
      const hasPass = rooms[roomName].passHash !== getDefaultHash(roomName);
      socket.emit(SIOChannel.ROOM_INFO, {
        numUsers: rooms[roomName].numUsers,
        hasPass,
      });
    } else {
      socket.emit(SIOChannel.ROOM_INFO, { numUsers: 0, hasPass: false });
    }
  });

  socket.on(SIOChannel.AUTHENTICATE, (password) => {
    const authenticationResult = authenticate(roomName, password);
    socket.emit(SIOChannel.AUTHENTICATE, authenticationResult);

    if (authenticationResult === AuthenticationEnum.Success) {
      socket.on(SIOChannel.JOIN, (name) => {
        const user = { name, id: socket.id };
        if (name !== "") {
          if (rooms[roomName].numUsers) {
            rooms[roomName].numUsers += 1;
          } else {
            rooms[roomName].numUsers = 1;
          }
          io.of(roomName).emit(SIOChannel.JOIN, user);
        }
      });

      socket.on(SIOChannel.OFFER, (dataString) => {
        const targetId = JSON.parse(dataString).receiverId;
        io.of(roomName).to(targetId).emit(SIOChannel.OFFER, dataString);
      });

      socket.on(SIOChannel.ANSWER, (dataString) => {
        const targetId = JSON.parse(dataString).receiverId;
        io.of(roomName).to(targetId).emit(SIOChannel.ANSWER, dataString);
      });

      socket.on(SIOChannel.ICE_CANDIDATE, (dataString) => {
        const targetId = JSON.parse(dataString).receiverId;
        io.of(roomName).to(targetId).emit(SIOChannel.ICE_CANDIDATE, dataString);
      });

      socket.on(SIOChannel.SDP_RECEIVED, (sdpSenderId) => {
        io.of(roomName).to(sdpSenderId).emit(SIOChannel.SDP_RECEIVED);
      });

      socket.on(SIOChannel.EDIT_USER_NAME, (name) => {
        io.of(roomName).emit(SIOChannel.EDIT_USER_NAME, { id: socket.id, name });
      });

      socket.on(SIOChannel.LEAVE, () => {
        io.of(roomName).emit(SIOChannel.LEAVE, { id: socket.id });
      });

      // "disconnect" is socket.io native event
      socket.on("disconnect", () => {
        if (rooms[roomName]) { // Shouldn't happen, but looks like there are occasions where this goes out of sync.
          rooms[roomName].numUsers -= 1;
          if (rooms[roomName].numUsers === 0) {
            delete rooms[roomName];
          }
          io.of(roomName).emit(SIOChannel.DISCONNECT, { id: socket.id });
        }
      });
    }
  });
});
