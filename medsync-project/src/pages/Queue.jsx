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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
            Patient Queue
          </h1>
          <p className="text-gray-600">Monitor active queues across all services</p>
        </div>

        {/* SERVICE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loadingCards ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
                <p className="text-violet-700 text-lg font-medium">Loading queue categories...</p>
              </div>
            </div>
          ) : cards.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-500 text-lg font-medium">No queue services available</p>
            </div>
          ) : (
            cards.map((card) => (
              <ServiceCard
                key={card.serviceName}
                card={card}
                onClick={() => loadServiceTable(card.serviceName)}
              />
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <QueueModal
          selectedService={selectedService}
          tableData={tableData}
          loadingTable={loadingTable}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// =======================
// ServiceCard Component
// =======================
function ServiceCard({ card, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        relative p-6 bg-gradient-to-br from-violet-500 to-purple-600
        text-white rounded-2xl shadow-lg cursor-pointer
        transform transition-all duration-300
        hover:scale-105 hover:shadow-2xl hover:-translate-y-1
        overflow-hidden group
      "
    >
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">{card.serviceName}</h2>
          <div className="text-3xl opacity-30 group-hover:opacity-50 transition-opacity">
            🏥
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-violet-100 text-sm font-medium">Active Patients</span>
            <span className="text-2xl font-bold">
              {card.activePatients}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-violet-100 text-sm font-medium">Total Served</span>
            <span className="text-2xl font-bold">{card.totalServed}</span>
          </div>
        </div>

        {/* Click indicator */}
        <div className="mt-4 flex items-center justify-center text-violet-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view details</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-20"></div>
    </div>
  );
}

// =======================
// QueueModal Component
// =======================
function QueueModal({ selectedService, tableData, loadingTable, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Queue: {selectedService}</h2>
            <p className="text-violet-100 text-sm">Real-time patient queue monitoring</p>
          </div>

          <button
            onClick={onClose}
            className="
              text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg
              transition-all duration-200 transform hover:scale-110 hover:rotate-90
            "
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* TABLE */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loadingTable ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
                <p className="text-violet-700 text-lg font-medium">Loading patients...</p>
              </div>
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg font-medium">No patients in queue yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
                    <th className="p-4 text-left text-violet-900 font-semibold rounded-tl-lg">
                      Queue #
                    </th>
                    <th className="p-4 text-left text-violet-900 font-semibold">
                      Patient Name
                    </th>
                    <th className="p-4 text-left text-violet-900 font-semibold">
                      Priority
                    </th>
                    <th className="p-4 text-left text-violet-900 font-semibold">
                      Staff
                    </th>
                    <th className="p-4 text-left text-violet-900 font-semibold">
                      Status
                    </th>
                    <th className="p-4 text-left text-violet-900 font-semibold rounded-tr-lg">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((row) => (
                    <tr
                      key={row.queueId}
                      className="border-b border-violet-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-transparent transition-all duration-200"
                    >
                      <td className="p-4 font-bold text-violet-700">
                        #{row.queueId}
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {row.patientName}
                      </td>

                      <td className="p-4">
                        <span
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-bold inline-block
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

                      <td className="p-4 text-gray-700">
                        {row.staffName || <span className="text-gray-400 italic">Unassigned</span>}
                      </td>

                      <td className="p-4">
                        <span
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-bold inline-block
                            ${
                              row.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : row.status === "Waiting"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          `}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {new Date(row.timeSlot).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with stats */}
        {!loadingTable && tableData.length > 0 && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-t border-violet-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total patients in queue: <span className="font-bold text-violet-700">{tableData.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-600">Live updates enabled</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Queue;