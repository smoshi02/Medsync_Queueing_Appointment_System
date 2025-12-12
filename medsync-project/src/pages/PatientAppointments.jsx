import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "",
    dateOfBirth: "",
    civilStatus: "",
    contactNumber: "",
    email: "", // added email field
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
  });

  // Load existing appointments
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await fetch("http://localhost:6969/api/patient/appointments");
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const json = await res.json();
        setAppointments(json);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };
    loadAppointments();
  }, []);

  // WebSocket for real-time updates
  useEffect(() => {
    const socket = new SockJS("http://localhost:6969/ws/public");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/public/appointments", (message) => {
        try {
          const payload = JSON.parse(message.body);
          if (payload.type === "appointments-update" && Array.isArray(payload.data)) {
            setAppointments((prev) => {
              const existingIds = new Set(prev.map(a => a.appointmentId));
              const newAppointments = payload.data.filter(a => !existingIds.has(a.appointmentId));
              return [...prev, ...newAppointments];
            });
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      });
    };

    stompClient.activate();
    return () => stompClient.deactivate();
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
      "priorityCategory",
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
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        dateOfBirth: formData.dateOfBirth,
      };

      const res = await fetch("http://localhost:6969/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save appointment: ${errorText}`);
      }

      const newAppointment = await res.json();

      const formattedAppointment = {
        ...newAppointment,
        patientName: newAppointment.patientName || `${formData.firstName} ${formData.lastName}`
      };

      setAppointments(prev => [...prev, formattedAppointment]);

      setFormData({
        firstName: "", middleName: "", lastName: "", suffix: "", gender: "",
        dateOfBirth: "", civilStatus: "", contactNumber: "", email: "", emergencyContactNumber: "",
        addressStreet: "", addressBarangay: "", addressMunicipality: "", addressProvince: "",
        priorityCategory: "", height: "", weight: "", bloodType: "", medicalHistory: "", healthConcern: "",
      });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Appointments</h2>

          {appointments.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No appointments scheduled yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Patient Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a, idx) => (
                    <tr
                      key={a.appointmentId}
                      className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 text-gray-800">{a.patientName}</td>
                      <td className="px-6 py-4 text-gray-600">{a.email || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{a.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            + New Appointment
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-6 rounded-t-xl">
              <h3 className="text-2xl font-bold">Patient Information Form</h3>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="middleName"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="suffix"
                placeholder="Suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
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
                className="p-3 border rounded-lg w-full"
              />
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              >
                <option value="">Select Civil Status *</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number *"
                value={formData.contactNumber}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="emergencyContactNumber"
                placeholder="Emergency Contact Number"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="addressStreet"
                placeholder="Street *"
                value={formData.addressStreet}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="addressBarangay"
                placeholder="Barangay *"
                value={formData.addressBarangay}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="addressMunicipality"
                placeholder="Municipality *"
                value={formData.addressMunicipality}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="addressProvince"
                placeholder="Province *"
                value={formData.addressProvince}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <select
                name="priorityCategory"
                value={formData.priorityCategory}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              >
                <option value="">Select Priority Category *</option>
                <option value="Priority 1">Priority 1</option>
                <option value="Priority 2">Priority 2</option>
              </select>
              <input
                type="number"
                name="height"
                placeholder="Height (cm)"
                value={formData.height}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <input
                type="text"
                name="bloodType"
                placeholder="Blood Type"
                value={formData.bloodType}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <textarea
                name="medicalHistory"
                placeholder="Medical History"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
              <textarea
                name="healthConcern"
                placeholder="Health Concern *"
                value={formData.healthConcern}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full"
              />
            </div>

            <div className="flex gap-4 mt-8 p-8 border-t">
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                Schedule Appointment
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
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