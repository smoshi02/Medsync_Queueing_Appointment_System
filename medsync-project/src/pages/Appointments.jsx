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
      setAppointments(data || []);
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
    if (msg.type === "appointments-update") {
      setAppointments(msg.data || []);
    }
  });

  if (loading)
    return (
      <p className="text-violet-700 text-lg animate-pulse">
        Loading appointments...
      </p>
    );

  if (error)
    return <p className="text-red-600 font-semibold">{error}</p>;

  return (
    <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-violet-900 animate-fade-in">
        Appointments
      </h1>

      <div className="bg-white rounded-xl shadow-xl p-6 animate-slide-up border-t-4 border-violet-500">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-violet-100 to-purple-100">
              <tr>
                <th className="p-3 text-left text-violet-900 font-semibold">Patient</th>
                <th className="p-3 text-left text-violet-900 font-semibold">Staff</th>
                <th className="p-3 text-left text-violet-900 font-semibold">
                  Date & Time
                </th>
                <th className="p-3 text-left text-violet-900 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center p-6 text-violet-700 font-medium"
                  >
                    No appointments yet
                  </td>
                </tr>
              ) : (
                appointments.map((appt, index) => (
                  <tr
                    key={appt.appointmentId}
                    className="border-b border-violet-100 hover:bg-violet-50 transition-colors duration-200"
                    style={{
                      animation: `fadeIn 0.5s ease-in ${index * 0.1}s both`,
                    }}
                  >
                    <td className="p-3 font-medium text-violet-700">
                      {appt.patientName || "Unknown"}
                    </td>

                    <td className="p-3">{appt.staffName || "N/A"}</td>

                    <td className="p-3 text-sm text-gray-600">
                      {appt.date
                        ? new Date(appt.date).toLocaleString()
                        : "No Date"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            appt.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : appt.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {appt.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
