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
		origin: ["http://localhost:4500"],
	},
});

app.get("/", (req, res) => {
	res.send({ body: "Hello world, 3" });
});

const users = [{}];
io.on("connection", (socket) => {
	console.log("new client: " + socket.id);
	socket.on("REQUEST_USERS", () => {
		socket.broadcast.to(socket.id).emit("REQUEST_USERS", users)
	});
	socket.on("NEW_USER", (name) => {
		const user = {id: socket.id, name};
		users.push(user);
		socket.broadcast.emit("NEW_USER", user);
	});
	socket.on("OFFER", (dataString) => {
		socket.broadcast.emit("OFFER", dataString);
	});
	socket.on("ANSWER", (dataString) => {
		const targetId = JSON.parse(dataString).receiverId;
		socket.broadcast.to(targetId).emit("ANSWER", dataString);
	});
	socket.on("disconnect", () => {
		console.log("client disconnect");
	});
});
