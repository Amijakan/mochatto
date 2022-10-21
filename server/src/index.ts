import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import { createHash } from "crypto";
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

// Authentication codes to be returned to the client.
// Needs to be in sync with the frontend enum.
enum AuthenticationEnum {
  Success = 200,
  Unauthorized = 401,
}

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
  socket.on("NUM_USERS", (nspName) => {
    const roomName = getRoomName(nspName);
    if (rooms[roomName]) {
      socket.emit("NUM_USERS", rooms[roomName].numUsers);
    } else {
      socket.emit("NUM_USERS", 0);
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

  socket.on("ROOM_INFO", () => {
    if (rooms[roomName]) {
      const hasPass = rooms[roomName].passHash !== getDefaultHash(roomName);
      socket.emit("ROOM_INFO", {
        numUsers: rooms[roomName].numUsers,
        hasPass,
      });
    } else {
      socket.emit("ROOM_INFO", { numUsers: 0, hasPass: false });
    }
  });

  socket.on("AUTHENTICATE", (password) => {
    const authenticationResult = authenticate(roomName, password);
    socket.emit("AUTHENTICATE", authenticationResult);

    if (authenticationResult === AuthenticationEnum.Success) {
      socket.on("JOIN", (name) => {
        const user = { name, id: socket.id };
        if (name !== "") {
          if (rooms[roomName].numUsers) {
            rooms[roomName].numUsers += 1;
          } else {
            rooms[roomName].numUsers = 1;
          }
          io.of(roomName).emit("JOIN", user);
        }
      });

      socket.on("OFFER", (dataString) => {
        const targetId = JSON.parse(dataString).receiverId;
        io.of(roomName).to(targetId).emit("OFFER", dataString);
      });

      socket.on("ANSWER", (dataString) => {
        const targetId = JSON.parse(dataString).receiverId;
        io.of(roomName).to(targetId).emit("ANSWER", dataString);
      });

      socket.on("ICE_CANDIDATE", (dataString) => {
        const targetId = JSON.parse(dataString).receiverId;
        io.of(roomName).to(targetId).emit("ICE_CANDIDATE", dataString);
      });

      socket.on("SDP_RECEIVED", (sdpSenderId) => {
        io.of(roomName).to(sdpSenderId).emit("SDP_RECEIVED");
      });

      socket.on("EDIT_USER_NAME", (name) => {
        io.of(roomName).emit("EDIT_USER_NAME", { id: socket.id, name });
      });

      socket.on("LEAVE", () => {
        io.of(roomName).emit("LEAVE", { id: socket.id });
      });

      socket.on("disconnect", () => {
        rooms[roomName].numUsers -= 1;
        if (rooms[roomName].numUsers === 0) {
          delete rooms[roomName];
        }
        io.of(roomName).emit("DISCONNECT", { id: socket.id });
      });
    }
  });
});
