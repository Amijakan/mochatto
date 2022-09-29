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

enum AuthenticationEnum {
  Success = 0,
  IncorrectPassword = 401,
}

const rooms: { [key: string]: { numUsers: number; passHash: string } } = {};

// Function to decide whether to verify room password.
const authenticate = (roomName: string, pass: string) => {
  const hash = createHash("sha256")
      .update(roomName + pass)
      .digest("hex"),
    room = rooms[roomName];

  // If room doesn't exist, return.
  if (!room) {
    rooms[roomName] = { numUsers: 0, passHash: hash };
    return AuthenticationEnum.Success;
  } else {
    const roomHash = room.passHash;
    // If room password is set, authenticate, and if not, set password and allow connection.
    if (roomHash) {
      if (roomHash == hash) return AuthenticationEnum.Success;
      else return AuthenticationEnum.IncorrectPassword;
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
    socket.emit("NUM_USERS", rooms[roomName]);
  });
});

io.of((nsp, query, next) => {
  const { token } = query;
  // authentication

  // If success
  next(null, true);
}).on("connection", (socket) => {
  const roomName = getRoomName(socket.nsp.name);

  socket.on("AUTHENTICATE", (password) => {
    const authenticationResult = authenticate(roomName, password);
    socket.emit("AUTHENTICATE", authenticationResult);

    if (authenticationResult == AuthenticationEnum.Success) {
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
