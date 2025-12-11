import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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

  // Filter appointments
  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = filterStatus === "All" || appt.status === filterStatus;
    const matchesSearch =
      appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get status counts
  const statusCounts = {
    all: appointments.length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="text-violet-700 text-xl font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="text-red-500 text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-600 text-lg font-bold mb-1">Error Loading Appointments</h3>
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
            Appointments
          </h1>
          <p className="text-gray-600">Manage and track patient appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="All"
            count={statusCounts.all}
            icon="📅"
            gradient="from-violet-500 to-purple-600"
            isActive={filterStatus === "All"}
            onClick={() => setFilterStatus("All")}
          />
          <StatCard
            title="Confirmed"
            count={statusCounts.confirmed}
            icon="✅"
            gradient="from-green-500 to-emerald-600"
            isActive={filterStatus === "Confirmed"}
            onClick={() => setFilterStatus("Confirmed")}
          />
          <StatCard
            title="Pending"
            count={statusCounts.pending}
            icon="⏳"
            gradient="from-yellow-500 to-orange-600"
            isActive={filterStatus === "Pending"}
            onClick={() => setFilterStatus("Pending")}
          />
          <StatCard
            title="Cancelled"
            count={statusCounts.cancelled}
            icon="❌"
            gradient="from-red-500 to-rose-600"
            isActive={filterStatus === "Cancelled"}
            onClick={() => setFilterStatus("Cancelled")}
          />
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-violet-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by patient or staff name..."
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
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Showing {filteredAppointments.length} of {appointments.length}
              </span>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-violet-100 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg font-medium mb-2">
                {searchTerm || filterStatus !== "All"
                  ? "No appointments match your filters"
                  : "No appointments scheduled yet"}
              </p>
              {(searchTerm || filterStatus !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("All");
                  }}
                  className="text-violet-600 hover:text-violet-700 font-medium text-sm underline mt-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
                    <th className="p-4 text-left text-violet-900 font-semibold">Patient</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Staff</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Date & Time</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Status</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((appt) => (
                    <tr
                      key={appt.appointmentId}
                      className="border-b border-violet-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-transparent transition-all duration-200"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {appt.patientName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-gray-800">
                            {appt.patientName || "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-violet-600">👨‍⚕️</span>
                          <span className="text-gray-700">{appt.staffName || "N/A"}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-gray-800 font-medium">
                            {appt.date
                              ? new Date(appt.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "No Date"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {appt.date
                              ? new Date(appt.date).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block
                          ${
                            appt.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : appt.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : appt.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        `}
                        >
                          {appt.status || "Pending"}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => setSelectedAppointment(appt)}
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

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

// =======================
// StatCard Component
// =======================
function StatCard({ title, count, icon, gradient, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl cursor-pointer
        transform transition-all duration-300
        ${
          isActive
            ? `bg-gradient-to-br ${gradient} text-white shadow-lg scale-105`
            : "bg-white text-gray-700 hover:shadow-lg hover:scale-105"
        }
        border-2 ${isActive ? "border-transparent" : "border-violet-200"}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${isActive ? "text-white" : "text-gray-600"}`}>
            {title}
          </p>
          <p className="text-3xl font-bold">{count}</p>
        </div>
        <div className={`text-3xl ${isActive ? "opacity-30" : "opacity-20"}`}>{icon}</div>
      </div>
    </div>
  );
}

// =======================
// AppointmentDetailModal Component
// =======================
function AppointmentDetailModal({ appointment, onClose }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

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
            <h2 className="text-2xl font-bold mb-1">Appointment Details</h2>
            <p className="text-violet-100 text-sm">ID: #{appointment.appointmentId}</p>
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
            {/* Status Badge */}
            <div className="flex justify-center">
              <span
                className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${getStatusColor(
                  appointment.status
                )}`}
              >
                {appointment.status || "Pending"}
              </span>
            </div>

            {/* Patient Info */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-violet-600">👤</span>
                Patient Information
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {appointment.patientName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{appointment.patientName || "Unknown"}</p>
                  <p className="text-gray-600 text-sm">Patient</p>
                </div>
              </div>
            </div>

            {/* Staff Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-purple-600">👨‍⚕️</span>
                Assigned Staff
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700 font-medium">{appointment.staffName || "Not assigned"}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-violet-600">📅</span>
                Appointment Date & Time
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                {appointment.date ? (
                  <>
                    <p className="text-gray-800 font-medium text-lg">
                      {new Date(appointment.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {new Date(appointment.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">No date specified</p>
                )}
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

export default Appointments;