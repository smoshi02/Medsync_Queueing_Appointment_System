import React, { useEffect, useState } from "react";
import { socket } from "../js/socket";
import { fetchWithAuth } from "../js/fetchHelper";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await fetchWithAuth("/api/appointments");
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();

    socket.on("appointmentsUpdate", (data) => setAppointments(Array.isArray(data) ? data : []));
    return () => socket.off("appointmentsUpdate");
  }, []);

  const handleCancel = async (id) => {
    try {
      const data = await fetchWithAuth(`/api/appointments/${id}/cancel`, { method: "POST" });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleReschedule = async (id) => {
    const newDate = prompt("Enter new appointment date (YYYY-MM-DD HH:MM):");
    if (!newDate) return;
    try {
      const data = await fetchWithAuth(`/api/appointments/${id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ dateTime: newDate }),
      });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (loading) return <p className="p-6">Loading appointments...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Appointments</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50">
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} className="border-b hover:bg-blue-50">
                <td>{appt.id}</td>
                <td>{appt.patientName}</td>
                <td>{appt.service}</td>
                <td>{appt.doctor}</td>
                <td>{appt.dateTime}</td>
                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      appt.status === "Scheduled"
                        ? "bg-green-100 text-green-700"
                        : appt.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="space-x-2">
                  {appt.status !== "Cancelled" && (
                    <>
                      <button className="text-red-600 hover:text-red-800" onClick={() => handleCancel(appt.id)}>Cancel</button>
                      <button className="text-blue-600 hover:text-blue-800" onClick={() => handleReschedule(appt.id)}>Reschedule</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Appointments;
