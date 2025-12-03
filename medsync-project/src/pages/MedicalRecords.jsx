import React, { useEffect, useState } from "react";
import { socket } from "../js/socket";
import { fetchWithAuth } from "../js/fetchHelper";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await fetchWithAuth("/api/medical-records");
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    loadRecords();

    socket.on("medicalRecordsUpdate", (data) => setRecords(Array.isArray(data) ? data : []));
    return () => socket.off("medicalRecordsUpdate");
  }, []);

  const filteredRecords = records.filter(record =>
    record.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Medical Records</h1>
      <input
        type="text"
        placeholder="Search patient..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50">
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Date of Birth</th>
              <th>Last Visit</th>
              <th>Medical Records</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec, idx) => (
              <tr key={idx} className="border-b hover:bg-blue-50">
                <td>{rec.patientId}</td>
                <td>{rec.patientName}</td>
                <td>{rec.dob}</td>
                <td>{rec.lastVisit}</td>
                <td>
                  <ul className="list-disc ml-5 space-y-1">
                    {(Array.isArray(rec.medicalRecords) ? rec.medicalRecords : []).map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicalRecords;
