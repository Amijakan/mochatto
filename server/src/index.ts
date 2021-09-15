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

const users: object[] = [];
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
    users.push(user);
    console.log(
      name +
        " (" +
        socket.id +
        ") has joined namespace " +
        socket.nsp.name +
        ". There are currently " +
        users.length +
        " users total."
    );
    io.of(socket.nsp.name).emit("JOIN", user);
  });
  socket.on("REQUEST_USERS", () => {
    socket.emit("REQUEST_USERS", users);
    console.log("Requested users. There are currently " + users.length + " users.");
  });
  socket.on("CLEAR_USERS", () => {
    users.length = 0;
    console.log("Cleared users. There are currently " + users.length + " users.");
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
  socket.on("disconnect", () => {
    const userIndex = users.findIndex((usr) => (usr as any).id === socket.id);
    if (users[userIndex]) {
      io.of(socket.nsp.name).emit("LEAVE", { name: (users[userIndex] as any).name, id: socket.id });
      users.splice(userIndex, 1);
      console.log(socket.id + " has disconnected. There are currently " + users.length + " users.");
    }
  });
});
