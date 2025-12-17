import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
};

const calculateAge = (dob) => {
  if (!dob) return "—";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  )
    age--;
  return age;
};

const getPriorityBadge = (priority) => {
  if (!priority) return <span className="text-gray-400 text-sm">—</span>;
  const isPriority =
    priority.toLowerCase().includes("pregnant") ||
    priority.toLowerCase().includes("senior") ||
    priority.toLowerCase().includes("pwd") ||
    priority.toLowerCase().includes("infant");
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isPriority
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-blue-50 text-blue-700 border border-blue-200"
      }`}
    >
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
      const mapped = (data || []).map((appt) => ({
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
        time: appt.time || "",
      }));
      setAppointments(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleNoDoctorAvailable = async (id) => {
    if (
      !window.confirm(
        "Notify patient that no doctor is available on their chosen date?"
      )
    )
      return;
    try {
      setProcessingId(id);
      const res = await fetchWithAuth(
        `/api/appointments/${id}/no-doctor-available`,
        { method: "POST" }
      );
      alert(
        res.status === "success"
          ? "✅ Patient notified about doctor unavailability!"
          : "⚠️ " + res.message
      );
    } catch (err) {
      alert("❌ Failed to send notification: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };
  useEffect(() => {
    loadAppointments();
  }, []);

   useStompWebSocket(["/topic/private/appointments", "/topic/public/appointments"], (msg) => {
    console.log("📨 WebSocket message received:", msg);
    
    if (msg && typeof msg === 'object') {
      // Handle appointments-update message
      if (msg.type === "appointments-update" && Array.isArray(msg.data)) {
        const mapped = msg.data.map((appt) => ({
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
          time: appt.time || "",
        }));
        setAppointments(mapped);
        console.log("✅ Updated appointments from WebSocket:", mapped.length);
      }
      // Handle direct array data
      else if (Array.isArray(msg.data)) {
        const mapped = msg.data.map((appt) => ({
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
          time: appt.time || "",
        }));
        setAppointments(mapped);
        console.log("✅ Updated appointments from direct array:", mapped.length);
      }
      // Fallback: reload data
      else {
        console.log("🔄 Unknown message format, reloading...");
        loadAppointments();
      }
    }
  });
  
  const handleApproveAppointment = async (id) => {
  if (!window.confirm("Approve this appointment and send confirmation email?")) return;
  try {
    setProcessingId(id);
    const res = await fetchWithAuth(`/api/appointments/${id}/approve`, {
      method: "POST",
    });
    
    if (res.status === "success") {
      alert("✅ Appointment approved successfully!");
    
      await loadAppointments();
    } else {
      alert("⚠️ " + res.message);
    }
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
    const res = await fetchWithAuth(`/api/appointments/${id}/cancel`, {
      method: "POST",
    });
    alert(
      res.status === "success"
      
        ? "✅ Appointment cancelled successfully! Dashboard will update automatically."
        : "⚠️ " + res.message
    );
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
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rescheduleData),
        }
      );
      if (res.status === "success") {
        alert(
          "✅ Appointment rescheduled! Patient will be notified via email."
          
        );
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

  const handleCompleteAppointment = async (id) => {
  if (!window.confirm("Mark this appointment as completed?")) return;
  try {
    setProcessingId(id);
    console.log("Attempting to complete appointment:", id);
    const res = await fetchWithAuth(`/api/appointments/${id}/complete`, {
      method: "POST",
    });
    console.log("Complete response:", res);

    if (res && res.status === "success") {
      alert("✅ Appointment marked as completed! Dashboard will update automatically.");
      await loadAppointments(); // Reload appointments list
    } else {
      alert("⚠️ " + (res?.message || "Unknown error occurred"));
    }
  } catch (err) {
    console.error("Complete appointment error:", err);
    alert("❌ Failed to complete appointment: " + err.message);
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
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    rescheduling: appointments.filter((a) => a.status === "Rescheduling")
      .length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length,
    completed: appointments.filter((a) => a.status === "Completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#503878] border-t-transparent mb-4"></div>
          <p className="text-gray-700 text-xl font-medium">
            Loading appointments...
          </p>
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
              <h3 className="text-red-700 text-xl font-semibold mb-1">
                Error Loading Data
              </h3>
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
          <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#5996EC] to-[#4785DB] bg-clip-text text-transparent mb-2">
            Appointments Management
          </h1>
          <p className="text-gray-500 text-base">
            Track, manage, and approve patient appointments
          </p>
        </div>

        <div className="grid grid-cols-6 gap-4 mb-8">
  <StatCard
    title="All"
    count={statusCounts.all}
    icon="📋"
    isActive={filterStatus === "All"}
    onClick={() => setFilterStatus("All")}
  />
  <StatCard
    title="Confirmed"
    count={statusCounts.confirmed}
    icon="✅"
    isActive={filterStatus === "Confirmed"}
    onClick={() => setFilterStatus("Confirmed")}
  />
  <StatCard
    title="Pending"
    count={statusCounts.pending}
    icon="⏳"
    isActive={filterStatus === "Pending"}
    onClick={() => setFilterStatus("Pending")}
  />
  <StatCard
    title="Rescheduling"
    count={statusCounts.rescheduling}
    icon="🔄"
    isActive={filterStatus === "Rescheduling"}
    onClick={() => setFilterStatus("Rescheduling")}
  />
  <StatCard
    title="Cancelled"
    count={statusCounts.cancelled}
    icon="❌"
    isActive={filterStatus === "Cancelled"}
    onClick={() => setFilterStatus("Cancelled")}
  />
  <StatCard
    title="Completed"
    count={statusCounts.completed}
    icon="✔️"
    isActive={filterStatus === "Completed"}
    onClick={() => setFilterStatus("Completed")}
  />
</div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="🔍 Search by patient name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && setSearchTerm(searchTerm)}
              className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#503878] focus:ring-2 focus:ring-purple-100 transition-all text-gray-800 placeholder:text-gray-400"
            />
            <button
              onClick={() => setSearchTerm(searchTerm)}
              className="px-8 py-4 bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                className="w-5 h-5"
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
          handleCompleteAppointment={handleCompleteAppointment}
          setSelectedAppointment={setSelectedAppointment}
        />
      </div>

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


function StatCard({ title, count, icon, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
        isActive
          ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white border-transparent shadow-lg"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-center gap-3">
        <div>
          <p
            className={`text-xs mb-1 font-medium ${
              isActive ? "text-white/90" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p className="text-2xl font-semibold">{count}</p>
        </div>
        <div className={`text-2xl ${isActive ? "opacity-30" : "opacity-20"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function AppointmentsTable({
  filteredAppointments,
  processingId,
  handleApproveAppointment,
  handleCancelAppointment,
  handleRescheduleClick,
  handleNoDoctorAvailable,
  handleCompleteAppointment,
  setSelectedAppointment,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-xl font-medium">
            No appointments found
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or search
          </p>
        </div>
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-5 text-left text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Patient
                </th>
                <th className="p-5 text-left text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Age
                </th>
                <th className="p-5 text-left text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Priority
                </th>
                <th className="p-5 text-left text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Contact
                </th>
                <th className="p-5 text-left text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Date
                </th>
                <th className="p-5 text-left text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Time
                </th>
                <th className="p-5 text-center text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Status
                </th>
                <th className="p-5 text-center text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => {
                const name =
                  [a.firstName, a.middleName, a.lastName, a.suffix]
                    .filter(Boolean)
                    .join(" ") || "Unknown";
                const age = calculateAge(a.dateOfBirth);
                const isPending = a.status === "Pending";
                const isConfirmed = a.status === "Confirmed";
                const isRescheduling = a.status === "Rescheduling";
                const isProcessing = processingId === a.appointmentId;

                return (
                  <tr
                    key={a.appointmentId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#5996EC] flex items-center justify-center text-white font-semibold shadow-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {a.email || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-gray-800 font-medium">
                        {age} years
                      </span>
                    </td>
                    <td className="p-5">
                      {getPriorityBadge(a.priorityCategory)}
                    </td>
                    <td className="p-5">
                      <div className="text-sm text-gray-800 font-medium">
                        {a.contactNumber || "—"}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-gray-800 font-medium">
                        {a.date
                          ? new Date(a.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No Date"}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-gray-800 font-medium">
                        {formatTime(a.time)}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
                          a.status === "Confirmed"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : a.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            : a.status === "Rescheduling"
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : a.status === "Cancelled"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 justify-center">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedAppointment(a)}
                          className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-200 relative group"
                          title="View Details"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            View Details
                          </span>
                        </button>

                        {/* Approve (Pending only) */}
                        {(isPending || isRescheduling) && (
                          <button
                            onClick={() => handleApproveAppointment(a.appointmentId)}
                            disabled={isProcessing}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 relative group"
                            title="Approve"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Approve
                            </span>
                          </button>
                        )}

                        {/* Reschedule */}
                        {(isPending || isConfirmed || isRescheduling) && (
                          <button
                            onClick={() => handleRescheduleClick(a)}
                            disabled={isProcessing}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 relative group"
                            title="Reschedule"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Reschedule
                            </span>
                          </button>
                        )}

                        {/* No Doctor Available */}
                        {(isPending || isConfirmed || isRescheduling) && (
                          <button
                            onClick={() => handleNoDoctorAvailable(a.appointmentId)}
                            disabled={isProcessing}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50 relative group"
                            title="No Doctor Available"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              No Doctor Available
                            </span>
                          </button>
                        )}

                        {/* Complete (Confirmed only) */}
                        {isConfirmed && (
                          <button
                            onClick={() => handleCompleteAppointment(a.appointmentId)}
                            disabled={isProcessing}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 disabled:opacity-50 relative group"
                            title="Complete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                              />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Mark Complete
                            </span>
                          </button>
                        )}

                        {/* Cancel */}
                        {(isPending || isConfirmed || isRescheduling) && (
                          <button
                            onClick={() => handleCancelAppointment(a.appointmentId)}
                            disabled={isProcessing}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 relative group"
                            title="Cancel"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Cancel Appointment
                            </span>
                          </button>
                        )}
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

function AppointmentDetailModal({
  appointment,
  onClose,
  onApprove,
  onCancel,
  onReschedule,
  processingId,
}) {
  const name =
    [
      appointment.firstName,
      appointment.middleName,
      appointment.lastName,
      appointment.suffix,
    ]
      .filter(Boolean)
      .join(" ") || "Unknown";
  const address =
    [
      appointment.addressStreet,
      appointment.addressBarangay,
      appointment.addressMunicipality,
      appointment.addressProvince,
    ]
      .filter(Boolean)
      .join(", ") || "—";
  const isPending = appointment.status === "Pending";
  const isConfirmed = appointment.status === "Confirmed"; // ADD THIS LINE
  const isRescheduling = appointment.status === "Rescheduling";
  const isProcessing = processingId === appointment.appointmentId;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-[1400px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white p-6 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-3xl font-semibold mb-1">Patient Details</h2>
            <p className="text-white/90 text-sm">
              ID: #{appointment.appointmentId}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-10 space-y-8 overflow-y-auto flex-1">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900">
              <span>👤</span> Personal Information
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Full Name" value={name} />
              <InfoField label="Gender" value={appointment.gender || "—"} />
              <InfoField
                label="Date of Birth"
                value={
                  appointment.dateOfBirth
                    ? new Date(appointment.dateOfBirth).toLocaleDateString()
                    : "—"
                }
              />
              <InfoField
                label="Age"
                value={`${calculateAge(appointment.dateOfBirth)} years`}
              />
              <InfoField
                label="Civil Status"
                value={appointment.civilStatus || "—"}
              />
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
              <InfoField
                label="Phone Number"
                value={appointment.contactNumber || "—"}
              />
              <InfoField
                label="Email Address"
                value={appointment.email || "—"}
              />
              <InfoField
                label="Emergency Contact"
                value={appointment.emergencyContactNumber || "—"}
              />
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
                <InfoField
                  label="Height"
                  value={appointment.height ? `${appointment.height} cm` : "—"}
                />
                <InfoField
                  label="Weight"
                  value={appointment.weight ? `${appointment.weight} kg` : "—"}
                />
                <InfoField
                  label="Blood Type"
                  value={appointment.bloodType || "—"}
                />
              </div>
              <InfoField
                label="Medical History"
                value={appointment.medicalHistory || "None recorded"}
              />
              <InfoField
                label="Health Concern"
                value={appointment.healthConcern || "—"}
              />
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
                  {appointment.date
                    ? new Date(appointment.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No scheduled date"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Time</p>
                <p className="text-lg text-gray-800 font-medium flex items-center gap-2">
                  <span>🕐</span>
                  <span>{formatTime(appointment.time)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="bg-gray-50 px-10 py-6 flex gap-3 justify-end flex-shrink-0 border-t border-gray-200">
          {isPending && (
            <button
              onClick={() => {
                onApprove(appointment.appointmentId);
                onClose();
              }}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              ✓ Approve
            </button>
          )}
          {(isPending || isConfirmed || isRescheduling) && (
            <>
              <button
                onClick={() => {
                  onReschedule(appointment);
                  onClose();
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-sm transition-all"
              >
                🔄 Reschedule
              </button>
              <button
                onClick={() => {
                  onCancel(appointment.appointmentId);
                  onClose();
                }}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-sm transition-all"
              >
                ✕ Cancel
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white rounded-lg font-semibold shadow-sm transition-all"
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
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className="text-gray-900 font-medium">{value || "—"}</p>
    </div>
  );
}


function RescheduleModal({
  appointment,
  rescheduleData,
  setRescheduleData,
  onSubmit,
  onClose,
  isProcessing,
  formatTime,
}) {
  const name = [
    appointment.firstName,
    appointment.middleName,
    appointment.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // Default formatTime function if not provided
  const defaultFormatTime = (time) => {
    if (!time) return "—";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatTimeFunc = formatTime || defaultFormatTime;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white p-6 flex-shrink-0">
          <h2 className="text-3xl font-semibold mb-2">
            Reschedule Appointment
          </h2>
          <p className="text-white/90">Patient: {name}</p>
        </div>

        {/* Scrollable Content */}
        <div className="p-10 space-y-8 overflow-y-auto flex-1">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-[#503878] mb-2">
              Current Appointment
            </p>
            <p className="text-gray-700">
              📅{" "}
              {appointment.date
                ? new Date(appointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No Date"}
              {appointment.time && ` • 🕐 ${formatTimeFunc(appointment.time)}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              New Date *
            </label>
            <input
              type="date"
              value={rescheduleData.date}
              onChange={(e) =>
                setRescheduleData((prev) => ({ ...prev, date: e.target.value }))
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[#503878] focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              New Time *
            </label>
            <input
              type="time"
              value={rescheduleData.time}
              onChange={(e) =>
                setRescheduleData((prev) => ({ ...prev, time: e.target.value }))
              }
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[#503878] focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
            />
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">
                  Important Note
                </p>
                <p className="text-sm text-yellow-800">
                  The appointment will be moved to "Rescheduling" status and
                  require re-approval. The patient will receive an email
                  notification with the new schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="bg-gray-50 px-10 py-6 flex gap-3 justify-end border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isProcessing}
            className="px-8 py-3 bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "✓ Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
