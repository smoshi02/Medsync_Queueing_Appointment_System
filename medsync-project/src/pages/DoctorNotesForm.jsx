import { useState } from "react";
import { fetchWithAuth } from "../js/fetchHelper";

function DoctorNotesForm({ record, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    diagnosis: record.diagnosis || "",
    prescription: record.prescription || "",
    vitals: record.vitals || "",
    doctorNotes: record.doctorNotes || "",
    followUpRequired: record.followUpRequired || false,
    followUpDate: record.followUpDate || "",
    doctorId: null // Should be set from logged-in doctor's session
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetchWithAuth(
        `/api/medical-records/${record.recordId}/doctor-notes`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      setSuccess(true);
      setTimeout(() => {
        onUpdate?.();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || "Failed to save doctor notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Add Doctor Notes</h2>
            <p className="text-violet-100 text-sm">Record #{record.recordId} - {record.patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-700 font-medium">✓ Notes saved successfully!</p>
            </div>
          )}

          {/* Patient Information Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-violet-600">📋</span>
              Patient Information
            </h3>
            <div className="bg-white rounded-lg p-4 border border-violet-100">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {record.additionalNotes || "No patient information recorded"}
              </pre>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Chief Complaint (From Patient)
            </label>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-700">{record.chiefComplaint || "Not specified"}</p>
            </div>
          </div>

          {/* Vitals */}
          <div className="mb-6">
            <label htmlFor="vitals" className="block text-sm font-bold text-gray-700 mb-2">
              Vital Signs
            </label>
            <textarea
              id="vitals"
              name="vitals"
              value={formData.vitals}
              onChange={handleChange}
              rows={3}
              placeholder="Blood Pressure: 120/80 mmHg&#10;Temperature: 36.5°C&#10;Heart Rate: 72 bpm&#10;Respiratory Rate: 16/min"
              className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors font-mono text-sm"
            />
          </div>

          {/* Diagnosis */}
          <div className="mb-6">
            <label htmlFor="diagnosis" className="block text-sm font-bold text-gray-700 mb-2">
              Diagnosis *
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Enter diagnosis..."
              className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Prescription */}
          <div className="mb-6">
            <label htmlFor="prescription" className="block text-sm font-bold text-gray-700 mb-2">
              Prescription *
            </label>
            <textarea
              id="prescription"
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Enter medications and dosage instructions..."
              className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Doctor Notes */}
          <div className="mb-6">
            <label htmlFor="doctorNotes" className="block text-sm font-bold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="doctorNotes"
              name="doctorNotes"
              value={formData.doctorNotes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional observations or recommendations..."
              className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Follow-up Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="followUpRequired"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleChange}
                className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
              />
              <label htmlFor="followUpRequired" className="ml-3 text-sm font-bold text-gray-700">
                Follow-up Required
              </label>
            </div>

            {formData.followUpRequired && (
              <div>
                <label htmlFor="followUpDate" className="block text-sm font-bold text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  id="followUpDate"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-t border-violet-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorNotesForm;