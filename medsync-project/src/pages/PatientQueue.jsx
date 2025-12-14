// ========================================
// PatientQueue.jsx - PUBLIC with Patient Registration
// Anyone can view and register patients
// ========================================

import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const PatientQueue = () => {
  const [cards, setCards] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Fetch helper WITHOUT authentication (public access)
  const fetchPublic = async (url, options = {}) => {
    const config = {
      method: options.method || "GET",
      headers: { 
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    };

    if (options.body) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }
    
    const res = await fetch(`http://localhost:6969${url}`, config);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }
    
    if (res.status === 204) return null;
    return res.json();
  };

  // Load cards
  const loadCards = async () => {
    try {
      setLoadingCards(true);
      setError("");
      const data = await fetchPublic("/api/patient-queue/cards");
      setCards(data);
    } catch (err) {
      console.error("Error loading cards:", err);
      setError(err.message);
    } finally {
      setLoadingCards(false);
    }
  };

  // Load table for specific service
  const loadServiceTable = async (serviceName) => {
    try {
      setSelectedService(serviceName);
      setLoadingTable(true);
      const data = await fetchPublic(`/api/patient-queue/service/${serviceName}`);
      setTableData(data);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading service table:", err);
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  // View patient details (read-only)
  const viewPatientDetails = async (queueId) => {
    try {
      const data = await fetchPublic(`/api/patient-queue/${queueId}`);
      setSelectedPatient(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error loading patient details:", err);
      setError(err.message);
    }
  };

  // WebSocket for real-time updates
  useEffect(() => {
    const socket = new SockJS("http://localhost:6969/ws/public");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log("STOMP Debug:", str),
    });

    stompClient.onConnect = () => {
      console.log("✅ WebSocket Connected");
      setIsConnected(true);

      stompClient.subscribe("/topic/patient-queue", () => {
        loadCards();
        if (selectedService) loadServiceTable(selectedService);
      });

      stompClient.subscribe("/topic/queue", () => {
        loadCards();
        if (selectedService) loadServiceTable(selectedService);
      });
    };

    stompClient.onDisconnect = () => {
      console.log("❌ WebSocket Disconnected");
      setIsConnected(false);
    };

    stompClient.activate();

    return () => stompClient.deactivate();
  }, [selectedService]);

  useEffect(() => {
    loadCards();
  }, []);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500 max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Queue</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => { setError(""); loadCards(); }}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
              Patient Queue Management
            </h1>
            <p className="text-gray-600">Monitor patient queues - Public Display</p>
          </div>

          <div className="flex items-center gap-4">
            {/* WebSocket Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-violet-100">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isConnected ? 'Live' : 'Connecting...'}
              </span>
            </div>

            {/* Register Button */}
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Register Patient
            </button>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loadingCards ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
                <p className="text-violet-700 text-lg font-medium">Loading services...</p>
              </div>
            </div>
          ) : cards.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-500 text-lg font-medium">No services available</p>
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

      {/* Queue Table Modal with Separate Tables */}
      {showModal && (
        <QueueModal
          selectedService={selectedService}
          tableData={tableData}
          loadingTable={loadingTable}
          onClose={() => setShowModal(false)}
          onViewDetails={viewPatientDetails}
          calculateAge={calculateAge}
        />
      )}

      {/* Patient Detail Modal */}
      {showDetailModal && selectedPatient && (
        <PatientDetailModal
          queue={selectedPatient}
          onClose={() => setShowDetailModal(false)}
          calculateAge={calculateAge}
        />
      )}

      {/* Registration Form */}
      {showRegistrationForm && (
        <PatientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={() => {
            setShowRegistrationForm(false);
            loadCards();
          }}
          fetchPublic={fetchPublic}
        />
      )}
    </div>
  );
};

// Service Card Component
function ServiceCard({ card, onClick }) {
  return (
    <div onClick={onClick} className="relative p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1 overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">{card.serviceName}</h2>
          <div className="text-3xl opacity-30 group-hover:opacity-50 transition-opacity">🩺</div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-violet-100 text-sm font-medium">Active Patients</span>
            <span className="text-2xl font-bold">{card.activePatients}</span>
          </div>
          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-violet-100 text-sm font-medium">Total Served</span>
            <span className="text-2xl font-bold">{card.totalServed}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center text-violet-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Click to view details</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Queue Modal Component with Separate Priority/Regular Tables
function QueueModal({ selectedService, tableData, loadingTable, onClose, onViewDetails, calculateAge }) {
  // Separate priority and regular patients
  const priorityCategories = ["Priority", "Senior Citizen", "PWD", "Pregnant", "Infant"];
  const priorityPatients = tableData.filter(row => 
    priorityCategories.includes(row.category)
  );
  const regularPatients = tableData.filter(row => 
    !priorityCategories.includes(row.category) || row.category === "Regular"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Queue: {selectedService}</h2>
            <p className="text-violet-100 text-sm">Real-time patient queue monitoring - View Only</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
              <p className="text-gray-500 text-lg font-medium">No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* PRIORITY PATIENTS TABLE */}
              {priorityPatients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-1 bg-red-500 rounded"></div>
                    <h3 className="text-xl font-bold text-red-700">Priority Patients</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      {priorityPatients.length}
                    </span>
                  </div>
                  <QueueTable 
                    data={priorityPatients}
                    calculateAge={calculateAge}
                    onViewDetails={onViewDetails}
                  />
                </div>
              )}

              {/* REGULAR PATIENTS TABLE */}
              {regularPatients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-1 bg-blue-500 rounded"></div>
                    <h3 className="text-xl font-bold text-blue-700">Regular Patients</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {regularPatients.length}
                    </span>
                  </div>
                  <QueueTable 
                    data={regularPatients}
                    calculateAge={calculateAge}
                    onViewDetails={onViewDetails}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!loadingTable && tableData.length > 0 && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-t border-violet-100">
            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Total: <span className="font-bold text-violet-700">{tableData.length}</span>
                </span>
                <span className="text-gray-600">
                  Priority: <span className="font-bold text-red-700">{priorityPatients.length}</span>
                </span>
                <span className="text-gray-600">
                  Regular: <span className="font-bold text-blue-700">{regularPatients.length}</span>
                </span>
              </div>
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

// Queue Table Component (Read-only for public)
function QueueTable({ data, calculateAge, onViewDetails }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
            <th className="p-4 text-left text-violet-900 font-semibold">Queue #</th>
            <th className="p-4 text-left text-violet-900 font-semibold">Patient Name</th>
            <th className="p-4 text-left text-violet-900 font-semibold">Age</th>
            <th className="p-4 text-left text-violet-900 font-semibold">Contact</th>
            <th className="p-4 text-left text-violet-900 font-semibold">Category</th>
            <th className="p-4 text-left text-violet-900 font-semibold">Priority</th>
            <th className="p-4 text-left text-violet-900 font-semibold">Staff</th>
            <th className="p-4 text-left text-violet-900 font-semibold">Status</th>
            <th className="p-4 text-center text-violet-900 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.queueId} className="border-b border-violet-50 hover:bg-violet-50 transition-colors">
              <td className="p-4 font-bold text-violet-700">#{row.queueId}</td>
              <td className="p-4 font-medium text-gray-800">{row.patientName}</td>
              <td className="p-4 text-gray-700">{calculateAge(row.dateOfBirth)} yrs</td>
              <td className="p-4 text-gray-600 text-sm">{row.contactNumber}</td>
              <td className="p-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  {row.category || "Regular"}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  row.priorityLevel === "High" ? "bg-red-100 text-red-700" :
                  row.priorityLevel === "Urgent" ? "bg-orange-100 text-orange-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {row.priorityLevel}
                </span>
              </td>
              <td className="p-4 text-gray-700">
                {row.staffName || <span className="text-gray-400 italic">Unassigned</span>}
              </td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  row.status === "In Progress" || row.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                  row.status === "Waiting" ? "bg-blue-100 text-blue-700" :
                  row.status === "Completed" || row.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {row.status}
                </span>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => onViewDetails(row.queueId)}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Patient Detail Modal
function PatientDetailModal({ queue, onClose, calculateAge }) {
  const patient = queue.patient;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Patient Details</h2>
            <p className="text-violet-100 text-sm">Queue #{queue.queueId} - View Only</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          <div>
            <h3 className="text-lg font-bold text-violet-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="First Name" value={patient.firstName} />
              <InfoField label="Middle Name" value={patient.middleName} />
              <InfoField label="Last Name" value={patient.lastName} />
              <InfoField label="Suffix" value={patient.suffix} />
              <InfoField label="Date of Birth" value={patient.dateOfBirth} />
              <InfoField label="Age" value={`${calculateAge(patient.dateOfBirth)} years`} />
              <InfoField label="Gender" value={patient.gender} />
              <InfoField label="Civil Status" value={patient.civilStatus} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Contact Number" value={patient.contactNumber} />
              <InfoField label="Emergency Contact" value={patient.emergencyContactNumber} />
              <InfoField label="Email" value={patient.email} className="col-span-2" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-700 mb-3">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Street" value={patient.addressStreet} className="col-span-2" />
              <InfoField label="Barangay" value={patient.addressBarangay} />
              <InfoField label="Municipality" value={patient.addressMunicipality} />
              <InfoField label="Province" value={patient.addressProvince} className="col-span-2" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-700 mb-3">Medical Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <InfoField label="Category" value={patient.priorityCategory} />
              <InfoField label="Height" value={patient.height ? `${patient.height} cm` : "—"} />
              <InfoField label="Weight" value={patient.weight ? `${patient.weight} kg` : "—"} />
              <InfoField label="Blood Type" value={patient.bloodType} />
              <InfoField label="Medical History" value={patient.medicalHistory} className="col-span-2" />
              <InfoField label="Health Concern" value={patient.healthConcern} className="col-span-3" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-violet-700 mb-3">Queue Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Service" value={queue.service?.serviceName} />
              <InfoField label="Queue Number" value={queue.queueNumber} />
              <InfoField label="Status" value={queue.status} />
              <InfoField label="Priority Level" value={queue.priorityLevel} />
              <InfoField label="Assigned Staff" value={queue.staff ? `${queue.staff.firstName} ${queue.staff.lastName}` : "Unassigned"} />
              <InfoField label="Time Registered" value={new Date(queue.timeRegistered).toLocaleString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-gray-800 font-semibold">{value || "—"}</p>
    </div>
  );
}

// Patient Registration Form
function PatientRegistrationForm({ onClose, onSuccess, fetchPublic }) {
  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", suffix: "",
    dateOfBirth: "", gender: "", contactNumber: "", emergencyContactNumber: "",
    addressStreet: "", addressBarangay: "", addressMunicipality: "", addressProvince: "",
    category: "Regular", height: "", weight: "", bloodType: "", serviceRequired: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const services = ["Medical Consultation", "Laboratory Services", "Family Planning", "Pharmacy", "Obstetrics", "Dental Service", "TB Dots Service"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const categories = ["Regular", "Priority", "Senior Citizen", "PWD", "Pregnant", "Infant"];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await fetchPublic("/api/patient-queue", {
        method: "POST",
        body: formData
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold mb-1">Patient Registration</h2>
            <p className="text-violet-100 text-sm">Add new patient to queue</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-violet-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle Name" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} placeholder="Suffix (Jr., Sr.)" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <select name="gender" value={formData.gender} onChange={handleChange} required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500">
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-violet-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} placeholder="Emergency Contact *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-violet-700 mb-3">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" name="addressStreet" value={formData.addressStreet} onChange={handleChange} placeholder="Street *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" name="addressBarangay" value={formData.addressBarangay} onChange={handleChange} placeholder="Barangay *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
                <input type="text" name="addressMunicipality" value={formData.addressMunicipality} onChange={handleChange} placeholder="Municipality *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
                <input type="text" name="addressProvince" value={formData.addressProvince} onChange={handleChange} placeholder="Province *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-violet-700 mb-3">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select name="category" value={formData.category} onChange={handleChange} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
              <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500">
                <option value="">Blood Type</option>
                {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          {/* Service */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-violet-700 mb-3">Service Required</h3>
            <select name="serviceRequired" value={formData.serviceRequired} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500">
              <option value="">Select Service *</option>
              {services.map(service => <option key={service} value={service}>{service}</option>)}
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? "Registering..." : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientQueue;