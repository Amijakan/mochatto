import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";

const stripTrailingSlash = (str: string) => str.replace(/\/$/, '')

const app = express();
const port = 4000;
const isProd = process.env.MODE === "prod"
const server = app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: isProd ? "*" : ["http://localhost:4500", "http://localhost:4600"],
  },
});

app.get("/", (req, res) => {
  res.send({ body: "Hello world, 3" });
});

const rooms: { [key: string]: number } = {};

const users: object[] = [];
io.on("connection", (socket) => {
  socket.on("NUM_USERS", (nspName) => {
    const roomName = stripTrailingSlash(nspName)
    socket.emit("NUM_USERS", rooms[roomName]);
  });
});

io.of((nsp, query, next) => {
  const { token } = query;
  // authentication

  // If success
  next(null, true);
}).on("connection", (socket) => {
  console.log("new client: " + socket.id);
  const roomName = stripTrailingSlash(socket.nsp.name)
  socket.on("JOIN", (name) => {
    const user = { name, id: socket.id };
    if (name !== "") {
      if (rooms[roomName]) {
        rooms[roomName] += 1;
      } else {
        rooms[roomName] = 1;
      }
      console.log(name + " (" + socket.id + ") has joined namespace " + roomName);
      io.of(roomName).emit("JOIN", user);
    }
  });

  socket.on("OFFER", (dataString) => {
    const targetId = JSON.parse(dataString).receiverId;
    console.log(socket.id + " has sent offer to " + targetId);
    io.of(roomName).to(targetId).emit("OFFER", dataString);
  });
  socket.on("ANSWER", (dataString) => {
    const targetId = JSON.parse(dataString).receiverId;
    console.log(socket.id + " has sent answer to " + targetId);
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
    console.log("user's leaving");
    io.of(roomName).emit("LEAVE", { id: socket.id });
  });
  socket.on("disconnect", () => {
    rooms[roomName] -= 1;
    if (rooms[roomName] === 0) {
      delete rooms[roomName];
    }
    io.of(roomName).emit("DISCONNECT", { id: socket.id });
    console.log(socket.id + " has disconnected.");
  });
});
