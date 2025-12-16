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
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    if (res.status === 204) return null;
    return res.json();
  };

  const loadCards = async () => {
    try {
      setLoadingCards(true);
      setError("");
      const data = await fetchPublic("/api/patient-queue/cards");
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCards(false);
    }
  };

  const loadServiceTable = async (serviceName) => {
    try {
      setSelectedService(serviceName);
      setLoadingTable(true);
      const data = await fetchPublic(`/api/patient-queue/service/${serviceName}`);
      setTableData(data);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  const viewPatientDetails = async (queueId) => {
    try {
      const data = await fetchPublic(`/api/patient-queue/${queueId}`);
      setSelectedPatient(data);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const socket = new SockJS("http://localhost:6969/ws/public");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
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

    stompClient.onDisconnect = () => setIsConnected(false);
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

  const organizeQueue = (data) => {
    const priorityCategories = ["Priority", "Senior Citizen", "PWD", "Pregnant", "Infant"];
    
    const priorityQueue = data.filter(row => {
      const category = row.category || row.priorityCategory || "Regular";
      return priorityCategories.some(p => category.toLowerCase().includes(p.toLowerCase()));
    }).filter(row => row.status !== "Completed" && row.status !== "COMPLETED");

    const regularQueue = data.filter(row => {
      const category = row.category || row.priorityCategory || "Regular";
      return !priorityCategories.some(p => category.toLowerCase().includes(p.toLowerCase()));
    }).filter(row => row.status !== "Completed" && row.status !== "COMPLETED");

    const organized = [];
    let priorityIndex = 0;
    let regularIndex = 0;

    while (priorityIndex < priorityQueue.length || regularIndex < regularQueue.length) {
      for (let i = 0; i < 3 && priorityIndex < priorityQueue.length; i++) {
        organized.push({ ...priorityQueue[priorityIndex], queuePosition: organized.length + 1 });
        priorityIndex++;
      }
      if (regularIndex < regularQueue.length) {
        organized.push({ ...regularQueue[regularIndex], queuePosition: organized.length + 1 });
        regularIndex++;
      }
    }

    return organized;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
   
      <div className="min-h-screen bg-white p-6 md:p-8 lg:p-10">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#503878] to-[#D946EF] bg-clip-text text-transparent mb-2">
              Patient Queue Display
            </h1>
            <p className="text-gray-500 text-base">Real-time queue monitoring</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-purple-100">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isConnected ? 'Live' : 'Connecting...'}
              </span>
            </div>

            <button
              onClick={() => setShowRegistrationForm(true)}
              className="px-6 py-3 bg-[#503878] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Register Patient
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loadingCards ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#503878] border-t-transparent"></div>
            </div>
          ) : cards.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-500 text-lg">No services available</p>
            </div>
          ) : (
            cards.map((card) => (
              <ServiceCard key={card.serviceName} card={card} onClick={() => loadServiceTable(card.serviceName)} />
            ))
          )}
        </div>
     

      {showModal && (
        <QueueModal
          selectedService={selectedService}
          tableData={tableData}
          loadingTable={loadingTable}
          onClose={() => setShowModal(false)}
          onViewDetails={viewPatientDetails}
          calculateAge={calculateAge}
          organizeQueue={organizeQueue}
        />
      )}

      {showDetailModal && selectedPatient && (
        <PatientDetailModal queue={selectedPatient} onClose={() => setShowDetailModal(false)} calculateAge={calculateAge} />
      )}

      {showRegistrationForm && (
        <PatientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={() => { setShowRegistrationForm(false); loadCards(); }}
          fetchPublic={fetchPublic}
        />
      )}
    </div>
  );
};

function ServiceCard({ card, onClick }) {
  return (
    <div onClick={onClick} className="relative p-6 bg-gradient-to-br from-[#503878] to-[#D946EF] text-white rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">{card.serviceName}</h2>
          <div className="text-3xl opacity-30">🩺</div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3">
            <span className="text-purple-100 text-sm font-medium">Active</span>
            <span className="text-2xl font-bold">{card.activePatients}</span>
          </div>
          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3">
            <span className="text-purple-100 text-sm font-medium">Served</span>
            <span className="text-2xl font-bold">{card.totalServed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueModal({ selectedService, tableData, loadingTable, onClose, onViewDetails, calculateAge, organizeQueue }) {
  const organizedQueue = organizeQueue(tableData);
  const currentPatient = organizedQueue.find(p => p.status === "In Progress" || p.status === "IN_PROGRESS");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="bg-[#503878] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{selectedService}</h2>
              <p className="text-purple-100 text-sm">3:1 Priority Queue System</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {currentPatient && (
            <div className="flex items-center gap-2 bg-yellow-500 bg-opacity-20 px-4 py-3 rounded-lg">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Now Serving: {currentPatient.patientName}</span>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loadingTable ? (
            <div className="flex justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#503878] border-t-transparent"></div>
            </div>
          ) : organizedQueue.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">No patients in queue</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-[#503878]/20 to-purple-100">
                    <th className="p-3 text-left text-[#503878] font-semibold">Position</th>
                    <th className="p-3 text-left text-[#503878] font-semibold">Patient Name</th>
                    <th className="p-3 text-left text-[#503878] font-semibold">Age</th>
                    <th className="p-3 text-left text-[#503878] font-semibold">Category</th>
                    <th className="p-3 text-left text-[#503878] font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {organizedQueue.map((row) => {
                    const isCurrentlyServing = row.status === "In Progress" || row.status === "IN_PROGRESS";
                    const isPriority = ["Priority", "Senior Citizen", "PWD", "Pregnant", "Infant"].some(p => 
                      (row.category || row.priorityCategory || "").toLowerCase().includes(p.toLowerCase())
                    );

                    return (
                      <tr key={row.queueId} className={`border-b transition-all ${
                        isCurrentlyServing ? "bg-yellow-50 border-l-4 border-l-yellow-500" : "hover:bg-purple-50"
                      }`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${isCurrentlyServing ? "text-yellow-700" : "text-[#503878]"}`}>
                              {isCurrentlyServing ? "→" : row.queuePosition}
                            </span>
                            {isPriority && !isCurrentlyServing && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">P</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-gray-800">{row.patientName}</td>
                        <td className="p-3 text-gray-700">{calculateAge(row.dateOfBirth)} yrs</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            isPriority ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {row.category || row.priorityCategory || "Regular"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            isCurrentlyServing ? "bg-yellow-100 text-yellow-700 animate-pulse" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {isCurrentlyServing ? "🔔 In Progress" : row.status}
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
      </div>
    </div>
  );
}

function PatientDetailModal({ queue, onClose, calculateAge }) {
  const patient = queue.patient;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-[#503878] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Patient Details</h2>
            <p className="text-purple-100 text-sm">Queue #{queue.queueId}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#503878] mb-3">Personal</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Name" value={`${patient.firstName} ${patient.middleName || ''} ${patient.lastName}`.trim()} className="col-span-2" />
              <InfoField label="Age" value={`${calculateAge(patient.dateOfBirth)} years`} />
              <InfoField label="Gender" value={patient.gender} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#503878] mb-3">Queue Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Service" value={queue.service?.serviceName} />
              <InfoField label="Status" value={queue.status} />
              <InfoField label="Priority" value={queue.priorityLevel} />
              <InfoField label="Time" value={new Date(queue.timeRegistered).toLocaleString()} />
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

function PatientRegistrationForm({ onClose, onSuccess, fetchPublic }) {
  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", suffix: "",
    dateOfBirth: "", gender: "", email: "", contactNumber: "", emergencyContactNumber: "",
    addressStreet: "", addressBarangay: "", addressMunicipality: "", addressProvince: "",
    category: "Regular", height: "", weight: "", bloodType: "", serviceRequired: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const services = ["Medical Consultation", "Dental Services", "Immunization", "Laboratory Service", "Adolescent Health Clinic", "Pharmacy Services", "Family Planning Service", "TB DOTs Service", "Obstetrics Services", "Medical Certification"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const categories = ["Regular", "Priority", "Senior Citizen", "PWD", "Pregnant", "Infant"];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await fetchPublic("/api/patient-queue", { method: "POST", body: formData });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="bg-[#503878] text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold mb-1">Register Patient</h2>
            <p className="text-purple-100 text-sm">Add to queue</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#503878] mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle Name" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} placeholder="Suffix" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <select name="gender" value={formData.gender} onChange={handleChange} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none">
                <option value="">Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#503878] mb-3">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} placeholder="Emergency Contact *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none md:col-span-2" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#503878] mb-3">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" name="addressStreet" value={formData.addressStreet} onChange={handleChange} placeholder="Street *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <div className="grid grid-cols-3 gap-4">
                <input type="text" name="addressBarangay" value={formData.addressBarangay} onChange={handleChange} placeholder="Barangay *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
                <input type="text" name="addressMunicipality" value={formData.addressMunicipality} onChange={handleChange} placeholder="Municipality *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
                <input type="text" name="addressProvince" value={formData.addressProvince} onChange={handleChange} placeholder="Province *" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#503878] mb-3">Medical</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select name="category" value={formData.category} onChange={handleChange} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none" />
              <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none">
                <option value="">Blood Type</option>
                {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#503878] mb-3">Service</h3>
            <select name="serviceRequired" value={formData.serviceRequired} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#503878] focus:outline-none">
              <option value="">Select Service *</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 px-6 py-3 bg-[#503878] text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50">
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientQueue;