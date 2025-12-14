import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

// Helper function to format time to 12-hour with AM/PM
const formatTime = (time) => {
  if (!time) return "—";
  
  // Handle if time is already a string in HH:MM format
  const [hours, minutes] = time.split(':').map(Number);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
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

// Helper function to get priority badge
const getPriorityBadge = (priority) => {
  if (!priority) return <span className="text-gray-400 text-sm">—</span>;
  
  const isPriority = priority.toLowerCase().includes('pregnant') || 
                    priority.toLowerCase().includes('senior') || 
                    priority.toLowerCase().includes('pwd') || 
                    priority.toLowerCase().includes('infant');
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
      isPriority 
        ? 'bg-red-100 text-red-700 border border-red-300' 
        : 'bg-blue-100 text-blue-700 border border-blue-300'
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
      console.log("📊 Raw appointments data:", data);
      const mapped = (data || []).map(appt => {
        return { 
          ...appt, 
          firstName: appt.firstName || "", 
          middleName: appt.middleName || "", 
          lastName: appt.lastName || "", 
          suffix: appt.suffix || "", 
          gender: appt.gender || "", 
          dateOfBirth: appt.dateOfBirth || "", 
          civilStatus: appt.civilStatus || "", 
          contactNumber: appt.contactNumber || "", 
          email: appt.email || "", 
          emergencyContactNumber: appt.emergencyContactNumber || "", 
          addressStreet: appt.addressStreet || "", 
          addressBarangay: appt.addressBarangay || "", 
          addressMunicipality: appt.addressMunicipality || "", 
          addressProvince: appt.addressProvince || "", 
          priorityCategory: appt.priorityCategory || "", 
          height: appt.height || "", 
          weight: appt.weight || "", 
          bloodType: appt.bloodType || "", 
          medicalHistory: appt.medicalHistory || "", 
          healthConcern: appt.healthConcern || "", 
          date: appt.date || "",
          time: appt.time || "" 
        };
      });
      console.log("✅ Mapped appointments:", mapped);
      setAppointments(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  useStompWebSocket(["/topic/private/appointments"], (msg) => {
    if (msg.type === "appointments-update" && Array.isArray(msg.data)) {
      console.log("📡 WebSocket update received:", msg.data);
      const mapped = msg.data.map(appt => ({ 
        ...appt, 
        firstName: appt.firstName || "", 
        middleName: appt.middleName || "", 
        lastName: appt.lastName || "", 
        suffix: appt.suffix || "", 
        gender: appt.gender || "", 
        dateOfBirth: appt.dateOfBirth || "", 
        civilStatus: appt.civilStatus || "", 
        contactNumber: appt.contactNumber || "", 
        email: appt.email || "", 
        emergencyContactNumber: appt.emergencyContactNumber || "", 
        addressStreet: appt.addressStreet || "", 
        addressBarangay: appt.addressBarangay || "", 
        addressMunicipality: appt.addressMunicipality || "", 
        addressProvince: appt.addressProvince || "", 
        priorityCategory: appt.priorityCategory || "", 
        height: appt.height || "", 
        weight: appt.weight || "", 
        bloodType: appt.bloodType || "", 
        medicalHistory: appt.medicalHistory || "", 
        healthConcern: appt.healthConcern || "", 
        date: appt.date || "",
        time: appt.time || "" 
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
    console.log("🔄 Opening reschedule modal for:", appt);
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
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rescheduleData)
        }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="text-violet-700 text-xl font-semibold">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-red-500 max-w-md">
          <div className="flex items-center gap-4">
            <div className="text-red-500 text-3xl">⚠️</div>
            <div>
              <h3 className="text-red-700 text-xl font-bold mb-1">Error Loading Data</h3>
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
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-3">
            Appointments Management
          </h1>
          <p className="text-gray-600 text-lg">Track, manage, and approve patient appointments</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard 
            title="All" 
            count={statusCounts.all} 
            icon="📋" 
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
            title="Rescheduling" 
            count={statusCounts.rescheduling} 
            icon="🔄" 
            gradient="from-blue-500 to-cyan-600" 
            isActive={filterStatus === "Rescheduling"} 
            onClick={() => setFilterStatus("Rescheduling")} 
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
          <div className="relative">
            <input 
              type="text" 
              placeholder="🔍 Search by patient name or email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full p-4 pr-12 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-lg"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-violet-100">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-7xl mb-6">📅</div>
              <p className="text-gray-500 text-xl font-medium">No appointments found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100 border-b-2 border-violet-200">
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Patient</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Age</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Priority</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Contact</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Date</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Time</th>
                    <th className="p-5 text-center text-violet-900 font-bold text-sm uppercase tracking-wider">Status</th>
                    <th className="p-5 text-center text-violet-900 font-bold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a, idx) => {
                    const name = [a.firstName, a.middleName, a.lastName, a.suffix].filter(Boolean).join(' ') || "Unknown";
                    const age = calculateAge(a.dateOfBirth);
                    const isPending = a.status === "Pending";
                    const isConfirmed = a.status === "Confirmed";
                    const isRescheduling = a.status === "Rescheduling";
                    const isProcessing = processingId === a.appointmentId;
                    
                    return (
                      <tr 
                        key={a.appointmentId} 
                        className={`border-b border-gray-100 hover:bg-violet-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{name}</div>
                              <div className="text-xs text-gray-500">{a.email || "—"}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-5">
                          <span className="text-gray-700 font-medium">{age} years</span>
                        </td>
                        
                        <td className="p-5">
                          {getPriorityBadge(a.priorityCategory)}
                        </td>
                        
                        <td className="p-5">
                          <div className="text-sm text-gray-700">{a.contactNumber || "—"}</div>
                        </td>
                        
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-gray-800 font-medium">
                            <span>📅</span>
                            <span>
                              {a.date ? new Date(a.date).toLocaleDateString("en-US", { 
                                month: "short", 
                                day: "numeric", 
                                year: "numeric" 
                              }) : "No Date"}
                            </span>
                          </div>
                        </td>
                        
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <span>🕐</span>
                            <span>{formatTime(a.time)}</span>
                          </div>
                        </td>
                        
                        <td className="p-5 text-center">
                          <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold shadow-sm ${
                            a.status === "Confirmed" ? "bg-green-100 text-green-700 border border-green-300" : 
                            a.status === "Pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" : 
                            a.status === "Rescheduling" ? "bg-blue-100 text-blue-700 border border-blue-300" : 
                            a.status === "Cancelled" ? "bg-red-100 text-red-700 border border-red-300" : 
                            "bg-gray-100 text-gray-700 border border-gray-300"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        
                        <td className="p-5">
                          <div className="flex gap-2 justify-center flex-wrap">
                            {isPending && (
                              <button 
                                onClick={() => handleApproveAppointment(a.appointmentId)} 
                                disabled={isProcessing} 
                                className="group relative px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve Appointment"
                              >
                                ✓
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  Approve Appointment
                                </span>
                              </button>
                            )}
                            
                            {(isPending || isConfirmed || isRescheduling) && (
                              <>
                                <button 
                                  onClick={() => handleRescheduleClick(a)} 
                                  disabled={isProcessing}
                                  className="group relative px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                  title="Reschedule Appointment"
                                >
                                  🔄
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    Reschedule Appointment
                                  </span>
                                </button>
                                
                                <button 
                                  onClick={() => handleCancelAppointment(a.appointmentId)} 
                                  disabled={isProcessing}
                                  className="group relative px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                  title="Cancel Appointment"
                                >
                                  ✕
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    Cancel Appointment
                                  </span>
                                </button>
                              </>
                            )}
                            
                            <button 
                              onClick={() => setSelectedAppointment(a)} 
                              className="group relative px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                              title="View Details"
                            >
                              👁
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                View Details
                              </span>
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

      {/* Modals */}
      {selectedAppointment && !showRescheduleModal && (
        <AppointmentDetailModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
          onApprove={handleApproveAppointment} 
          onCancel={handleCancelAppointment} 
          onReschedule={handleRescheduleClick} 
          processingId={processingId} 
        />
      )}
      
      {showRescheduleModal && (
        <RescheduleModal 
          appointment={selectedAppointment} 
          rescheduleData={rescheduleData} 
          setRescheduleData={setRescheduleData} 
          onSubmit={handleRescheduleSubmit} 
          onClose={() => { 
            setShowRescheduleModal(false); 
            setSelectedAppointment(null); 
          }} 
          isProcessing={processingId === selectedAppointment?.appointmentId} 
        />
      )}
    </div>
  );
}

function StatCard({ title, count, icon, gradient, isActive, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className={`p-5 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive 
          ? `bg-gradient-to-br ${gradient} text-white shadow-xl scale-105 transform` 
          : "bg-white hover:shadow-xl hover:scale-102"
      } border-2 ${isActive ? "border-transparent" : "border-violet-200 hover:border-violet-300"}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm mb-2 font-medium ${isActive ? "text-white" : "text-gray-600"}`}>
            {title}
          </p>
          <p className="text-4xl font-bold">{count}</p>
        </div>
        <div className={`text-4xl ${isActive ? "opacity-30" : "opacity-20"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function AppointmentDetailModal({ appointment, onClose, onApprove, onCancel, onReschedule, processingId }) {
  const name = [appointment.firstName, appointment.middleName, appointment.lastName, appointment.suffix].filter(Boolean).join(' ') || "Unknown";
  const address = [appointment.addressStreet, appointment.addressBarangay, appointment.addressMunicipality, appointment.addressProvince].filter(Boolean).join(', ') || "—";
  const isPending = appointment.status === "Pending";
  const isRescheduling = appointment.status === "Rescheduling";
  const isProcessing = processingId === appointment.appointmentId;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex justify-between items-center sticky top-0 z-10 rounded-t-3xl">
          <div>
            <h2 className="text-3xl font-bold mb-1">Patient Details</h2>
            <p className="text-violet-100">Appointment ID: #{appointment.appointmentId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Personal Information */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-violet-900">
              <span>👤</span> Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoField label="Full Name" value={name} />
              <InfoField label="Gender" value={appointment.gender || "—"} />
              <InfoField label="Date of Birth" value={appointment.dateOfBirth ? new Date(appointment.dateOfBirth).toLocaleDateString() : "—"} />
              <InfoField label="Age" value={`${calculateAge(appointment.dateOfBirth)} years`} />
              <InfoField label="Civil Status" value={appointment.civilStatus || "—"} />
              <div>
                <p className="text-sm text-gray-600 mb-1">Priority Category</p>
                {getPriorityBadge(appointment.priorityCategory)}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <span>📞</span> Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoField label="Phone Number" value={appointment.contactNumber || "—"} />
              <InfoField label="Email Address" value={appointment.email || "—"} />
              <div className="md:col-span-2">
                <InfoField label="Emergency Contact" value={appointment.emergencyContactNumber || "—"} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <span>📍</span> Address
            </h3>
            <p className="text-gray-700">{address}</p>
          </div>

          {/* Medical Information */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900">
              <span>🩺</span> Medical Information
            </h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <InfoField label="Height" value={appointment.height ? `${appointment.height} cm` : "—"} />
                <InfoField label="Weight" value={appointment.weight ? `${appointment.weight} kg` : "—"} />
                <InfoField label="Blood Type" value={appointment.bloodType || "—"} />
              </div>
              <InfoField label="Medical History" value={appointment.medicalHistory || "None recorded"} />
              <InfoField label="Health Concern" value={appointment.healthConcern || "—"} />
            </div>
          </div>

          {/* Appointment Schedule */}
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-900">
              <span>📅</span> Appointment Schedule
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-lg text-gray-800 font-medium">
                  {appointment.date ? new Date(appointment.date).toLocaleDateString("en-US", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  }) : "No scheduled date"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Time</p>
                <p className="text-lg text-gray-800 font-medium flex items-center gap-2">
                  <span>🕐</span>
                  <span>{formatTime(appointment.time)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-8 py-6 flex gap-3 justify-end sticky bottom-0 border-t-2 border-violet-200 rounded-b-3xl flex-wrap">
          {isPending && (
            <button 
              onClick={() => { onApprove(appointment.appointmentId); onClose(); }} 
              disabled={isProcessing} 
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              ✓ Approve Appointment
            </button>
          )}
          
          <button 
            onClick={() => { onReschedule(appointment); onClose(); }} 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            🔄 Reschedule
          </button>
          
          <button 
            onClick={() => { onCancel(appointment.appointmentId); onClose(); }} 
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            ✕ Cancel Appointment
          </button>
          
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
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
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function RescheduleModal({ appointment, rescheduleData, setRescheduleData, onSubmit, onClose, isProcessing }) {
  const name = [appointment.firstName, appointment.middleName, appointment.lastName].filter(Boolean).join(' ');
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
          <h2 className="text-3xl font-bold mb-2">Reschedule Appointment</h2>
          <p className="text-blue-100">Patient: {name}</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-blue-900 mb-1">Current Appointment</p>
            <p className="text-gray-700">
              📅 {appointment.date ? new Date(appointment.date).toLocaleDateString("en-US", { 
                weekday: "long", 
                month: "long", 
                day: "numeric", 
                year: "numeric" 
              }) : "No Date"} 
              {appointment.time && ` • 🕐 ${formatTime(appointment.time)}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">New Date *</label>
            <input 
              type="date" 
              value={rescheduleData.date} 
              onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))} 
              min={new Date().toISOString().split('T')[0]} 
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">New Time *</label>
            <input 
              type="time" 
              value={rescheduleData.time} 
              onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))} 
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-lg"
            />
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-yellow-900 mb-1">Important Note</p>
                <p className="text-sm text-yellow-800">
                  The appointment will be moved to "Rescheduling" status and require re-approval. 
                  The patient will receive an email notification with the new schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 flex gap-3 justify-end border-t-2 border-gray-200 rounded-b-3xl">
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onSubmit} 
            disabled={isProcessing} 
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "✓ Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appointments;