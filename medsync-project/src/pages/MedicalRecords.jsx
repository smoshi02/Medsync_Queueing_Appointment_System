import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [userRole, setUserRole] = useState("");

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/medical-records");
      console.log("📋 Loaded medical records:", data);
      setRecords(data);
      
      // Get user role from localStorage and normalize it
      const roleRaw = localStorage.getItem("role") || "";
      const normalizedRole = roleRaw.replace(/^(ROLE_)+/g, "").toUpperCase();
      
      console.log("👤 User role check in MedicalRecords:");
      console.log("  - Raw role from storage:", roleRaw);
      console.log("  - Normalized role:", normalizedRole);
      
      setUserRole(normalizedRole);
    } catch (err) {
      console.error("❌ Error loading records:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  // Updated WebSocket handler to handle both formats
  useStompWebSocket(["/topic/medical-records"], (msg) => {
    console.log("📡 WebSocket message received:", msg);
    
    // Handle both wrapped payload and direct list
    if (msg && typeof msg === 'object') {
      if (msg.type === "records-update" && msg.data) {
        console.log("📡 Processing wrapped payload update");
        setRecords(msg.data);
      } else if (Array.isArray(msg)) {
        console.log("📡 Processing direct list update");
        setRecords(msg);
      } else {
        console.log("📡 Unknown message format, reloading...");
        loadRecords();
      }
    }
  });

  const filteredRecords = records.filter(r =>
    r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.recordId?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="text-violet-700 text-xl font-medium">Loading medical records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="text-red-500 text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-600 text-lg font-bold mb-1">Error Loading Records</h3>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
            Medical Records
          </h1>
          <p className="text-gray-600">Complete patient information and medical assessments</p>
          {userRole && (
            <p className="text-sm text-gray-500 mt-1">Logged in as: <span className="font-semibold">{userRole}</span></p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-violet-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by patient, health concern, or record #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">{records.length}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Total Records</p>
              </div>
              <div className="h-10 w-px bg-violet-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{filteredRecords.length}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Showing</p>
              </div>
              <div className="h-10 w-px bg-violet-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.status === "Completed").length}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-violet-100 overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg font-medium mb-2">
                {searchTerm ? "No records match your search" : "No medical records yet"}
              </p>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="text-violet-600 hover:text-violet-700 font-medium text-sm underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
                    <th className="p-4 text-left text-violet-900 font-semibold">Record #</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Patient</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Contact</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Chief Complaint</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Diagnosis</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Status</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Date</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.recordId} className="border-b border-violet-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-transparent transition-all duration-200">
                      <td className="p-4 font-bold text-violet-700">#{record.recordId}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {record.patientName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{record.patientName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700">{record.contactNumber || "—"}</span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <span className="text-gray-700 line-clamp-2">{record.chiefComplaint || "—"}</span>
                      </td>
                      <td className="p-4">
                        <span className={record.diagnosis ? "text-gray-700" : "text-yellow-600 italic"}>
                          {record.diagnosis || "Pending Review"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          record.status === "Completed" 
                            ? "bg-green-100 text-green-700 border border-green-300" 
                            : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-gray-800 font-medium">
                            {new Date(record.recordCreatedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-sm font-medium"
                        >
                          View/Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          userRole={userRole}
          onUpdate={loadRecords}
        />
      )}
    </div>
  );
}

function RecordDetailModal({ record, onClose, userRole, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState({
    diagnosis: record.diagnosis || "",
    prescription: record.prescription || "",
    doctorNotes: record.doctorNotes || "",
    followUpRequired: record.followUpRequired || false,
    followUpDate: record.followUpDate || ""
  });

  // Normalize role and check if user is a doctor
  const normalizedRole = userRole.replace(/^(ROLE_)+/g, "").toUpperCase();
  const isDoctor = normalizedRole === "DOCTOR";
  const canEdit = isDoctor && record.status !== "Completed";

  console.log("👤 Modal Role Check:");
  console.log("  - Raw user role:", userRole);
  console.log("  - Normalized role:", normalizedRole);
  console.log("  - Is Doctor:", isDoctor);
  console.log("  - Can Edit:", canEdit);
  console.log("  - Record status:", record.status);

  const handleSave = async () => {
    if (!doctorNotes.diagnosis.trim()) {
      alert("⚠️ Please enter a diagnosis");
      return;
    }

    console.log("💾 Saving doctor assessment...");
    console.log("Data to save:", doctorNotes);

    setSaving(true);
    try {
      const res = await fetchWithAuth(`/api/medical-records/${record.recordId}/doctor-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorNotes)
      });

      console.log("📤 Server response:", res);

      if (res.status === "success" || res.message?.includes("success")) {
        alert("✅ Medical record updated successfully!");
        setIsEditing(false);
        onUpdate();
        onClose();
      } else {
        alert("⚠️ " + (res.message || res.error || "Failed to update"));
      }
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("❌ Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-bold mb-1">Medical Record #{record.recordId}</h2>
            <p className="text-violet-100">Patient: {record.patientName}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <span className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${
              record.status === "Completed" 
                ? "bg-green-100 text-green-700 border-green-300" 
                : "bg-yellow-100 text-yellow-700 border-yellow-300"
            }`}>
              {record.status}
            </span>
            
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 font-bold shadow-lg transform hover:scale-105 transition-all"
              >
                📝 Add Doctor Assessment
              </button>
            )}
            
            {isDoctor && record.status === "Completed" && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2">
                <p className="text-green-700 font-semibold text-sm">✓ Assessment Complete</p>
              </div>
            )}
            
            {!isDoctor && (
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-2">
                <p className="text-gray-600 font-semibold text-sm">👁️ View Only ({normalizedRole})</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border-2 border-violet-200">
            <h3 className="text-2xl font-bold text-violet-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span> Patient Information
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border-2 border-violet-300 shadow-md">
                <h4 className="text-lg font-bold text-violet-800 mb-4 flex items-center gap-2">
                  <span>👤</span> Personal Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Full Name:</p>
                    <p className="text-gray-900 font-semibold text-base">{record.patientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Contact Number:</p>
                    <p className="text-gray-900 font-semibold">{record.contactNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Email:</p>
                    <p className="text-gray-900 font-semibold">{record.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Date of Birth:</p>
                    <p className="text-gray-900 font-semibold">
                      {record.dateOfBirth 
                        ? new Date(record.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Blood Type:</p>
                    <p className="text-gray-900 font-semibold">{record.bloodType || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-violet-300 shadow-md">
                <h4 className="text-lg font-bold text-violet-800 mb-3 flex items-center gap-2">
                  <span>🩺</span> Chief Complaint / Health Concern
                </h4>
                <p className="text-gray-800 text-lg leading-relaxed">
                  {record.chiefComplaint || "Not specified"}
                </p>
              </div>

              {record.vitals && (
                <div className="bg-white rounded-xl p-6 border border-violet-200">
                  <h4 className="text-lg font-bold text-violet-800 mb-3 flex items-center gap-2">
                    <span>💊</span> Vital Signs
                  </h4>
                  <p className="text-gray-700 font-medium whitespace-pre-wrap">{record.vitals}</p>
                </div>
              )}

              {record.additionalNotes && (
                <div className="bg-white rounded-xl p-6 border border-violet-200">
                  <h4 className="text-lg font-bold text-violet-800 mb-4 flex items-center gap-2">
                    <span>📄</span> Additional Patient Information
                  </h4>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{record.additionalNotes}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">👨‍⚕️</span> Doctor's Clinical Assessment
              </h3>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-800 mb-3">🔬 Diagnosis</h4>
                  <p className="text-gray-800 text-lg">
                    {record.diagnosis || <span className="text-yellow-600 italic">⏳ Pending doctor review</span>}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-800 mb-3">💊 Prescription</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {record.prescription || <span className="text-gray-400 italic">No prescription yet</span>}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-800 mb-3">📝 Doctor's Notes</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {record.doctorNotes || <span className="text-gray-400 italic">No additional notes</span>}
                  </p>
                </div>

                {record.followUpRequired && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Follow-up Required</h4>
                    <p className="text-yellow-700 font-medium">
                      Scheduled for: {record.followUpDate 
                        ? new Date(record.followUpDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })
                        : "To be scheduled"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
              <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">✍️</span> Complete Doctor Assessment
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Diagnosis *</label>
                  <textarea
                    value={doctorNotes.diagnosis}
                    onChange={(e) => setDoctorNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    placeholder="Enter complete diagnosis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Prescription</label>
                  <textarea
                    value={doctorNotes.prescription}
                    onChange={(e) => setDoctorNotes(prev => ({ ...prev, prescription: e.target.value }))}
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    placeholder="Medications, dosages, instructions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Additional Doctor Notes</label>
                  <textarea
                    value={doctorNotes.doctorNotes}
                    onChange={(e) => setDoctorNotes(prev => ({ ...prev, doctorNotes: e.target.value }))}
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    placeholder="Additional observations, recommendations, warnings..."
                  />
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={doctorNotes.followUpRequired}
                        onChange={(e) => setDoctorNotes(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                        className="w-5 h-5 rounded border-2 border-blue-400"
                      />
                      <span className="font-bold text-blue-900">Follow-up Required</span>
                    </label>
                  </div>
                  {doctorNotes.followUpRequired && (
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Follow-up Date</label>
                      <input
                        type="date"
                        value={doctorNotes.followUpDate}
                        onChange={(e) => setDoctorNotes(prev => ({ ...prev, followUpDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-all disabled:bg-gray-300 disabled:transform-none"
                  >
                    {saving ? "Saving..." : "✓ Save Assessment & Mark Complete"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>📅</span> Record Information
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Created Date:</p>
                <p className="font-semibold">
                  {new Date(record.recordCreatedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-semibold">{record.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-8 py-6 border-t-2 border-violet-200 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 font-bold shadow-lg transform hover:scale-105 transition-all"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicalRecords;