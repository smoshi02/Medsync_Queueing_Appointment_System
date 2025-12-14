import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Queue() {
  const [cards, setCards] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
    console.log("👤 User role:", role);
  }, []);

  const canUseNext = userRole?.toUpperCase() === "STAFF" || userRole?.toUpperCase() === "DOCTOR";

  const loadCards = async () => {
    try {
      setLoadingCards(true);
      const data = await fetchWithAuth("/api/patient-queue/cards");
      console.log("📋 Cards loaded:", data);
      setCards(data);
    } catch (err) {
      console.error("❌ Error loading cards:", err);
      setError(err.message);
    } finally {
      setLoadingCards(false);
    }
  };

  const loadServiceTable = async (serviceName) => {
    try {
      setSelectedService(serviceName);
      setLoadingTable(true);
      const data = await fetchWithAuth(`/api/patient-queue/service/${encodeURIComponent(serviceName)}`);
      console.log("📊 Service table loaded:", data);
      setTableData(data);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Error loading table:", err);
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  const viewPatientDetails = async (queueId) => {
    try {
      const data = await fetchWithAuth(`/api/patient-queue/${queueId}`);
      setSelectedPatient(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("❌ Error loading details:", err);
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  useStompWebSocket(["/topic/queue", "/topic/patient-queue", "/topic/medical-records"], () => {
    console.log("🔔 WebSocket update received, reloading...");
    loadCards();
    if (selectedService) loadServiceTable(selectedService);
  });

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
        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={() => { setError(""); loadCards(); }}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
            Patient Queue Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage active queues - {userRole} Access
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loadingCards ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
            </div>
          ) : cards.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-500 text-lg">No services available</p>
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

      {showModal && (
        <QueueModal
          selectedService={selectedService}
          tableData={tableData}
          loadingTable={loadingTable}
          onClose={() => setShowModal(false)}
          canUseNext={canUseNext}
          reloadTable={() => loadServiceTable(selectedService)}
          onViewDetails={viewPatientDetails}
          calculateAge={calculateAge}
        />
      )}

      {showDetailModal && selectedPatient && (
        <PatientDetailModal
          queue={selectedPatient}
          onClose={() => setShowDetailModal(false)}
          calculateAge={calculateAge}
        />
      )}
    </div>
  );
}

function ServiceCard({ card, onClick }) {
  return (
    <div onClick={onClick} className="relative p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">{card.serviceName}</h2>
          <div className="text-3xl opacity-30 group-hover:opacity-50 transition-opacity">🏥</div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-violet-100 text-sm font-medium">Active</span>
            <span className="text-2xl font-bold">{card.activePatients}</span>
          </div>
          <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-violet-100 text-sm font-medium">Served</span>
            <span className="text-2xl font-bold">{card.totalServed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueModal({ selectedService, tableData, loadingTable, onClose, canUseNext, reloadTable, onViewDetails, calculateAge }) {
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

  const organizedQueue = organizeQueue(tableData);
  const currentPatient = organizedQueue.find(p => p.status === "In Progress" || p.status === "IN_PROGRESS");
  const waitingQueue = organizedQueue.filter(p => p.status === "Waiting");

  const createOrUpdateMedicalRecord = async (queueId, patientData) => {
    try {
      console.log("📝 Creating/updating medical record for queue #", queueId);
      console.log("📊 Patient data:", patientData);
      
      let recordExists = false;
      let existingRecordId = null;
      
      try {
        const checkResponse = await fetchWithAuth(`/api/medical-records/queue/${queueId}`);
        
        if (checkResponse && checkResponse.recordId) {
          recordExists = true;
          existingRecordId = checkResponse.recordId;
          console.log("✅ Medical record already exists: #" + existingRecordId);
        }
      } catch (checkErr) {
        if (checkErr.message && checkErr.message.includes("404")) {
          console.log("ℹ️ No existing record found (404), will create new one");
          recordExists = false;
        } else {
          console.warn("⚠️ Error checking for existing record:", checkErr.message);
          recordExists = false;
        }
      }
      
      if (recordExists && existingRecordId) {
        try {
          await fetchWithAuth(`/api/medical-records/${existingRecordId}/complete`, {
            method: "PATCH"
          });
          console.log("✅ Medical record marked as completed");
          return true;
        } catch (completeErr) {
          console.error("❌ Error marking record as complete:", completeErr);
          return false;
        }
      }
      
      console.log("✨ Creating new medical record");
      
      const medicalRecordPayload = {
        queueId: queueId,
        chiefComplaint: `Consultation - ${selectedService}`,
        status: "Pending"
      };
      
      console.log("📤 Sending payload:", JSON.stringify(medicalRecordPayload, null, 2));
      
      try {
        const response = await fetchWithAuth("/api/medical-records", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(medicalRecordPayload)
        });
        
        console.log("✅ Medical record created successfully:", response);
        
        if (response && (response.recordId || (response.record && response.record.recordId))) {
          const newRecordId = response.recordId || response.record.recordId;
          console.log("✅ New medical record ID:", newRecordId);
          return true;
        } else {
          console.warn("⚠️ Medical record response format unexpected:", response);
          return true;
        }
      } catch (createErr) {
        console.error("❌ Error creating medical record:", createErr);
        console.error("❌ Error message:", createErr.message);
        alert(`⚠️ Warning: Failed to create medical record. Error: ${createErr.message}\n\nQueue status will still be updated.`);
        return false;
      }
    } catch (err) {
      console.error("❌ Unexpected error in createOrUpdateMedicalRecord:", err);
      console.error("❌ Error stack:", err.stack);
      alert(`⚠️ Warning: Failed to process medical record. Queue status will still be updated. Error: ${err.message}`);
      return false;
    }
  };

  const handleNext = async () => {
    try {
      console.log("🔄 Processing next patient...");
      
      let medicalRecordCreated = false;

      if (currentPatient) {
        console.log("✓ Completing current patient:", currentPatient.patientName);
        
        await fetchWithAuth(`/api/patient-queue/${currentPatient.queueId}/status?status=Completed`, {
          method: "PATCH"
        });
        console.log("✅ Queue status updated to Completed");
        
        medicalRecordCreated = await createOrUpdateMedicalRecord(currentPatient.queueId, currentPatient);
      }

      if (waitingQueue.length > 0) {
        const nextPatient = waitingQueue[0];
        console.log("→ Starting next patient:", nextPatient.patientName);
        
        await fetchWithAuth(`/api/patient-queue/${nextPatient.queueId}/status?status=In Progress`, {
          method: "PATCH"
        });
        console.log("✅ Next patient status updated to In Progress");
      }

      console.log("🔃 Reloading queue table...");
      await reloadTable();
      
      if (currentPatient) {
        const message = medicalRecordCreated 
          ? `✅ ${currentPatient.patientName} completed and moved to Medical Records!`
          : `✅ ${currentPatient.patientName} completed! (Medical record may already exist)`;
        alert(message);
      } else if (waitingQueue.length > 0) {
        alert(`✅ Started serving ${waitingQueue[0].patientName}`);
      }
    } catch (err) {
      console.error("❌ Error in handleNext:", err);
      alert("Failed to process: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Queue: {selectedService}</h2>
              <p className="text-violet-100 text-sm">
                3:1 Priority Queue System 
                {canUseNext ? " - Management Mode" : " - View Only Mode"}
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {canUseNext && organizedQueue.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleNext}
                disabled={waitingQueue.length === 0 && !currentPatient}
                className="px-6 py-3 bg-white text-violet-600 rounded-lg font-bold hover:bg-violet-50 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                {currentPatient ? "Complete & Next Patient" : "Start Next Patient"}
              </button>
              
              {currentPatient && (
                <div className="flex items-center gap-2 bg-yellow-500 bg-opacity-20 px-4 py-2 rounded-lg">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Now Serving: {currentPatient.patientName}</span>
                </div>
              )}

              {!currentPatient && waitingQueue.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-500 bg-opacity-20 px-4 py-2 rounded-lg">
                  <span className="text-white font-medium">Click "Start Next Patient" to begin</span>
                </div>
              )}

              {waitingQueue.length === 0 && !currentPatient && (
                <div className="flex items-center gap-2 bg-green-500 bg-opacity-20 px-4 py-2 rounded-lg">
                  <span className="text-white font-medium">✓ All patients completed!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {loadingTable ? (
            <div className="flex justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
            </div>
          ) : organizedQueue.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">No patients in queue</p>
              <p className="text-gray-400 text-sm mt-2">All patients have been served</p>
            </div>
          ) : (
            <QueueTable 
              data={organizedQueue} 
              canUseNext={canUseNext}
              calculateAge={calculateAge}
              onViewDetails={onViewDetails}
            />
          )}
        </div>

        {!loadingTable && organizedQueue.length > 0 && (
          <div className="bg-violet-50 px-6 py-4 border-t">
            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Waiting: <span className="font-bold text-violet-700">{waitingQueue.length}</span>
                </span>
                {currentPatient && (
                  <span className="text-gray-600">
                    In Progress: <span className="font-bold text-yellow-700">1</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-600">Live updates • Synced with Medical Records</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QueueTable({ data, canUseNext, calculateAge, onViewDetails }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Position</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Patient Name</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Age</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Contact</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Category</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Status</th>
            <th className="p-3 text-center text-violet-900 font-semibold text-sm">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isCurrentlyServing = row.status === "In Progress" || row.status === "IN_PROGRESS";
            const isPriority = ["Priority", "Senior Citizen", "PWD", "Pregnant", "Infant"].some(p => 
              (row.category || row.priorityCategory || "").toLowerCase().includes(p.toLowerCase())
            );

            return (
              <tr key={row.queueId} className={`border-b transition-all ${
                isCurrentlyServing ? "bg-yellow-50 border-l-4 border-l-yellow-500" : "hover:bg-violet-50"
              }`}>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${isCurrentlyServing ? "text-yellow-700" : "text-violet-700"}`}>
                      {isCurrentlyServing ? "→" : row.queuePosition}
                    </span>
                    {isPriority && !isCurrentlyServing && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-bold">P</span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-medium text-gray-800 text-sm">{row.patientName}</td>
                <td className="p-3 text-gray-700 text-sm">{calculateAge(row.dateOfBirth)} yrs</td>
                <td className="p-3 text-gray-600 text-xs">{row.contactNumber}</td>
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
                    row.status === "Waiting" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {isCurrentlyServing ? "🔔 In Progress" : row.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onViewDetails(row.queueId)}
                    className="px-4 py-1.5 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-600 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PatientDetailModal({ queue, onClose, calculateAge }) {
  const patient = queue.patient;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {patient.firstName} {patient.middleName} {patient.lastName} {patient.suffix}
                </h2>
                <p className="text-violet-100 text-sm">Queue #{queue.queueNumber || queue.queueId}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-violet-900">Personal Information</h3>
              </div>
              <div className="space-y-3">
                <InfoField label="Full Name" value={`${patient.firstName} ${patient.middleName || ''} ${patient.lastName} ${patient.suffix || ''}`.trim()} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Age" value={`${calculateAge(patient.dateOfBirth)} years`} />
                  <InfoField label="Gender" value={patient.gender} />
                  <InfoField label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "—"} />
                  <InfoField label="Blood Type" value={patient.bloodType} />
                </div>
              </div>
            </div>

            {/* Contact Information - UPDATED WITH EMAIL */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-blue-900">Contact Information</h3>
              </div>
              <div className="space-y-3">
                <InfoField label="Email Address" value={patient.email} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Contact Number" value={patient.contactNumber} />
                  <InfoField label="Emergency Contact" value={patient.emergencyContactNumber} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-900">Address</h3>
              </div>
              <div className="space-y-3">
                <InfoField label="Street" value={patient.addressStreet} />
                <div className="grid grid-cols-3 gap-3">
                  <InfoField label="Barangay" value={patient.addressBarangay} />
                  <InfoField label="Municipality" value={patient.addressMunicipality} />
                  <InfoField label="Province" value={patient.addressProvince} />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-900">Medical Information</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Category" value={patient.priorityCategory || patient.category} />
                  <InfoField label="Blood Type" value={patient.bloodType} />
                  <InfoField label="Height" value={patient.height ? `${patient.height} cm` : "—"} />
                  <InfoField label="Weight" value={patient.weight ? `${patient.weight} kg` : "—"} />
                </div>
              </div>
            </div>

            {/* Queue Information */}
            <div className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-yellow-900">Queue Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Service" value={queue.service?.serviceName} />
                <InfoField label="Status" value={
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    queue.status === "In Progress" || queue.status === "IN_PROGRESS" 
                      ? "bg-yellow-200 text-yellow-800" 
                      : queue.status === "Completed" 
                      ? "bg-green-200 text-green-800"
                      : "bg-blue-200 text-blue-800"
                  }`}>
                    {queue.status}
                  </span>
                } />
                <InfoField label="Registered" value={queue.timeRegistered ? new Date(queue.timeRegistered).toLocaleString() : "—"} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-semibold text-sm">{value || "—"}</p>
    </div>
  );
}

export default Queue;