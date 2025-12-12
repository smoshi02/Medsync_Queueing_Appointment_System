import { useEffect, useState } from "react";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await fetch("/api/appointments"); // public
        const json = await res.json();
        setAppointments(json);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };
    loadAppointments();
  }, []);

  return (
    <div>
      <h2>Your Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>
              {a.patientName} - {a.date} - {a.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientAppointments;
