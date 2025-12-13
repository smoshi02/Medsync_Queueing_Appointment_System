import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const useStompWebSocket = (topics = [], onMessageReceive) => {
  const stompClientRef = useRef(null);
  const onMessageReceiveRef = useRef(onMessageReceive);

  // Keep the callback reference up to date
  useEffect(() => {
    onMessageReceiveRef.current = onMessageReceive;
  }, [onMessageReceive]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Connect to the private endpoint with JWT token
    const socket = new SockJS(`http://localhost:6969/ws/private?token=${token}`);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        // Uncomment to see debug logs
        // console.log(str);
      },
    });

    stompClient.onConnect = () => {
      console.log("✅ Connected to WebSocket");

      // Subscribe to all topics
      topics.forEach((topic) => {
        stompClient.subscribe(topic, (message) => {
          try {
            const parsed = JSON.parse(message.body);
            onMessageReceiveRef.current(parsed);
          } catch (err) {
            console.error("❌ Invalid JSON:", message.body, err);
          }
        });

        console.log("📡 Subscribed to:", topic);
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("❌ Broker error:", frame.headers["message"]);
      console.error("Error details:", frame);
    };

    stompClient.onWebSocketClose = () => {
      console.log("🔌 WebSocket connection closed");
    };

    stompClient.onWebSocketError = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClient) {
        console.log("🔌 Disconnecting WebSocket");
        stompClient.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - connect once on mount

  return stompClientRef;
};