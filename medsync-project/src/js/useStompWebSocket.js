import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const useStompWebSocket = (onMessageReceive) => {
  const stompClientRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const socket = new SockJS(`http://localhost:6969/ws?token=${token}`);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {},
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");
      stompClient.subscribe("/topic/dashboard", (message) => {
        onMessageReceive(JSON.parse(message.body));
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker error:", frame.headers["message"]);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return stompClientRef;
};
