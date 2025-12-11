import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

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

  // Filter records based on search
  const filteredRecords = records.filter(
    (record) =>
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordId?.toString().includes(searchTerm)
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="text-violet-700 text-xl font-medium">Loading medical records...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="text-red-500 text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-600 text-lg font-bold mb-1">Error Loading Records</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
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
            Medical Records
          </h1>
          <p className="text-gray-600">Patient medical history and diagnoses</p>
        </div>

        {/* Search and Stats Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-violet-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by patient, diagnosis, or record #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">{records.length}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Total Records</p>
              </div>
              <div className="h-10 w-px bg-violet-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{filteredRecords.length}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Showing</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-600">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-violet-100 overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg font-medium mb-2">
                {searchTerm ? "No records match your search" : "No medical records yet"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-violet-600 hover:text-violet-700 font-medium text-sm underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
                    <th className="p-4 text-left text-violet-900 font-semibold">Record #</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Patient</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Diagnosis</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Prescription</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Date</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.recordId}
                      className="border-b border-violet-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-transparent transition-all duration-200"
                    >
                      <td className="p-4 font-bold text-violet-700">
                        #{record.recordId}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {record.patientName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{record.patientName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700">{record.diagnosis}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700">{record.prescription}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-gray-800 font-medium">
                            {new Date(record.recordCreatedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(record.recordCreatedDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

// =======================
// RecordDetailModal Component
// =======================
function RecordDetailModal({ record, onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Medical Record #{record.recordId}</h2>
            <p className="text-violet-100 text-sm">Detailed patient information</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 hover:rotate-90"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {record.patientName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{record.patientName}</h3>
                  <p className="text-gray-600 text-sm">Patient</p>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-violet-600">🔬</span>
                Diagnosis
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{record.diagnosis}</p>
              </div>
            </div>

            {/* Prescription */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-purple-600">💊</span>
                Prescription
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{record.prescription}</p>
              </div>
            </div>

            {/* Date */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-violet-600">📅</span>
                Record Date
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700">
                  {new Date(record.recordCreatedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(record.recordCreatedDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-t border-violet-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicalRecords;