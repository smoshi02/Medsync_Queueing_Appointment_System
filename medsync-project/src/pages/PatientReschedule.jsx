import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PatientReschedule = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const actionParam = searchParams.get("action"); // Get action from URL
  
  const [currentView, setCurrentView] = useState(""); // "cancel", "reschedule", or "choose"
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
  });

  // Set the view based on URL parameter
  useEffect(() => {
    if (actionParam === "cancel") {
      setCurrentView("cancel");
    } else if (actionParam === "reschedule") {
      setCurrentView("reschedule");
    } else {
      setCurrentView("choose");
    }
  }, [actionParam]);

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Invalid Link</h2>
          <p className="text-gray-600 text-center">
            This appointment link is invalid or has expired. Please contact MedSync for assistance.
          </p>
        </div>
      </div>
    );
  }

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:6969/api/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      console.error("Cancel error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      setError("Please select both date and time");
      return;
    }

    if (!window.confirm("Confirm reschedule? Your appointment will need re-approval.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:6969/api/appointments/${appointmentId}/reschedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rescheduleData),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reschedule appointment");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      console.error("Reschedule error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {currentView === "cancel" ? "Appointment Cancelled" : "Appointment Rescheduled"}
          </h2>
          <p className="text-gray-600 mb-6">
            {currentView === "cancel"
              ? "Your appointment has been successfully cancelled. You will receive a confirmation email shortly."
              : "Your appointment has been rescheduled and is now pending approval. You will receive a confirmation email once approved."}
          </p>
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
            <p className="text-sm text-violet-800">
              <strong>Need help?</strong> Contact us at +63-XXX-XXX-XXXX
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Cancel View
  if (currentView === "cancel") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
              Cancel Appointment
            </h1>
            <p className="text-gray-600">
              Appointment ID: <span className="font-semibold">#{appointmentId}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <div className="text-red-500 text-2xl">⚠️</div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Cancel Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Cancel Your Appointment</h3>
              <p className="text-gray-600">
                Are you sure you want to cancel your appointment? This action cannot be undone.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> You will receive a confirmation email once the cancellation is processed.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 transform
                  ${loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 hover:scale-105 shadow-md'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Yes, Cancel Appointment'
                )}
              </button>

              <button
                onClick={() => setCurrentView("choose")}
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mt-6">
            <div className="flex items-start gap-4">
              <div className="text-blue-500 text-3xl">💡</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Need Assistance?</h4>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>MedSync Contact:</strong> +63-XXX-XXX-XXXX<br />
                    <strong>Email:</strong> support@medsync.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reschedule View
  if (currentView === "reschedule") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
              Reschedule Appointment
            </h1>
            <p className="text-gray-600">
              Appointment ID: <span className="font-semibold">#{appointmentId}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <div className="text-red-500 text-2xl">⚠️</div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Reschedule Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-violet-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Choose New Date & Time</h3>
              <p className="text-gray-600 text-sm">
                Select your preferred date and time. Your appointment will need re-approval.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-violet-800">
                <strong>Note:</strong> You will receive a confirmation email once your new appointment is approved.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleReschedule}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 transform
                  ${loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 hover:scale-105 shadow-md'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Confirm Reschedule'
                )}
              </button>

              <button
                onClick={() => setCurrentView("choose")}
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mt-6">
            <div className="flex items-start gap-4">
              <div className="text-blue-500 text-3xl">💡</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Need Assistance?</h4>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>MedSync Contact:</strong> +63-XXX-XXX-XXXX<br />
                    <strong>Email:</strong> support@medsync.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Choose Action View (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
            Manage Your Appointment
          </h1>
          <p className="text-gray-600">
            Appointment ID: <span className="font-semibold">#{appointmentId}</span>
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Cancel Card */}
          <div 
            onClick={() => setCurrentView("cancel")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Cancel Appointment</h3>
              <p className="text-gray-600 text-sm mb-4">
                Cancel your scheduled appointment. You will receive a confirmation email.
              </p>
              <div className="text-red-600 font-semibold">Click to Cancel →</div>
            </div>
          </div>

          {/* Reschedule Card */}
          <div 
            onClick={() => setCurrentView("reschedule")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Reschedule Appointment</h3>
              <p className="text-gray-600 text-sm mb-4">
                Choose a new date and time. Your appointment will need re-approval.
              </p>
              <div className="text-violet-600 font-semibold">Click to Reschedule →</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="text-blue-500 text-3xl">💡</div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Need Assistance?</h4>
              <p className="text-gray-600 text-sm mb-3">
                If you have any questions or need help with your appointment, please don't hesitate to contact us.
              </p>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>MedSync Contact:</strong> +63-XXX-XXX-XXXX<br />
                  <strong>Email:</strong> support@medsync.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReschedule;