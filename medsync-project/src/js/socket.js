import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export const socket = io(API_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true, // session-based auth
  auth: token ? { token } : undefined, // JWT auth if available
});
