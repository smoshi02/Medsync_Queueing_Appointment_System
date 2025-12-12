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
      "contactNumber", "healthConcern", "addressStreet",
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

      // Construct the patientName explicitly to be safe
      const formattedAppointment = {
        ...newAppointment,
        patientName: newAppointment.patientName || `${formData.firstName} ${formData.lastName}`
      };

      setAppointments(prev => [...prev, formattedAppointment]);


      setFormData({
        firstName: "", middleName: "", lastName: "", suffix: "", gender: "",
        dateOfBirth: "", civilStatus: "", contactNumber: "", emergencyContactNumber: "",
        addressStreet: "", addressBarangay: "", addressMunicipality: "", addressProvince: "",
        priorityCategory: "", height: "", weight: "", bloodType: "", medicalHistory: "", healthConcern: "",
      });
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

            <div className="p-8">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input name="firstName" value={formData.firstName} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>

                      <input
                        name="middleName"          // was middle_name
                        value={formData.middleName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input name="lastName" value={formData.lastName} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                      <input
                        name="suffix"
                        value={formData.suffix}
                        onChange={handleChange}
                        placeholder="Jr., Sr., III"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"         // was date_of_birth
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status *</label>
                      <select
                        name="civilStatus"         // was civil_status
                        value={formData.civilStatus}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Status</option>
                        <option>Single</option>
                        <option>Married</option>
                        <option>Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                      <input
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        placeholder="09XX XXX XXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact *</label>
                      <input
                        name="emergency_contact_number"
                        value={formData.emergency_contact_number}
                        onChange={handleChange}
                        placeholder="09XX XXX XXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200">
                    Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                      <input
                        name="address_street"
                        value={formData.address_street}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Barangay *</label>
                      <input
                        name="address_barangay"
                        value={formData.address_barangay}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Municipality *</label>
                      <input
                        name="address_municipality"
                        value={formData.address_municipality}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                      <input
                        name="address_province"
                        value={formData.address_province}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200">
                    Medical Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority Category *</label>
                      <select
                        name="priority_category"
                        value={formData.priority_category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select Priority</option>
                        <option value="high">High (PWD, Pregnant, Infant, Senior)</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                      <input
                        name="blood_type"
                        value={formData.blood_type}
                        onChange={handleChange}
                        placeholder="A+, B+, O-, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                      <input
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        type="number"
                        placeholder="170"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        type="number"
                        placeholder="65"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                      <textarea
                        name="medical_history"
                        value={formData.medical_history}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Previous illnesses, surgeries, allergies..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      ></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Health Concern / Chief Complaint *</label>
                      <textarea
                        name="health_concern"
                        value={formData.health_concern}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe your current health concern..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  Save Appointment
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
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;