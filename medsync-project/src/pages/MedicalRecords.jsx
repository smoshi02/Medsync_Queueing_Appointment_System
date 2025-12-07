import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/medical-records");
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Realtime updates via WebSocket
  useStompWebSocket(["/topic/medical-records"], (msg) => {
    if (msg.type === "records-update") {
      setRecords(msg.data);
    }
  });

  // Loading state
  if (loading)
    return (
      <div className="p-6 min-h-screen flex items-center justify-center text-violet-700 text-xl animate-pulse">
        Loading medical records...
      </div>
    );

  // Error state
  if (error)
    return (
      <p className="text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </p>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 min-h-screen animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-violet-900 animate-fade-in">
        Medical Records
      </h1>

      <div className="bg-white rounded-xl shadow-xl p-6 animate-slide-up border-t-4 border-violet-500">
        {records.length === 0 ? (
          <p className="italic text-gray-500 text-center py-6">
            No medical records yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-100 to-purple-100">
                <tr>
                  <th className="p-3 text-left text-violet-900 font-semibold">Record #</th>
                  <th className="p-3 text-left text-violet-900 font-semibold">Patient</th>
                  <th className="p-3 text-left text-violet-900 font-semibold">Diagnosis</th>
                  <th className="p-3 text-left text-violet-900 font-semibold">Prescription</th>
                  <th className="p-3 text-left text-violet-900 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={record.recordId}
                    className="border-b border-violet-100 hover:bg-violet-50 transition-all"
                    style={{
                      animation: `fadeIn 0.5s ease ${(index + 1) * 0.08}s both`,
                    }}
                  >
                    <td className="p-3 font-medium text-violet-700">
                      #{record.recordId}
                    </td>
                    <td className="p-3">{record.patientName}</td>
                    <td className="p-3">{record.diagnosis}</td>
                    <td className="p-3">{record.prescription}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(record.recordCreatedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicalRecords;
