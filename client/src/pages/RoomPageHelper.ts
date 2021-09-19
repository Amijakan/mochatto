import { Socket } from "socket.io-client";

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
