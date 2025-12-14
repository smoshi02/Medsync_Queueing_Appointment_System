import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "",
    dateOfBirth: "",
    civilStatus: "",
    contactNumber: "",
    email: "",
    emergencyContactNumber: "",
    addressStreet: "",
    addressBarangay: "",
    addressMunicipality: "",
    addressProvince: "",
    priorityCategory: "",
    height: "",
    weight: "",
    bloodType: "",
    medicalHistory: "",
    healthConcern: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  // WebSocket for real-time updates
  useEffect(() => {
    const socket = new SockJS("http://localhost:6969/ws/public");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
    });

    stompClient.onConnect = () => {
      console.log("✅ WebSocket Connected");
      setIsConnected(true);

      stompClient.subscribe("/topic/public/appointments", (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.log("📩 Received WebSocket message:", payload);

          if (payload.type === "appointments-update" && Array.isArray(payload.data)) {
            const enrichedAppointments = payload.data.map(appt => ({
              ...appt,
              firstName: appt.firstName || "",
              middleName: appt.middleName || "",
              lastName: appt.lastName || "",
              suffix: appt.suffix || "",
              dateOfBirth: appt.dateOfBirth || null,
              email: appt.email || "",
              contactNumber: appt.contactNumber || "",
              time: appt.time || "",
              status: appt.status || "Pending",
            }));

            console.log("✅ Updated appointments:", enrichedAppointments.length);
            setAppointments(enrichedAppointments);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      });
    };

    stompClient.onDisconnect = () => {
      console.log("❌ WebSocket Disconnected");
      setIsConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error("❌ STOMP Error:", frame);
      setIsConnected(false);
    };

    stompClient.activate();

    return () => {
      console.log("🔌 Cleaning up WebSocket connection");
      stompClient.deactivate();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "firstName", "lastName", "gender", "dateOfBirth", "civilStatus",
      "contactNumber", "email", "healthConcern", "addressStreet",
      "addressBarangay", "addressMunicipality", "addressProvince",
      "priorityCategory", "appointmentDate", "appointmentTime",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return;
      }
    }

    try {
      const submitData = {
        ...formData,
        height: formData.height || "",
        weight: formData.weight || "",
        dateOfBirth: formData.dateOfBirth,
        date: formData.appointmentDate,
        time: formData.appointmentTime,
      };

      console.log("📤 Submitting appointment:", submitData);

      const res = await fetch("http://localhost:6969/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save appointment: ${errorText}`);
      }

      console.log("✅ Appointment submitted successfully");

      setFormData({
        firstName: "", middleName: "", lastName: "", suffix: "", gender: "",
        dateOfBirth: "", civilStatus: "", contactNumber: "", email: "", emergencyContactNumber: "",
        addressStreet: "", addressBarangay: "", addressMunicipality: "", addressProvince: "",
        priorityCategory: "", height: "", weight: "", bloodType: "", medicalHistory: "", healthConcern: "",
        appointmentDate: "", appointmentTime: "",
      });
      setShowForm(false);
      alert("✅ Appointment scheduled successfully! It will appear in the list momentarily.");
    } catch (err) {
      console.error("❌ Error submitting appointment:", err);
      alert(err.message);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-3">
                Your Appointments
              </h1>
              <p className="text-gray-600 text-lg">Schedule and manage your healthcare appointments</p>
            </div>

            {/* WebSocket Connection Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-violet-100">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isConnected ? 'Live Updates Active' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-violet-100 overflow-hidden mb-8">
          {appointments.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-7xl mb-6">📅</div>
              <p className="text-gray-500 text-xl font-semibold mb-2">
                {isConnected
                  ? "No appointments scheduled yet"
                  : "Connecting to appointment system..."
                }
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {isConnected
                  ? "Click the button below to schedule your first appointment"
                  : "Please wait while we establish a connection"
                }
              </p>
              {isConnected && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">Real-time updates enabled</span>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100 border-b-2 border-violet-200">
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Patient Name</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Age</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Email</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Contact</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Date</th>
                    <th className="p-5 text-left text-violet-900 font-bold text-sm uppercase tracking-wider">Time</th>
                    <th className="p-5 text-center text-violet-900 font-bold text-sm uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt, idx) => {
                    const fullName = [appt.firstName, appt.middleName, appt.lastName, appt.suffix]
                      .filter(Boolean)
                      .join(' ') || appt.patientName || "Unknown";
                    const age = calculateAge(appt.dateOfBirth);

                    return (
                      <tr
                        key={appt.appointmentId || idx}
                        className={`border-b border-gray-100 hover:bg-violet-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800">{fullName}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className="text-gray-700 font-medium">{age} years</span>
                        </td>
                        <td className="p-5">
                          <span className="text-gray-600 text-sm">{appt.email || "—"}</span>
                        </td>
                        <td className="p-5">
                          <span className="text-gray-700">{appt.contactNumber || "—"}</span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-gray-800 font-medium">
                            <span>📅</span>
                            <span>
                              {appt.date
                                ? new Date(appt.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                                : "No Date"}
                            </span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <span>🕐</span>
                            <span>{appt.time || "—"}</span>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <span
                            className={`inline-block px-4 py-2 rounded-full text-xs font-bold shadow-sm
                            ${appt.status === "Confirmed"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : appt.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                  : appt.status === "Rescheduling"
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : appt.status === "Cancelled"
                                      ? "bg-red-100 text-red-700 border border-red-300"
                                      : "bg-gray-100 text-gray-700 border border-gray-300"
                              }`}
                          >
                            {appt.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New Appointment Button */}
        <button
          onClick={() => setShowForm(true)}
          disabled={!isConnected}
          className={`w-full md:w-auto px-8 py-4 font-bold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-3 text-lg
            ${isConnected
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 hover:shadow-xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          <span className="text-2xl">+</span>
          <span>{isConnected ? 'Schedule New Appointment' : 'Connecting...'}</span>
        </button>
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-1">Patient Information Form</h3>
                <p className="text-violet-100 text-sm">Please fill in all required fields marked with *</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="overflow-y-auto flex-1 p-8">
              {/* Personal Information */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-violet-600 text-2xl">👤</span> Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name *"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="middleName"
                    placeholder="Middle Name"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name *"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="suffix"
                    placeholder="Suffix (Jr., Sr., III)"
                    value={formData.suffix}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  >
                    <option value="">Select Gender *</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <input
                    type="date"
                    name="dateOfBirth"
                    placeholder="Date of Birth *"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <select
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all md:col-span-2"
                  >
                    <option value="">Select Civil Status *</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-2xl">📞</span> Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="Contact Number *"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="emergencyContactNumber"
                    placeholder="Emergency Contact Number"
                    value={formData.emergencyContactNumber}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all md:col-span-2"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-orange-600 text-2xl">📍</span> Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="addressStreet"
                    placeholder="Street Address *"
                    value={formData.addressStreet}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all md:col-span-2"
                  />
                  <input
                    type="text"
                    name="addressBarangay"
                    placeholder="Barangay *"
                    value={formData.addressBarangay}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="addressMunicipality"
                    placeholder="Municipality *"
                    value={formData.addressMunicipality}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="addressProvince"
                    placeholder="Province *"
                    value={formData.addressProvince}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all md:col-span-2"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-green-600 text-2xl">🩺</span> Medical Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    name="priorityCategory"
                    value={formData.priorityCategory}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all md:col-span-3"
                  >
                    <option value="">Select Priority Category *</option>
                    <option value="Priority (Pregnant)">Priority (Pregnant)</option>
                    <option value="Priority (Senior)">Priority (Senior)</option>
                    <option value="Priority (PWD)">Priority (PWD)</option>
                    <option value="Priority (Infant)">Priority (Infant)</option>
                    <option value="Regular">Regular</option>
                  </select>
                  <input
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={formData.height}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="number"
                    name="weight"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="bloodType"
                    placeholder="Blood Type (e.g., A+, O-)"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                  <textarea
                    name="medicalHistory"
                    placeholder="Medical History (allergies, medications, past conditions)"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows="3"
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all md:col-span-3 resize-none"
                  />
                  <textarea
                    name="healthConcern"
                    placeholder="Current Health Concern / Reason for Visit *"
                    value={formData.healthConcern}
                    onChange={handleChange}
                    rows="3"
                    className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all md:col-span-3 resize-none"
                  />
                </div>
              </div>

              {/* Appointment Schedule */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-violet-600 text-2xl">📅</span> Appointment Schedule
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleChange}
                      className="p-4 border-2 border-gray-200 rounded-xl w-full focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex gap-3">
                      <span className="text-2xl">ℹ️</span>
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Your appointment request will be reviewed and confirmed by our staff. You will receive a confirmation notification once approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-8 py-6 border-t-2 border-violet-200 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
              >
                ✓ Schedule Appointment
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;