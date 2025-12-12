import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const useStompWebSocket = (topics = [], onMessageReceive) => {
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

      // 🟢 Subscribe to all topics passed in the argument
      topics.forEach((topic) => {
        stompClient.subscribe(topic, (message) => {
          try {
            const parsed = JSON.parse(message.body);
            onMessageReceive(parsed);
          } catch (err) {
            console.error("Invalid JSON:", message.body);
          }
        });

        console.log("Subscribed to:", topic);
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
  }, [topics]);

  return stompClientRef;
};
