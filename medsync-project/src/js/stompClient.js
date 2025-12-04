import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:6969";
const token = localStorage.getItem("token");

export const stompClient = new Client({
  webSocketFactory: () => new SockJS(`${API_URL}/ws?token=${token}`),
  debug: () => {}
});

stompClient.onConnect = () => console.log("STOMP connected");
stompClient.onStompError = (err) => console.error("STOMP error:", err);
stompClient.activate();
