import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get full name
  const getFullName = (appointment) => {
    const parts = [
      appointment.firstName,
      appointment.middleName,
      appointment.lastName
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unknown';
  };

  // Load appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/patient/appointments");
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // WebSocket for real-time updates
  useStompWebSocket(["/topic/public/appointments", "/topic/private/appointments"], (msg) => {
    if (msg.type === "appointments-update") {
      setAppointments(msg.data);
    }
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const fullName = getFullName(apt);
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.toLowerCase().includes(searchLower) ||
      apt.contactNumber?.includes(searchTerm) ||
      apt.status?.toLowerCase().includes(searchLower) ||
      apt.healthConcern?.toLowerCase().includes(searchLower)
    );
  });

  // Get appointment counts by status
  const getStatusCount = (status) => {
    return appointments.filter(apt => apt.status === status).length;
  };

  // Action handlers
  const handleApprove = async (appointment) => {
    try {
      await fetchWithAuth(`/api/patient/appointments/${appointment.appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...appointment,
          status: 'Confirmed',
          confirmedDate: new Date().toISOString()
        })
      });
      loadAppointments();
    } catch (err) {
      alert('Error approving appointment: ' + err.message);
    }
  };

  const handleCancel = async (appointment) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await fetchWithAuth(`/api/patient/appointments/${appointment.appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...appointment,
          status: 'Cancelled'
        })
      });
      loadAppointments();
    } catch (err) {
      alert('Error cancelling appointment: ' + err.message);
    }
  };

  const handleViewDetails = async (appointment) => {
    try {
      const details = await fetchWithAuth(`/api/patient/appointments/${appointment.appointmentId}/details`);
      setSelectedAppointment(details);
      setShowDetailsModal(true);
    } catch (err) {
      alert('Error loading appointment details: ' + err.message);
    }
  };

  // Loading state
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

  // Error state
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

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold mb-1">{appointments.length}</div>
            <div className="text-violet-100 text-sm">All</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="text-3xl font-bold text-green-600 mb-1">{getStatusCount('Confirmed')}</div>
            <div className="text-gray-600 text-sm">Confirmed</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{getStatusCount('Pending')}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="text-3xl font-bold text-blue-600 mb-1">{getStatusCount('Rescheduling')}</div>
            <div className="text-gray-600 text-sm">Rescheduling</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-violet-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient name or email..."
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
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-violet-100 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg font-medium mb-2">
                {searchTerm ? "No appointments match your search" : "No appointments yet"}
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
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
                    <th className="p-4 text-left text-violet-900 font-semibold">Patient</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Age</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Contact</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Date</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Time</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Status</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const age = calculateAge(appointment.dateOfBirth);
                    const fullName = getFullName(appointment);
                    
                    return (
                      <tr
                        key={appointment.appointmentId}
                        className="border-b border-violet-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-transparent transition-all duration-200"
                      >
                        {/* Patient */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{fullName}</span>
                          </div>
                        </td>

                        {/* Age */}
                        <td className="p-4">
                          <span className="text-gray-700">
                            {age !== null ? `${age} years` : "—"}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="p-4">
                          <span className="text-gray-700">
                            {appointment.contactNumber || "—"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>📅</span>
                            <span>
                              {appointment.date 
                                ? new Date(appointment.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : "—"
                              }
                            </span>
                          </div>
                        </td>

                        {/* Time */}
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>🕐</span>
                            <span>{appointment.time || "—"}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            appointment.status === 'Rescheduling' ? 'bg-blue-100 text-blue-700' :
                            appointment.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            {appointment.status === 'Pending' && (
                              <button
                                onClick={() => handleApprove(appointment)}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium"
                              >
                                ✓ Approve
                              </button>
                            )}
                            {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                              <>
                                <button
                                  onClick={() => alert('Reschedule feature coming soon!')}
                                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium"
                                >
                                  🔄 Reschedule
                                </button>
                                <button
                                  onClick={() => handleCancel(appointment)}
                                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium"
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleViewDetails(appointment)}
                              className="px-3 py-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all duration-200 text-sm font-medium"
                            >
                              👁 View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}

// Details Modal Component
function AppointmentDetailsModal({ appointment, onClose }) {
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(appointment.dateOfBirth);
  const fullName = [appointment.firstName, appointment.middleName, appointment.lastName]
    .filter(Boolean).join(' ');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Appointment Details</h2>
            <p className="text-violet-100 text-sm">Complete patient information</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Info */}
            <div className="col-span-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="text-gray-800 font-medium">{fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="text-gray-800 font-medium">{age !== null ? `${age} years` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gender</p>
                  <p className="text-gray-800 font-medium">{appointment.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Blood Type</p>
                  <p className="text-gray-800 font-medium">{appointment.bloodType || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                  <p className="text-gray-800 font-medium">{appointment.contactNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-gray-800 font-medium">{appointment.email || "—"}</p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-gray-800 font-medium">
                    {appointment.date 
                      ? new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "—"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="text-gray-800 font-medium">{appointment.time || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Health Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Health Concern</p>
                  <p className="text-gray-800">{appointment.healthConcern || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Medical History</p>
                  <p className="text-gray-800">{appointment.medicalHistory || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>  
  );
}

export default Appointments;