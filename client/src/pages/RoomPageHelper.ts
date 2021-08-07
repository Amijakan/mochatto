export const notifyAndRequestNetworkInfo = (socket) => {
	// notify server on join
	socket.emit("JOIN", name);
	socket.emit("REQUEST_USERS");
};

export const openJoinListener = (socket, addUser: (string) => void, announce: (string) => void) => {
	socket.on("JOIN", ({ name, id }) => {
		announce(name + " has joined.");
		if (id !== socket.id) {
			addUser(id);
		}
	});
};

export const openLeaveListener = (socket, announce: (string) => void) => {
	socket.on("LEAVE", ({ name, id }) => {
		announce(name + " has left.");
	});
};

export const openRequestUsersListener = (socket, addUser: (string) => void) => {
	socket.on("REQUEST_USERS", (users) => {
		users.forEach((user) => {
			if (user.id !== socket.id && user.id !== undefined) {
				addUser(user.id);
			}
		});
	});
};
