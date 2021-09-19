import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const app = express();
const port = 4000;
const server = app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4500", "http://localhost:4600"],
  },
});

app.get("/", (req, res) => {
  res.send({ body: "Hello world, 3" });
});

io.of((nsp, query, next) => {
  const { token } = query;
  console.log(nsp);
  console.log(query);

  // authentication

  // If success
  next(null, true);
}).on("connection", (socket) => {
  console.log("new client: " + socket.id);
  socket.on("JOIN", (name) => {
    const user = { name, id: socket.id };
    console.log(name + " (" + socket.id + ") has joined namespace " + socket.nsp.name);
    io.of(socket.nsp.name).emit("JOIN", user);
  });
  socket.on("OFFER", (dataString) => {
    const targetId = JSON.parse(dataString).receiverId;
    console.log(socket.id + " has sent offer to " + targetId);
    io.of(socket.nsp.name).to(targetId).emit("OFFER", dataString);
  });
  socket.on("ANSWER", (dataString) => {
    const targetId = JSON.parse(dataString).receiverId;
    console.log(socket.id + " has sent answer to " + targetId);
    io.of(socket.nsp.name).to(targetId).emit("ANSWER", dataString);
  });
  socket.on("ICE_CANDIDATE", (dataString) => {
    const targetId = JSON.parse(dataString).receiverId;
    io.of(socket.nsp.name).to(targetId).emit("ICE_CANDIDATE", dataString);
  });
  socket.on("disconnect", () => {
    io.of(socket.nsp.name).emit("LEAVE", { id: socket.id });
    console.log(socket.id + " has disconnected.");
  });
});
