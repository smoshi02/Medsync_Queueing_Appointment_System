import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
};

const calculateAge = (dob) => {
  if (!dob) return "—";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const getPriorityBadge = (priority) => {
  if (!priority) return <span className="text-gray-400 text-sm">—</span>;
  const isPriority = priority.toLowerCase().includes('pregnant') || 
                    priority.toLowerCase().includes('senior') || 
                    priority.toLowerCase().includes('pwd') || 
                    priority.toLowerCase().includes('infant');
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      isPriority ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
    }`}>
      {priority}
    </span>
  );
};

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/appointments");
      const mapped = (data || []).map(appt => ({
        ...appt, firstName: appt.firstName || "", middleName: appt.middleName || "", 
        lastName: appt.lastName || "", suffix: appt.suffix || "", gender: appt.gender || "", 
        dateOfBirth: appt.dateOfBirth || "", civilStatus: appt.civilStatus || "", 
        contactNumber: appt.contactNumber || "", email: appt.email || "", 
        emergencyContactNumber: appt.emergencyContactNumber || "", 
        addressStreet: appt.addressStreet || "", addressBarangay: appt.addressBarangay || "", 
        addressMunicipality: appt.addressMunicipality || "", addressProvince: appt.addressProvince || "", 
        priorityCategory: appt.priorityCategory || "", height: appt.height || "", 
        weight: appt.weight || "", bloodType: appt.bloodType || "", 
        medicalHistory: appt.medicalHistory || "", healthConcern: appt.healthConcern || "", 
        date: appt.date || "", time: appt.time || ""
      }));
      setAppointments(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleNoDoctorAvailable = async (id) => {
  if (!window.confirm("Notify patient that no doctor is available on their chosen date?")) return;
  try {
    setProcessingId(id);
    const res = await fetchWithAuth(`/api/appointments/${id}/no-doctor-available`, { method: "POST" });
    alert(res.status === "success" ? "✅ Patient notified about doctor unavailability!" : "⚠️ " + res.message);
  } catch (err) {
    alert("❌ Failed to send notification: " + err.message);
  } finally {
    setProcessingId(null);
  }
};
  useEffect(() => { loadAppointments(); }, []);

  useStompWebSocket(["/topic/private/appointments"], (msg) => {
    if (msg.type === "appointments-update" && Array.isArray(msg.data)) {
      const mapped = msg.data.map(appt => ({
        ...appt, firstName: appt.firstName || "", middleName: appt.middleName || "", 
        lastName: appt.lastName || "", suffix: appt.suffix || "", gender: appt.gender || "", 
        dateOfBirth: appt.dateOfBirth || "", civilStatus: appt.civilStatus || "", 
        contactNumber: appt.contactNumber || "", email: appt.email || "", 
        emergencyContactNumber: appt.emergencyContactNumber || "", 
        addressStreet: appt.addressStreet || "", addressBarangay: appt.addressBarangay || "", 
        addressMunicipality: appt.addressMunicipality || "", addressProvince: appt.addressProvince || "", 
        priorityCategory: appt.priorityCategory || "", height: appt.height || "", 
        weight: appt.weight || "", bloodType: appt.bloodType || "", 
        medicalHistory: appt.medicalHistory || "", healthConcern: appt.healthConcern || "", 
        date: appt.date || "", time: appt.time || ""
      }));
      setAppointments(mapped);
    }
  });

  const handleApproveAppointment = async (id) => {
    if (!window.confirm("Approve this appointment and send confirmation email?")) return;
    try {
      setProcessingId(id);
      const res = await fetchWithAuth(`/api/appointments/${id}/approve`, { method: "POST" });
      alert(res.status === "success" ? "✅ Appointment approved successfully!" : "⚠️ " + res.message);
    } catch (err) {
      alert("❌ Failed to approve: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      setProcessingId(id);
      const res = await fetchWithAuth(`/api/appointments/${id}/cancel`, { method: "POST" });
      alert(res.status === "success" ? "✅ Appointment cancelled successfully!" : "⚠️ " + res.message);
    } catch (err) {
      alert("❌ Failed to cancel: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRescheduleClick = (appt) => {
    setSelectedAppointment(appt);
    setRescheduleData({ date: appt.date || "", time: appt.time || "" });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      return alert("⚠️ Please select both date and time");
    }
    if (!window.confirm("Confirm rescheduling this appointment?")) return;
    try {
      setProcessingId(selectedAppointment.appointmentId);
      const res = await fetchWithAuth(
        `/api/appointments/${selectedAppointment.appointmentId}/reschedule`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rescheduleData) }
      );
      if (res.status === "success") {
        alert("✅ Appointment rescheduled! Patient will be notified via email.");
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
      } else {
        alert("⚠️ " + res.message);
      }
    } catch (err) {
      alert("❌ Failed to reschedule: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    const matchSearch = 
      a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === "Confirmed").length,
    pending: appointments.filter(a => a.status === "Pending").length,
    rescheduling: appointments.filter(a => a.status === "Rescheduling").length,
    cancelled: appointments.filter(a => a.status === "Cancelled").length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#503878] border-t-transparent mb-4"></div>
          <p className="text-gray-700 text-xl font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <div className="bg-red-50 p-8 rounded-xl border border-red-200 max-w-md">
          <div className="flex items-center gap-4">
            <div className="text-red-500 text-3xl">⚠️</div>
            <div>
              <h3 className="text-red-700 text-xl font-semibold mb-1">Error Loading Data</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 lg:p-10">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#503878] to-[#D946EF] bg-clip-text text-transparent mb-2">
            Appointments Management
          </h1>
          <p className="text-gray-500 text-base">Track, manage, and approve patient appointments</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="All" count={statusCounts.all} icon="📋" isActive={filterStatus === "All"} onClick={() => setFilterStatus("All")} />
          <StatCard title="Confirmed" count={statusCounts.confirmed} icon="✅" isActive={filterStatus === "Confirmed"} onClick={() => setFilterStatus("Confirmed")} />
          <StatCard title="Pending" count={statusCounts.pending} icon="⏳" isActive={filterStatus === "Pending"} onClick={() => setFilterStatus("Pending")} />
          <StatCard title="Rescheduling" count={statusCounts.rescheduling} icon="🔄" isActive={filterStatus === "Rescheduling"} onClick={() => setFilterStatus("Rescheduling")} />
          <StatCard title="Cancelled" count={statusCounts.cancelled} icon="❌" isActive={filterStatus === "Cancelled"} onClick={() => setFilterStatus("Cancelled")} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex gap-3">
            <input type="text" placeholder="🔍 Search by patient name or email..." value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && setSearchTerm(searchTerm)}
              className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#503878] focus:ring-2 focus:ring-purple-100 transition-all text-gray-800 placeholder:text-gray-400"
            />
            <button 
              onClick={() => setSearchTerm(searchTerm)}
              className="px-8 py-4 bg-gradient-to-r from-[#503878] to-[#D946EF] text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>

        <AppointmentsTable 
          filteredAppointments={filteredAppointments}
          processingId={processingId}
          handleApproveAppointment={handleApproveAppointment}
          handleCancelAppointment={handleCancelAppointment}
          handleRescheduleClick={handleRescheduleClick}
          handleNoDoctorAvailable={handleNoDoctorAvailable}
          setSelectedAppointment={setSelectedAppointment}
        />
      </div>

      {selectedAppointment && !showRescheduleModal && (
        <AppointmentDetailModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} 
          onApprove={handleApproveAppointment} onCancel={handleCancelAppointment} 
          onReschedule={handleRescheduleClick} processingId={processingId} 
        />
      )}
      
      {showRescheduleModal && (
        <RescheduleModal appointment={selectedAppointment} rescheduleData={rescheduleData} 
          setRescheduleData={setRescheduleData} onSubmit={handleRescheduleSubmit} 
          onClose={() => { setShowRescheduleModal(false); setSelectedAppointment(null); }} 
          isProcessing={processingId === selectedAppointment?.appointmentId} 
        />
      )}
    </div>
  );
}

function StatCard({ title, count, icon, isActive, onClick }) {
  return (
    <div onClick={onClick} 
      className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
        isActive ? "bg-gradient-to-r from-[#503878] to-[#D946EF] text-white border-transparent shadow-lg" 
        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm mb-2 font-medium ${isActive ? "text-white/90" : "text-gray-600"}`}>{title}</p>
          <p className="text-3xl font-semibold">{count}</p>
        </div>
        <div className={`text-3xl ${isActive ? "opacity-30" : "opacity-20"}`}>{icon}</div>
      </div>
    </div>
  );
}

function AppointmentsTable({ filteredAppointments, processingId, handleApproveAppointment, handleCancelAppointment, handleRescheduleClick, handleNoDoctorAvailable, setSelectedAppointment }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-7xl mb-6">📅</div>
          <p className="text-gray-500 text-xl font-medium">No appointments found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <th className="p-5 text-left text-purple-900 font-semibold text-sm">👤 Patient</th>
                <th className="p-5 text-left text-blue-900 font-semibold text-sm">🎂 Age</th>
                <th className="p-5 text-left text-red-900 font-semibold text-sm">⭐ Priority</th>
                <th className="p-5 text-left text-green-900 font-semibold text-sm">📞 Contact</th>
                <th className="p-5 text-left text-indigo-900 font-semibold text-sm">📅 Date</th>
                <th className="p-5 text-left text-amber-900 font-semibold text-sm">🕐 Time</th>
                <th className="p-5 text-center text-cyan-900 font-semibold text-sm">📊 Status</th>
                <th className="p-5 text-center text-gray-900 font-semibold text-sm">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => {
                const name = [a.firstName, a.middleName, a.lastName, a.suffix].filter(Boolean).join(' ') || "Unknown";
                const age = calculateAge(a.dateOfBirth);
                const isPending = a.status === "Pending";
                const isConfirmed = a.status === "Confirmed";
                const isRescheduling = a.status === "Rescheduling";
                const isProcessing = processingId === a.appointmentId;
                
                return (
                  <tr key={a.appointmentId} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-all">
                    <td className="p-5 bg-purple-50/20">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{name}</div>
                          <div className="text-xs text-gray-500">{a.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 bg-blue-50/20">
                      <span className="text-blue-800 font-medium">{age} years</span>
                    </td>
                    <td className="p-5 bg-red-50/20">{getPriorityBadge(a.priorityCategory)}</td>
                    <td className="p-5 bg-green-50/20">
                      <div className="text-sm text-green-800 font-medium">{a.contactNumber || "—"}</div>
                    </td>
                    <td className="p-5 bg-indigo-50/20">
                      <div className="flex items-center gap-2 text-indigo-800 font-medium">
                        <span>📅</span>
                        <span>{a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No Date"}</span>
                      </div>
                    </td>
                    <td className="p-5 bg-amber-50/20">
                      <div className="flex items-center gap-2 text-amber-800 font-medium">
                        <span>🕐</span>
                        <span>{formatTime(a.time)}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center bg-cyan-50/20">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
                        a.status === "Confirmed" ? "bg-green-100 text-green-800 border border-green-300" : 
                        a.status === "Pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" : 
                        a.status === "Rescheduling" ? "bg-blue-100 text-blue-800 border border-blue-300" : 
                        a.status === "Cancelled" ? "bg-red-100 text-red-800 border border-red-300" : "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}>{a.status}</span>
                    </td>
                    <td className="p-5 bg-gray-50/20">
                      <div className="flex gap-2 justify-center flex-wrap">
                        {isPending && (
                          <button onClick={() => handleApproveAppointment(a.appointmentId)} disabled={isProcessing} 
                            className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all disabled:opacity-50" 
                            title="Approve">
                            ✅ Approve
                          </button>
                        )}
                        {(isPending || isConfirmed || isRescheduling) && (
                          <>
                            <button onClick={() => handleNoDoctorAvailable(a.appointmentId)} disabled={isProcessing}
                              className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all disabled:opacity-50" 
                              title="No Doctor Available">
                              🚫 No Doctor
                            </button>
                            <button onClick={() => handleRescheduleClick(a)} disabled={isProcessing}
                              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all disabled:opacity-50" 
                              title="Reschedule">
                              🔄 Reschedule
                            </button>
                            <button onClick={() => handleCancelAppointment(a.appointmentId)} disabled={isProcessing}
                              className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all disabled:opacity-50" 
                              title="Cancel">
                              ❌ Cancel
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedAppointment(a)} 
                          className="px-3 py-2 bg-gradient-to-r from-[#503878] to-[#D946EF] text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all" 
                          title="View Details">
                          👁️ View
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
  );
}

// PART 2 - MODAL COMPONENTS (FULL WIDTH)

function AppointmentDetailModal({ appointment, onClose, onApprove, onCancel, onReschedule, processingId }) {
  const name = [appointment.firstName, appointment.middleName, appointment.lastName, appointment.suffix].filter(Boolean).join(' ') || "Unknown";
  const address = [appointment.addressStreet, appointment.addressBarangay, appointment.addressMunicipality, appointment.addressProvince].filter(Boolean).join(', ') || "—";
  const isPending = appointment.status === "Pending";
  const isProcessing = processingId === appointment.appointmentId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-[1400px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#503878] to-[#D946EF] text-white p-6 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-3xl font-semibold mb-1">Patient Details</h2>
            <p className="text-white/90 text-sm">ID: #{appointment.appointmentId}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-all text-xl">✕</button>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900">
              <span>👤</span> Personal Information
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Full Name" value={name} />
              <InfoField label="Gender" value={appointment.gender || "—"} />
              <InfoField label="Date of Birth" value={appointment.dateOfBirth ? new Date(appointment.dateOfBirth).toLocaleDateString() : "—"} />
              <InfoField label="Age" value={`${calculateAge(appointment.dateOfBirth)} years`} />
              <InfoField label="Civil Status" value={appointment.civilStatus || "—"} />
              <div>
                <p className="text-sm text-gray-600 mb-2">Priority Category</p>
                {getPriorityBadge(appointment.priorityCategory)}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900">
              <span>📞</span> Contact Information
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Phone Number" value={appointment.contactNumber || "—"} />
              <InfoField label="Email Address" value={appointment.email || "—"} />
              <InfoField label="Emergency Contact" value={appointment.emergencyContactNumber || "—"} />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <span>📍</span> Address
            </h3>
            <p className="text-gray-700">{address}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-900">
              <span>🩺</span> Medical Information
            </h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <InfoField label="Height" value={appointment.height ? `${appointment.height} cm` : "—"} />
                <InfoField label="Weight" value={appointment.weight ? `${appointment.weight} kg` : "—"} />
                <InfoField label="Blood Type" value={appointment.bloodType || "—"} />
              </div>
              <InfoField label="Medical History" value={appointment.medicalHistory || "None recorded"} />
              <InfoField label="Health Concern" value={appointment.healthConcern || "—"} />
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-8 border border-green-200">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-green-900">
              <span>📅</span> Appointment Schedule
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Date</p>
                <p className="text-lg text-gray-800 font-medium">
                  {appointment.date ? new Date(appointment.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "No scheduled date"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Time</p>
                <p className="text-lg text-gray-800 font-medium flex items-center gap-2">
                  <span>🕐</span><span>{formatTime(appointment.time)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-10 py-6 flex gap-3 justify-end sticky bottom-0 border-t border-gray-200 rounded-b-2xl">
          {isPending && (
            <button onClick={() => { onApprove(appointment.appointmentId); onClose(); }} disabled={isProcessing} 
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50">
              ✓ Approve
            </button>
          )}
          <button onClick={() => { onReschedule(appointment); onClose(); }} 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-sm transition-all">
            🔄 Reschedule
          </button>
          <button onClick={() => { onCancel(appointment.appointmentId); onClose(); }} 
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-sm transition-all">
            ✕ Cancel
          </button>
          <button onClick={onClose} 
            className="px-6 py-3 bg-gradient-to-r from-[#503878] to-[#D946EF] text-white rounded-lg font-semibold shadow-sm transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function RescheduleModal({ appointment, rescheduleData, setRescheduleData, onSubmit, onClose, isProcessing }) {
  const name = [appointment.firstName, appointment.middleName, appointment.lastName].filter(Boolean).join(' ');
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#503878] to-[#D946EF] text-white p-6 rounded-t-2xl">
          <h2 className="text-3xl font-semibold mb-2">Reschedule Appointment</h2>
          <p className="text-white/90">Patient: {name}</p>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-[#503878] mb-2">Current Appointment</p>
            <p className="text-gray-700">
              📅 {appointment.date ? new Date(appointment.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "No Date"} 
              {appointment.time && ` • 🕐 ${formatTime(appointment.time)}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">New Date *</label>
            <input type="date" value={rescheduleData.date} 
              onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))} 
              min={new Date().toISOString().split('T')[0]} 
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[#503878] focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">New Time *</label>
            <input type="time" value={rescheduleData.time} 
              onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))} 
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[#503878] focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            />
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">Important Note</p>
                <p className="text-sm text-yellow-800">
                  The appointment will be moved to "Rescheduling" status and require re-approval. 
                  The patient will receive an email notification with the new schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-10 py-6 flex gap-3 justify-end border-t border-gray-200 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all">
            Cancel
          </button>
          <button onClick={onSubmit} disabled={isProcessing} 
            className="px-8 py-3 bg-gradient-to-r from-[#503878] to-[#D946EF] text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50">
            {isProcessing ? "Processing..." : "✓ Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appointments;