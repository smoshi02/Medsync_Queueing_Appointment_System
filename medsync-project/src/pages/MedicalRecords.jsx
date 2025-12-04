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

  useStompWebSocket(["/topic/medical-records"], (msg) => {
    if (msg.type === "records-update") {
      setRecords(msg.data);
    }
  });

  if (loading) return <p>Loading medical records...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Medical Records</h1>

      {records.length === 0 ? (
        <p className="italic text-gray-500">No medical records yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Record #</th>
              <th className="border p-2">Patient</th>
              <th className="border p-2">Diagnosis</th>
              <th className="border p-2">Prescription</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.recordId} className="hover:bg-gray-100">
                <td className="border p-2">{record.recordId}</td>
                <td className="border p-2">{record.patientName}</td>
                <td className="border p-2">{record.diagnosis}</td>
                <td className="border p-2">{record.prescription}</td>
                <td className="border p-2">
                  {new Date(record.recordCreatedDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MedicalRecords;
