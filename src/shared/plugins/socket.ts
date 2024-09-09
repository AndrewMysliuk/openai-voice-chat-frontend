import { io } from "socket.io-client"

const options = {
  forceNew: true,
  reconnectionAttempts: Infinity,
  timeout: 10000,
  transports: ["websocket"],
}

export const socket = io("ws://localhost:3001", options)
