import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Calendar, Clock, User, Mail, Phone, Heart, Plus, X, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";


const PatientAppointments = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [submitSuccess, setSubmitSuccess] = useState(false);


  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", suffix: "", gender: "",
    dateOfBirth: "", civilStatus: "", contactNumber: "", email: "", emergencyContactNumber: "",
    addressStreet: "", addressBarangay: "", addressMunicipality: "", addressProvince: "",
    priorityCategory: "", height: "", weight: "", bloodType: "", medicalHistory: "", healthConcern: "",
    appointmentDate: "", appointmentTime: "",
  });


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
    };


    stompClient.onDisconnect = () => {
      console.log("❌ WebSocket Disconnected");
      setIsConnected(false);
    };


    stompClient.onStompError = (frame) => {
      console.error("❌ STOMP Error:", frame);
      setIsConnected(false);
    };


    stompClient.activate();


    return () => {
      console.log("🔌 Cleaning up WebSocket connection");
      stompClient.deactivate();
    };
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const validateStep = (step) => {
    const step1Fields = ["firstName", "lastName", "gender", "dateOfBirth", "civilStatus"];
    const step2Fields = ["contactNumber", "email", "addressStreet", "addressBarangay", "addressMunicipality", "addressProvince"];
    const step3Fields = ["priorityCategory", "healthConcern"];
    const step4Fields = ["appointmentDate", "appointmentTime"];


    let fieldsToCheck = [];
    if (step === 1) fieldsToCheck = step1Fields;
    else if (step === 2) fieldsToCheck = step2Fields;
    else if (step === 3) fieldsToCheck = step3Fields;
    else if (step === 4) fieldsToCheck = step4Fields;


    for (let field of fieldsToCheck) {
      if (!formData[field]) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return false;
      }
    }
    return true;
  };


  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(4, prev + 1));
    }
  };


  const handleSubmit = async () => {
    if (!validateStep(4)) return;


    try {
      const submitData = {
        ...formData,
        height: formData.height || "",
        weight: formData.weight || "",
        dateOfBirth: formData.dateOfBirth,
        date: formData.appointmentDate,
        time: formData.appointmentTime,
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


      setSubmitSuccess(true);
      setTimeout(() => {
        setFormData({
          firstName: "", middleName: "", lastName: "", suffix: "", gender: "",
          dateOfBirth: "", civilStatus: "", contactNumber: "", email: "", emergencyContactNumber: "",
          addressStreet: "", addressBarangay: "", addressMunicipality: "", addressProvince: "",
          priorityCategory: "", height: "", weight: "", bloodType: "", medicalHistory: "", healthConcern: "",
          appointmentDate: "", appointmentTime: "",
        });
        setShowForm(false);
        setActiveStep(1);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("❌ Error submitting appointment:", err);
      alert(err.message);
    }
  };


  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <div className="h-full flex flex-col px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Schedule Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Appointment</span>
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-4">
            Book your medical appointment quickly and easily. Our team will review and confirm your request.
          </p>
         
          <button
            onClick={() => setShowForm(true)}
            disabled={!isConnected}
            className={`px-6 py-3 rounded-2xl font-semibold text-base transition-all flex items-center gap-3 mx-auto shadow-xl ${
              isConnected
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Book Your Appointment
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Quick Process</h3>
            <p className="text-gray-600 text-sm">Complete booking in under 5 minutes</p>
          </div>


          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Instant Confirmation</h3>
            <p className="text-gray-600 text-sm">Get notified once approved by staff</p>
          </div>


          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Quality Care</h3>
            <p className="text-gray-600 text-sm">Professional healthcare services</p>
          </div>
        </div>
      </div>


      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
            {!submitSuccess ? (
              <>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-3xl flex-shrink-0">
                  <div>
                    <h3 className="text-xl font-bold">Book Appointment</h3>
                    <p className="text-indigo-100 text-sm mt-1">Step {activeStep} of 4</p>
                  </div>
                  <button onClick={() => { setShowForm(false); setActiveStep(1); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>


                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="flex items-center justify-between max-w-xl mx-auto">
                    {[
                      { num: 1, label: "Personal" },
                      { num: 2, label: "Contact" },
                      { num: 3, label: "Medical" },
                      { num: 4, label: "Schedule" }
                    ].map((step, idx) => (
                      <div key={step.num} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            activeStep >= step.num
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step.num}
                          </div>
                          <span className={`text-xs mt-1 font-medium ${activeStep >= step.num ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        {idx < 3 && (
                          <div className={`w-12 sm:w-16 h-1 mx-2 transition-all ${
                            activeStep > step.num ? 'bg-indigo-600' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>


                <div className="px-6 py-4 flex-1 overflow-y-auto">
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Personal Information</h4>
                          <p className="text-sm text-gray-500">Tell us about yourself</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="text" name="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="text" name="suffix" placeholder="Suffix (Jr., Sr., III)" value={formData.suffix} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <select name="gender" value={formData.gender} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm">
                          <option value="">Select Gender *</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <input type="date" name="dateOfBirth" placeholder="Date of Birth *" value={formData.dateOfBirth} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-2 text-sm">
                          <option value="">Select Civil Status *</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Divorced">Divorced</option>
                        </select>
                      </div>
                    </div>
                  )}


                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <Phone className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Contact & Address</h4>
                          <p className="text-sm text-gray-500">How can we reach you?</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" name="contactNumber" placeholder="Contact Number *" value={formData.contactNumber} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="text" name="emergencyContactNumber" placeholder="Emergency Contact" value={formData.emergencyContactNumber} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-2 text-sm" />
                        <input type="text" name="addressStreet" placeholder="Street Address *" value={formData.addressStreet} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-2 text-sm" />
                        <input type="text" name="addressBarangay" placeholder="Barangay *" value={formData.addressBarangay} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="text" name="addressMunicipality" placeholder="Municipality *" value={formData.addressMunicipality} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="text" name="addressProvince" placeholder="Province *" value={formData.addressProvince} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-2 text-sm" />
                      </div>
                    </div>
                  )}


                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <Heart className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Medical Information</h4>
                          <p className="text-sm text-gray-500">Help us provide better care</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select name="priorityCategory" value={formData.priorityCategory} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-3 text-sm">
                          <option value="">Select Priority Category *</option>
                          <option value="Priority (Pregnant)">Priority (Pregnant)</option>
                          <option value="Priority (Senior)">Priority (Senior)</option>
                          <option value="Priority (PWD)">Priority (PWD)</option>
                          <option value="Priority (Infant)">Priority (Infant)</option>
                          <option value="Regular">Regular</option>
                        </select>
                        <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <input type="text" name="bloodType" placeholder="Blood Type" value={formData.bloodType} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                        <textarea name="medicalHistory" placeholder="Medical History (Optional)" value={formData.medicalHistory} onChange={handleChange} rows="2" className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-3 resize-none text-sm" />
                        <textarea name="healthConcern" placeholder="Current Health Concern *" value={formData.healthConcern} onChange={handleChange} rows="2" className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-3 resize-none text-sm" />
                      </div>
                    </div>
                  )}


                  {activeStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Appointment Schedule</h4>
                          <p className="text-sm text-gray-500">Choose your preferred date and time</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date *</label>
                          <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all w-full text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time *</label>
                          <input type="time" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all w-full text-sm" />
                        </div>
                        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mt-2">
                          <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-blue-900 mb-1 text-sm">Appointment Review</p>
                              <p className="text-sm text-blue-800">Your appointment will be reviewed and confirmed by our medical staff. You'll receive a notification once it's approved.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-3xl flex-shrink-0">
                  <button
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    disabled={activeStep === 1}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                      activeStep === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Previous
                  </button>
                  {activeStep < 4 ? (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Submit Appointment
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Submitted!</h3>
                <p className="text-gray-600 text-center">We'll review your request and send you a confirmation shortly.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default PatientAppointments;
