import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
  }

  return socket;
}

export function connectSocket() {
  const client = getSocket();
  if (!client.connected) {
    client.connect();
  }

  return client;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
};
