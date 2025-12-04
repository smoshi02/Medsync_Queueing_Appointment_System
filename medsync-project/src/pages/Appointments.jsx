import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/appointments");
      setAppointments(data || []); // fallback to empty array
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useStompWebSocket(["/topic/appointments"], (msg) => {
    if (msg.type === "appointments-update") setAppointments(msg.data || []);
  });

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Patient</th>
            <th className="border p-2">Staff</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">
                No appointments yet
              </td>
            </tr>
          ) : (
            appointments.map((appt) => (
              <tr key={appt.appointmentId} className="hover:bg-gray-100">
                <td className="border p-2">{appt.patientName}</td>
                <td className="border p-2">{appt.staffName}</td>
                <td className="border p-2">{new Date(appt.date).toLocaleString()}</td>
                <td className="border p-2">{appt.status || "Pending"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Appointments;
