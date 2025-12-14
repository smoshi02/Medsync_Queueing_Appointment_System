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

  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // Check if user can edit (Staff or Doctor only)
  const canEdit = userRole === "STAFF" || userRole === "DOCTOR";

  // LOAD CARDS
  const loadCards = async () => {
    try {
      setLoadingCards(true);
      const data = await fetchWithAuth("/api/patient-queue/cards");
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCards(false);
    }
  };

  // LOAD TABLE WHEN CARD CLICKED
  const loadServiceTable = async (serviceName) => {
    try {
      setSelectedService(serviceName);
      setLoadingTable(true);

      const data = await fetchWithAuth(`/api/patient-queue/service/${serviceName}`);
      setTableData(data);

      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  // View patient details
  const viewPatientDetails = async (queueId) => {
    try {
      const data = await fetchWithAuth(`/api/patient-queue/${queueId}`);
      setSelectedPatient(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error loading patient details:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // REAL-TIME UPDATE
  useStompWebSocket(["/topic/queue", "/topic/patient-queue"], () => {
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
          <p className="text-red-600 text-lg font-medium">{error}</p>
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
            Patient Queue Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage active queues across all services
            {canEdit ? " - Edit Enabled" : " - View Only"}
          </p>
        </div>

        {/* SERVICE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loadingCards ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
                <p className="text-violet-700 text-lg font-medium">Loading queue categories...</p>
              </div>
            </div>
          ) : cards.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-500 text-lg font-medium">No queue services available</p>
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

      {/* MODAL with Separate Priority/Regular Tables */}
      {showModal && (
        <QueueModal
          selectedService={selectedService}
          tableData={tableData}
          loadingTable={loadingTable}
          onClose={() => setShowModal(false)}
          canEdit={canEdit}
          reloadTable={() => loadServiceTable(selectedService)}
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
    </div>
  );
}

// =======================
// ServiceCard Component
// =======================
function ServiceCard({ card, onClick }) {
  return (
    <div
      onClick={onClick}
      className="relative p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1 overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl">{card.serviceName}</h2>
          <div className="text-3xl opacity-30 group-hover:opacity-50 transition-opacity">🏥</div>
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

      <div className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-20"></div>
    </div>
  );
}

// =======================
// QueueModal Component with Separate Priority/Regular Tables
// =======================
function QueueModal({ selectedService, tableData, loadingTable, onClose, canEdit, reloadTable, onViewDetails, calculateAge }) {
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
        {/* HEADER */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Queue: {selectedService}</h2>
            <p className="text-violet-100 text-sm">
              {canEdit ? "Manage patient queue - Edit Enabled" : "View patient queue - Read Only"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* CONTENT */}
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
              <p className="text-gray-500 text-lg font-medium">No patients in queue yet</p>
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
                    canEdit={canEdit} 
                    calculateAge={calculateAge}
                    reloadTable={reloadTable}
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
                    canEdit={canEdit} 
                    calculateAge={calculateAge}
                    reloadTable={reloadTable}
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

// =======================
// QueueTable Component
// =======================
function QueueTable({ data, canEdit, calculateAge, reloadTable, onViewDetails }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (row) => {
    setEditingId(row.queueId);
    setEditData({
      status: row.status,
      priorityLevel: row.priorityLevel
    });
  };

  const handleSave = async (queueId) => {
    try {
      await fetchWithAuth(`/api/patient-queue/${queueId}/status?status=${editData.status}`, {
        method: "PATCH"
      });
      setEditingId(null);
      reloadTable();
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Queue #</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Patient Name</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Age</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Contact</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Category</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Priority</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Staff</th>
            <th className="p-3 text-left text-violet-900 font-semibold text-sm">Status</th>
            <th className="p-3 text-center text-violet-900 font-semibold text-sm">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr
              key={row.queueId}
              className="border-b border-gray-100 hover:bg-violet-50 transition-colors"
            >
              <td className="p-3 font-bold text-violet-700 text-sm">#{row.queueId}</td>
              <td className="p-3 font-medium text-gray-800 text-sm">{row.patientName}</td>
              <td className="p-3 text-gray-700 text-sm">{calculateAge(row.dateOfBirth)} yrs</td>
              <td className="p-3 text-gray-600 text-xs">{row.contactNumber}</td>
              <td className="p-3">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  {row.category || "Regular"}
                </span>
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  row.priorityLevel === "High" ? "bg-red-100 text-red-700" :
                  row.priorityLevel === "Urgent" ? "bg-orange-100 text-orange-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {row.priorityLevel}
                </span>
              </td>
              <td className="p-3 text-gray-700 text-sm">
                {row.staffName || <span className="text-gray-400 italic">Unassigned</span>}
              </td>
              <td className="p-3">
                {editingId === row.queueId ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    row.status === "In Progress" || row.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                    row.status === "Waiting" ? "bg-blue-100 text-blue-700" :
                    row.status === "Completed" || row.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {row.status}
                  </span>
                )}
              </td>
              <td className="p-3">
                <div className="flex items-center justify-center gap-1">
                  {editingId === row.queueId ? (
                    <>
                      <button
                        onClick={() => handleSave(row.queueId)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs font-medium hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onViewDetails(row.queueId)}
                        className="px-3 py-1 bg-violet-500 text-white rounded text-xs font-medium hover:bg-violet-600 transition-colors"
                      >
                        View
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(row)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
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
            <p className="text-violet-100 text-sm">Queue #{queue.queueId}</p>
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

export default Queue;