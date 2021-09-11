import { Socket } from "socket.io-client";
import User from "../User";

export const notifyAndRequestNetworkInfo = (socket: Socket, name: string): void => {
  // notify server on join
  socket.emit("JOIN", name);
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
  removeUser: (string) => void
): void => {
  socket.on("LEAVE", ({ name, id }) => {
    announce(name + " has left.");
    removeUser(id);
  });
};

// opens on request users listener
export const openRequestUsersListener = (
  socket: Socket,
  addUser: (User) => void,
  setNewUser: ({ id }) => void
): void => {
  socket.on("REQUEST_USERS", (users) => {
    users.forEach((user) => {
      // if the user isn't self and id exists
      if (user.id !== socket.id && user.id !== undefined) {
        console.log(user.id);
        setNewUser(user.id);
      }
    });
  });
};
