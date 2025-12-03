import React, { useEffect, useState } from "react";
import { socket } from "../js/socket";
import { fetchWithAuth } from "../js/fetchHelper";

const services = [
  "Medical Consultation", "Laboratory Service", "Pharmacy Services", "Family Planning Service",
  "TB DOTs Service", "Obstetrics Services", "Dental Services", "Medical Certification",
  "Adolescent Health Clinic", "Immunization",
];

function Queue() {
  const [activeService, setActiveService] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchWithAuth("/api/queue/stats");
        setServiceStats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    loadStats();

    socket.on("queueUpdate", (data) => {
      setServiceStats(Array.isArray(data.stats) ? data.stats : []);
      if (activeService) {
        setQueueData(Array.isArray(data.queues?.[activeService]) ? data.queues[activeService] : []);
      }
    });
    return () => socket.off("queueUpdate");
  }, [activeService]);

  const handleCardClick = async (serviceName) => {
    setActiveService(serviceName);
    try {
      const data = await fetchWithAuth(`/api/queue/${encodeURIComponent(serviceName)}`);
      setQueueData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Service Queues</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {serviceStats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(stat.service)}
            className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:scale-105 ${activeService === stat.service ? "border-4 border-blue-500" : ""}`}
          >
            <h3 className="text-lg font-bold text-blue-900 mb-2">{stat.service}</h3>
            <p>Total in Queue: <span className="font-semibold">{stat.total}</span></p>
            <p>Active Now: <span className="font-semibold">{stat.active}</span></p>
          </div>
        ))}
      </div>

      {activeService && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">{activeService} Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th>Queue ID</th>
                  <th>Patient</th>
                  <th>Staff</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {queueData.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-blue-50">
                    <td>{item.queueId}</td>
                    <td>{item.patient}</td>
                    <td>{item.staff}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.priority === "High" ? "bg-red-100 text-red-700" :
                        item.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>{item.priority}</span>
                    </td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === "Serving" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      }`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Queue;
