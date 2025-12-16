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
      setRecords(data);
      
      const roleRaw = localStorage.getItem("role") || "";
      const normalizedRole = roleRaw.replace(/^(ROLE_)+/g, "").toUpperCase();
      setUserRole(normalizedRole);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  useStompWebSocket(["/topic/medical-records"], (msg) => {
    if (msg && typeof msg === 'object') {
      if (msg.type === "records-update" && msg.data) {
        setRecords(msg.data);
      } else if (Array.isArray(msg)) {
        setRecords(msg);
      } else {
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#503878] border-t-transparent mb-4"></div>
          <p className="text-[#503878] text-xl font-medium">Loading medical records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="bg-red-50 p-8 rounded-xl border border-red-200">
          <div className="flex items-center gap-4">
            <div className="text-red-500 text-3xl">⚠️</div>
            <div>
              <h3 className="text-red-600 text-xl font-semibold mb-1">Error Loading Records</h3>
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
          <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#503878] to-[#D946EF] bg-clip-text text-transparent mb-2">
            Medical Records
          </h1>
          <p className="text-gray-500 text-base">Complete patient information and medical assessments</p>
          {userRole && (
            <p className="text-sm text-gray-500 mt-1">Logged in as: <span className="font-semibold">{userRole}</span></p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search by patient, health concern, or record #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#503878] focus:ring-2 focus:ring-purple-100 transition-all"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-semibold text-[#503878]">{records.length}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mt-1">Total Records</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="text-center">
                <p className="text-3xl font-semibold text-[#8B5DB8]">{filteredRecords.length}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mt-1">Showing</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="text-center">
                <p className="text-3xl font-semibold text-green-600">
                  {records.filter(r => r.status === "Completed").length}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mt-1">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-7xl mb-6">📋</div>
              <p className="text-gray-500 text-xl font-medium mb-2">
                {searchTerm ? "No records match your search" : "No medical records yet"}
              </p>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="text-[#503878] hover:text-[#D946EF] font-medium underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-5 text-left text-gray-700 font-semibold text-sm">Patient</th>
                    <th className="p-5 text-left text-gray-700 font-semibold text-sm">Contact</th>
                    <th className="p-5 text-left text-gray-700 font-semibold text-sm">Chief Complaint</th>
                    <th className="p-5 text-left text-gray-700 font-semibold text-sm">Diagnosis</th>
                    <th className="p-5 text-left text-gray-700 font-semibold text-sm">Status</th>
                    <th className="p-5 text-left text-gray-700 font-semibold text-sm">Date</th>
                    <th className="p-5 text-left text-gray-700 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.recordId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#503878] to-[#D946EF] flex items-center justify-center text-white font-semibold shadow-sm">
                            {record.patientName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{record.patientName}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-gray-700">{record.contactNumber || "—"}</span>
                      </td>
                      <td className="p-5 max-w-xs">
                        <span className="text-gray-700">{record.chiefComplaint || "—"}</span>
                      </td>
                      <td className="p-5">
                        <span className="text-gray-700">
                          {record.diagnosis || "Pending"}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                          record.status === "Completed" 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="text-sm text-gray-800 font-medium">
                          {new Date(record.recordCreatedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#503878] to-[#D946EF] text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-sm"
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

  const normalizedRole = userRole.replace(/^(ROLE_)+/g, "").toUpperCase();
  const isDoctor = normalizedRole === "DOCTOR";
  const canEdit = isDoctor && record.status !== "Completed";

  const handleSave = async () => {
    if (!doctorNotes.diagnosis.trim()) {
      alert("⚠️ Please enter a diagnosis");
      return;
    }

    setSaving(true);
    try {
      const res = await fetchWithAuth(`/api/medical-records/${record.recordId}/doctor-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorNotes)
      });

      if (res.status === "success" || res.message?.includes("success")) {
        alert("✅ Medical record updated successfully!");
        setIsEditing(false);
        onUpdate();
        onClose();
      } else {
        alert("⚠️ " + (res.message || res.error || "Failed to update"));
      }
    } catch (err) {
      alert("❌ Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#503878] to-[#D946EF] text-white p-6 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-3xl font-semibold mb-1">Medical Record #{record.recordId}</h2>
            <p className="text-white/90 text-sm">Patient: {record.patientName}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <span className={`px-6 py-3 rounded-full text-base font-semibold border ${
              record.status === "Completed" 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
            }`}>
              {record.status}
            </span>
            
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:opacity-90 font-semibold shadow-sm transition-all"
              >
                Add Doctor Assessment
              </button>
            )}
            
            {isDoctor && record.status === "Completed" && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-2.5">
                <p className="text-green-700 font-semibold text-sm">✓ Assessment Complete</p>
              </div>
            )}
            
            {!isDoctor && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg px-5 py-2.5">
                <p className="text-gray-600 font-semibold text-sm">View Only ({normalizedRole})</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">Patient Information</h3>
            
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Full Name</p>
                    <p className="text-gray-900 font-medium">{record.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Contact Number</p>
                    <p className="text-gray-900 font-medium">{record.contactNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Email</p>
                    <p className="text-gray-900 font-medium">{record.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Date of Birth</p>
                    <p className="text-gray-900 font-medium">
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
                    <p className="text-sm text-gray-600 mb-2">Blood Type</p>
                    <p className="text-gray-900 font-medium">{record.bloodType || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Chief Complaint / Health Concern</h4>
                <p className="text-gray-800 leading-relaxed">
                  {record.chiefComplaint || "Not specified"}
                </p>
              </div>

              {record.vitals && (
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{record.vitals}</p>
                </div>
              )}

              {record.additionalNotes && (
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Patient Information</h4>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{record.additionalNotes}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8">Doctor's Clinical Assessment</h3>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h4>
                  <p className="text-gray-800">
                    {record.diagnosis || <span className="text-yellow-600 italic">Pending doctor review</span>}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Prescription</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {record.prescription || <span className="text-gray-400 italic">No prescription yet</span>}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Doctor's Notes</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {record.doctorNotes || <span className="text-gray-400 italic">No additional notes</span>}
                  </p>
                </div>

                {record.followUpRequired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
                    <h4 className="text-lg font-semibold text-yellow-900 mb-3">Follow-up Required</h4>
                    <p className="text-yellow-800 font-medium">
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
            <div className="bg-green-50 rounded-xl p-8 border border-green-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8">Complete Doctor Assessment</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Diagnosis *</label>
                  <textarea
                    value={doctorNotes.diagnosis}
                    onChange={(e) => setDoctorNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    placeholder="Enter complete diagnosis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Prescription</label>
                  <textarea
                    value={doctorNotes.prescription}
                    onChange={(e) => setDoctorNotes(prev => ({ ...prev, prescription: e.target.value }))}
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    placeholder="Medications, dosages, instructions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Additional Doctor Notes</label>
                  <textarea
                    value={doctorNotes.doctorNotes}
                    onChange={(e) => setDoctorNotes(prev => ({ ...prev, doctorNotes: e.target.value }))}
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    placeholder="Additional observations, recommendations, warnings..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={doctorNotes.followUpRequired}
                        onChange={(e) => setDoctorNotes(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                        className="w-5 h-5 rounded border-2 border-blue-400"
                      />
                      <span className="font-semibold text-blue-900">Follow-up Required</span>
                    </label>
                  </div>
                  {doctorNotes.followUpRequired && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Follow-up Date</label>
                      <input
                        type="date"
                        value={doctorNotes.followUpDate}
                        onChange={(e) => setDoctorNotes(prev => ({ ...prev, followUpDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 font-semibold shadow-sm transition-all disabled:bg-gray-300 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Assessment & Mark Complete"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Record Information</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Created Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(record.recordCreatedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <p className="font-medium text-gray-900">{record.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-10 py-6 border-t border-gray-200 flex justify-end sticky bottom-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-[#503878] to-[#D946EF] text-white rounded-lg hover:opacity-90 font-semibold shadow-sm transition-all"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicalRecords;