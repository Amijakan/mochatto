import { Socket } from "socket.io-client";

export const notifyAndRequestNetworkInfo = (socket: Socket, name: string): void => {
	// notify server on join
	socket.emit("JOIN", name);
	socket.emit("REQUEST_USERS");
};

export const openJoinListener = (
	socket: Socket,
	addUser: (string) => void,
	announce: (string) => void
): void => {
	socket.on("JOIN", ({ name, id }) => {
		announce(name + " has joined.");
		if (id !== socket.id) {
			addUser(id);
		}
	});
};

export const openLeaveListener = (
	socket: Socket,
	announce: (string) => void,
	removeUser: (string) => void
): void => {
	socket.on("LEAVE", ({name, id}) => {
		announce(name + " has left.");
		removeUser(id);
	});
};

export const openRequestUsersListener = (socket: Socket, addUser: (string) => void): void => {
	socket.on("REQUEST_USERS", (users) => {
		users.forEach((user) => {
			if (user.id !== socket.id && user.id !== undefined) {
				addUser(user.id);
			}
		});
	});
};
