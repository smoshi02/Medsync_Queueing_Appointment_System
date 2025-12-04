import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Queue() {
  const [cards, setCards] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [error, setError] = useState("");

  // =============================
  // LOAD QUEUE CARDS
  // =============================
  const loadCards = async () => {
    try {
      setLoadingCards(true);
      const data = await fetchWithAuth("/api/queue/cards");
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCards(false);
    }
  };

  // ===================================
  // LOAD TABLE WHEN SERVICE IS CLICKED
  // ===================================
  const loadServiceTable = async (serviceName) => {
    try {
      setSelectedService(serviceName);
      setLoadingTable(true);

      const data = await fetchWithAuth(`/api/queue/service/${serviceName}`);
      setTableData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // ========================================
  // WEBSOCKET UPDATES FOR REAL-TIME QUEUE
  // ========================================
  useStompWebSocket(["/topic/queue"], async (msg) => {
    if (msg.type === "queue-update") {
      loadCards();
      if (selectedService) {
        loadServiceTable(selectedService);
      }
    }
  });

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Patient Queue</h1>

      {/* ========================== */}
      {/* SERVICE CARDS */}
      {/* ========================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loadingCards ? (
          <p>Loading queue categories...</p>
        ) : (
          cards.map((card) => (
            <div
              key={card.serviceName}
              onClick={() => loadServiceTable(card.serviceName)}
              className={`p-4 border rounded-lg shadow cursor-pointer hover:bg-gray-100 transition ${
                selectedService === card.serviceName ? "bg-gray-200" : ""
              }`}
            >
              <h2 className="font-semibold text-lg">{card.serviceName}</h2>
              <p>Total in Queue: {card.activePatients}</p>
              <p>Total Served: {card.totalServed}</p>
            </div>
          ))
        )}
      </div>

      {/* ========================== */}
      {/* QUEUE TABLE */}
      {/* ========================== */}
      {selectedService && (
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Patients in: {selectedService}
          </h2>

          {loadingTable ? (
            <p>Loading patients...</p>
          ) : tableData.length === 0 ? (
            <p className="text-gray-500 italic">No patients yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Queue #</th>
                  <th className="border p-2">Patient Name</th>
                  <th className="border p-2">Priority</th>
                  <th className="border p-2">Staff</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Timeslot</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.queueId} className="hover:bg-gray-100">
                    <td className="border p-2">{row.queueId}</td>
                    <td className="border p-2">{row.patientName}</td>
                    <td className="border p-2">{row.priority}</td>
                    <td className="border p-2">{row.staffName || "—"}</td>
                    <td className="border p-2">{row.status}</td>
                    <td className="border p-2">
                      {new Date(row.timeSlot).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Queue;
