import { useEffect, useState } from "react";
import { fetchWithAuth } from "../js/fetchHelper";

const PatientQueue = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const data = await fetch("/api/queue"); // public, no auth
        const json = await data.json();
        setQueue(json);
      } catch (err) {
        console.error("Failed to load queue:", err);
      }
    };
    loadQueue();
  }, []);

  return (
    <div>
      <h2>Current Queue</h2>
      {queue.length === 0 ? (
        <p>No patients in queue right now.</p>
      ) : (
        <ul>
          {queue.map((p, idx) => (
            <li key={idx}>
              {p.name} - {p.priority}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientQueue;
