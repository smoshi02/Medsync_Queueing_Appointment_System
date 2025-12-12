import { useState, useEffect } from "react";
import { useStompWebSocket } from "../js/useStompWebSocket";

export function useAppointmentsWebSocket(initialAppointments = []) {
  const [appointments, setAppointments] = useState(initialAppointments);

  useStompWebSocket(["/topic/appointments"], (msg) => {
    if (msg.type === "appointments-update") {
      setAppointments(prev => {
        const exists = prev.some(a => a.appointmentId === msg.data.appointmentId);
        return exists ? prev : [...prev, msg.data];
      });
    }
  });

  return [appointments, setAppointments];
}
