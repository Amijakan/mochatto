import { Socket } from "socket.io-client";

export const requestNetworkInfo = (socket: Socket): void => {
  // request users after loading the room page
  socket.emit("REQUEST_USERS");
};

// opens join listener
export const openJoinListener = (socket: Socket, onJoinCallback: ({ name, id }) => void): void => {
  socket.on("JOIN", ({ name, id }) => {
    onJoinCallback({ name, id });
  });
};

// opens on leave listener
export const openLeaveListener = (
  socket: Socket,
  announce: (string) => void,
  onLeave: (string) => void
): void => {
  socket.on("LEAVE", ({ name, id }) => {
    announce(name + " has left.");
    onLeave(id);
  });
};

// opens on request users listener
export const openRequestUsersListener = (
  name: string,
  socket: Socket,
  onRequest: ({ id }) => void
): void => {
  socket.on("REQUEST_USERS", (users) => {
    users.forEach((user) => {
      // if the user isn't self and id exists
      if (user.id !== socket.id && user.id !== undefined) {
        onRequest(user.id);
      }
    });
    socket.emit("JOIN", name);
  });
};
