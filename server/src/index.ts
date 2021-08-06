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
		console.log("users requested by: "+ socket.id);
		socket.emit("REQUEST_USERS", users);
	});
	socket.on("JOIN", (name) => {
		const user = {id: socket.id, name};
		users.push(user);
		console.log("new user pushed: " + socket.id);
		io.emit("JOIN", user);
	});
	socket.on("OFFER", (dataString) => {
		socket.broadcast.emit("OFFER", dataString);
	});
	socket.on("ANSWER", (dataString) => {
		const targetId = JSON.parse(dataString).receiverId;
		socket.broadcast.to(targetId).emit("ANSWER", dataString);
	});
	socket.on("disconnect", () => {
		const userIndex = users.findIndex(usr => (usr as any).id === socket.id)
		io.emit("LEAVE", users[userIndex]);
		users.splice(userIndex, 1);
		console.log("client disconnect");
	});
});
