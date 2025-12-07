import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Queue() {
  const [cards, setCards] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  // LOAD CARDS
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

  // LOAD TABLE WHEN CARD CLICKED
  const loadServiceTable = async (serviceName) => {
    try {
      setSelectedService(serviceName);
      setLoadingTable(true);

      const data = await fetchWithAuth(`/api/queue/service/${serviceName}`);
      setTableData(data);

      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // REAL-TIME UPDATE
  useStompWebSocket(["/topic/queue"], () => {
    loadCards();
    if (selectedService) loadServiceTable(selectedService);
  });

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-violet-900 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
        Patient Queue
      </h1>

      {/* SERVICE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {loadingCards ? (
          <p>Loading queue categories...</p>
        ) : (
          cards.map((card, index) => (
            <div
              key={card.serviceName}
              onClick={() => loadServiceTable(card.serviceName)}
              className="
                p-6 bg-gradient-to-br from-violet-500 to-purple-600
                text-white rounded-xl shadow-xl cursor-pointer
                transform transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                opacity-0 animate-[slideUp_0.5s_ease-out_forwards]
              "
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <h2 className="font-bold text-xl mb-3">{card.serviceName}</h2>

              <div className="space-y-2">
                <p className="flex items-center justify-between">
                  <span className="text-violet-100">Active:</span>
                  <span className="text-2xl font-bold">
                    {card.activePatients}
                  </span>
                </p>

                <p className="flex items-center justify-between">
                  <span className="text-violet-100">Served:</span>
                  <span className="text-2xl font-bold">{card.totalServed}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="
          fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 
          opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]
        ">
          <div className="
            bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden
            scale-95 animate-[zoomIn_0.25s_ease-out_forwards]
          ">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Queue: {selectedService}</h2>

              <button
                onClick={() => setShowModal(false)}
                className="
                  text-white hover:bg-violet-700 p-2 rounded-lg
                  transition-all duration-300 transform hover:scale-110
                "
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* TABLE */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
              {loadingTable ? (
                <p>Loading patients...</p>
              ) : tableData.length === 0 ? (
                <p className="text-gray-500 italic">No patients yet.</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-violet-100 to-purple-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left text-violet-900 font-semibold">Queue #</th>
                      <th className="p-3 text-left text-violet-900 font-semibold">Patient Name</th>
                      <th className="p-3 text-left text-violet-900 font-semibold">Priority</th>
                      <th className="p-3 text-left text-violet-900 font-semibold">Staff</th>
                      <th className="p-3 text-left text-violet-900 font-semibold">Status</th>
                      <th className="p-3 text-left text-violet-900 font-semibold">Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tableData.map((row, i) => (
                      <tr
                        key={row.queueId}
                        className="
                          border-b border-violet-100 hover:bg-violet-50 transition-colors duration-200
                          opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]
                        "
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <td className="p-3 font-medium text-violet-700">#{row.queueId}</td>
                        <td className="p-3">{row.patientName}</td>

                        <td className="p-3">
                          <span
                            className={`
                              px-3 py-1 rounded-full text-xs font-semibold 
                              ${
                                row.priority === "High"
                                  ? "bg-red-100 text-red-700"
                                  : row.priority === "Urgent"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            `}
                          >
                            {row.priority}
                          </span>
                        </td>

                        <td className="p-3">{row.staffName || "—"}</td>

                        <td className="p-3">
                          <span
                            className={`
                              px-3 py-1 rounded-full text-xs font-semibold
                              ${
                                row.status === "In Progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            `}
                          >
                            {row.status}
                          </span>
                        </td>

                        <td className="p-3 text-sm text-gray-600">
                          {new Date(row.timeSlot).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANIMATION KEYFRAMES INLINE */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0 }
            100% { opacity: 1 }
          }
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(20px) }
            100% { opacity: 1; transform: translateY(0) }
          }
          @keyframes zoomIn {
            0% { opacity: 0; transform: scale(0.95) }
            100% { opacity: 1; transform: scale(1) }
          }
        `}
      </style>
    </div>
  );
}

export default Queue;
