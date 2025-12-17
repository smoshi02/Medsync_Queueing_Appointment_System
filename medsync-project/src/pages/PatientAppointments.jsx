import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Heart,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import sangabVideo from "../assets/sangab.mp4";

const PatientAppointments = () => {
  const [isConnected, setIsConnected] = useState(true); // Simulated connection
  const [showForm, setShowForm] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}
    
  );

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "",
    dateOfBirth: "",
    civilStatus: "",
    contactNumber: "",
    email: "",
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
    appointmentDate: "",
    appointmentTime: "",
  });

  const validationRules = {
    1: {
      firstName: {
        required: true,
        minLength: 2,
        message: "First name is required",
      },
      lastName: {
        required: true,
        minLength: 2,
        message: "Last name is required",
      },
      gender: { required: true, message: "Gender is required" },
      dateOfBirth: { required: true, message: "Date of birth is required" },
      civilStatus: { required: true, message: "Civil status is required" },
    },
    2: {
      contactNumber: {
        required: true,
        pattern: /^[0-9]{10,11}$/,
        message: "Contact number must be 10–11 digits",
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Valid email is required",
      },
      emergencyContactNumber: {
        required: true,
        pattern: /^[0-9]{10,11}$/,
        message: "Emergency contact is required",
      },
      addressStreet: { required: true, message: "Street is required" },
      addressBarangay: { required: true, message: "Barangay is required" },
      addressMunicipality: {
        required: true,
        message: "Municipality is required",
      },
      addressProvince: { required: true, message: "Province is required" },
    },
    3: {
      priorityCategory: {
        required: true,
        message: "Priority category is required",
      },
      healthConcern: {
        required: true,
        minLength: 10,
        message: "Health concern must be at least 10 characters",
      },
    },
    4: {
      appointmentDate: {
        required: true,
        message: "Appointment date is required",
      },
      appointmentTime: {
        required: true,
        message: "Appointment time is required",
      },
    },
  };

  const validateField = (name, value) => {
    const rules = validationRules[activeStep]?.[name];
    if (!rules) return "";

    if (rules.required && !value) return rules.message;
    if (rules.minLength && value.length < rules.minLength) return rules.message;
    if (rules.pattern && !rules.pattern.test(value)) return rules.message;

    return "";
  };

  const inputClass = (name) =>
    `px-3 py-2.5 border-2 rounded-xl text-sm w-full transition-all
   ${
     touched[name] && errors[name]
       ? "border-red-500 focus:ring-red-500"
       : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
   }`;

  const validateStep = (step) => {
    const rules = validationRules[step];
    if (!rules) return true;

    let valid = true;
    const newErrors = {};

    Object.keys(rules).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        valid = false;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const handlePrevious = () => {
  setActiveStep((prev) => Math.max(1, prev - 1));
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleNext = () => {
    const rules = validationRules[activeStep];
    if (rules) {
      const newTouched = {};
      Object.keys(rules).forEach((f) => (newTouched[f] = true));
      setTouched((prev) => ({ ...prev, ...newTouched }));
    }

    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(4, prev + 1));
    }
  };

 const handleSubmit = async () => {
  let allValid = true;

  for (let step = 1; step <= 4; step++) {
    if (!validateStep(step)) {
      setActiveStep(step);
      allValid = false;
      break;
    }
  }

  if (!allValid) return;

  // ✅ ADD THIS - Actually submit to backend
  try {
    console.log("📤 Submitting appointment data...");
    
    const response = await fetch("http://localhost:6969/api/patient/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Map form fields to your backend DTO
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        suffix: formData.suffix,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        civilStatus: formData.civilStatus,
        contactNumber: formData.contactNumber,
        email: formData.email,
        emergencyContactNumber: formData.emergencyContactNumber,
        addressStreet: formData.addressStreet,
        addressBarangay: formData.addressBarangay,
        addressMunicipality: formData.addressMunicipality,
        addressProvince: formData.addressProvince,
        priorityCategory: formData.priorityCategory,
        height: formData.height,
        weight: formData.weight,
        bloodType: formData.bloodType,
        medicalHistory: formData.medicalHistory,
        healthConcern: formData.healthConcern,
        date: formData.appointmentDate, // ✅ Maps to appointment date
        time: formData.appointmentTime, // ✅ Maps to appointment time
      }),
    });

    const result = await response.json();
    console.log("✅ Response:", result);

    if (response.ok) {
      setSubmitSuccess(true);

      setTimeout(() => {
        setShowForm(false);
        setActiveStep(1);
        setSubmitSuccess(false);
        // Reset form
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          suffix: "",
          gender: "",
          dateOfBirth: "",
          civilStatus: "",
          contactNumber: "",
          email: "",
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
          appointmentDate: "",
          appointmentTime: "",
        });
        setErrors({});
        setTouched({});
      }, 2000);
    } else {
      alert("❌ Failed to submit: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("❌ Submit error:", error);
    alert("❌ Failed to submit appointment: " + error.message);
  }
};

  return (
    <div className="h-full relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/src/assets/sangab.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-blue-700/40 to-blue-900/60 "></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 animate-float"
          style={{ animationDelay: "0s" }}
        >
          <Heart className="w-8 h-8 text-white/20" />
        </div>
        <div
          className="absolute top-1/3 right-1/4 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <Calendar className="w-10 h-10 text-white/20" />
        </div>
        <div
          className="absolute bottom-1/3 left-1/3 animate-float"
          style={{ animationDelay: "2s" }}
        >
          <User className="w-7 h-7 text-white/20" />
        </div>
        <div
          className="absolute top-1/2 right-1/3 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <Plus className="w-9 h-9 text-white/20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">
                Healthcare Portal
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Schedule Your{" "}
            <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Appointment
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-6 drop-shadow-md">
            Book your medical appointment quickly and easily. Our team will
            review and confirm your request.
          </p>

          <button
            onClick={() => setShowForm(true)}
            disabled={!isConnected}
            className={`px-8 py-4 rounded-2xl font-semibold text-base transition-all flex items-center gap-3 mx-auto shadow-2xl backdrop-blur-sm ${
              isConnected
                ? "bg-white text-blue-600 hover:shadow-blue-300/50 hover:shadow-2xl transform hover:scale-105 border-2 border-blue-200"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Book Your Appointment
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 text-center transform hover:scale-105 transition-all hover:shadow-white/10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Quick Process
            </h3>
            <p className="text-gray-600">Complete booking in under 5 minutes</p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 text-center transform hover:scale-105 transition-all hover:shadow-white/10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Instant Confirmation
            </h3>
            <p className="text-gray-600">Get notified once approved by staff</p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 text-center transform hover:scale-105 transition-all hover:shadow-white/10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Quality Care
            </h3>
            <p className="text-gray-600">Professional healthcare services</p>
          </div>
        </div>
      </div>

      {/* Form Modal with Validation */}
{showForm && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
      {!submitSuccess ? (
        <>
          <div className="bg-[#4F46E5] text-white px-6 py-4 flex items-center justify-between rounded-t-3xl flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold">Book Appointment</h3>
              <p className="text-indigo-100 text-sm mt-1">
                Step {activeStep} of 4
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(false);
                setActiveStep(1);
              }}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              {[
                { num: 1, label: "Personal" },
                { num: 2, label: "Contact" },
                { num: 3, label: "Medical" },
                { num: 4, label: "Schedule" },
              ].map((step, idx) => (
                <div key={step.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        activeStep >= step.num
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.num}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium ${
                        activeStep >= step.num
                          ? "text-indigo-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`w-12 sm:w-16 h-1 mx-2 transition-all ${
                        activeStep > step.num
                          ? "bg-indigo-600"
                          : "bg-gray-200"
                      }`}
                    />
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
                    <h4 className="font-bold text-gray-900 text-base">
                      Personal Information
                    </h4>
                    <p className="text-sm text-gray-500">
                      Tell us about yourself
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("firstName")}
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="middleName"
                      placeholder="Middle Name"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("lastName")}
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <input
                    type="text"
                    name="suffix"
                    placeholder="Suffix (Jr., Sr., III)"
                    value={formData.suffix}
                    onChange={handleChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  />
                  
                  <div className="flex flex-col">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("gender")}
                    >
                      <option value="">Select Gender *</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {touched.gender && errors.gender && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="date"
                      name="dateOfBirth"
                      placeholder="Date of Birth *"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("dateOfBirth")}
                    />
                    {touched.dateOfBirth && errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <select
                      name="civilStatus"
                      value={formData.civilStatus}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("civilStatus")}
                    >
                      <option value="">Select Civil Status *</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                    {touched.civilStatus && errors.civilStatus && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.civilStatus}
                      </p>
                    )}
                  </div>
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
                    <h4 className="font-bold text-gray-900 text-base">
                      Contact & Address
                    </h4>
                    <p className="text-sm text-gray-500">
                      How can we reach you?
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="contactNumber"
                      placeholder="Contact Number *"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("contactNumber")}
                    />
                    {touched.contactNumber && errors.contactNumber && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.contactNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("email")}
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <input
                      type="text"
                      name="emergencyContactNumber"
                      placeholder="Emergency Contact"
                      value={formData.emergencyContactNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("emergencyContactNumber")}
                    />
                    {touched.emergencyContactNumber && errors.emergencyContactNumber && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.emergencyContactNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <input
                      type="text"
                      name="addressStreet"
                      placeholder="Street Address *"
                      value={formData.addressStreet}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("addressStreet")}
                    />
                    {touched.addressStreet && errors.addressStreet && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.addressStreet}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="addressBarangay"
                      placeholder="Barangay *"
                      value={formData.addressBarangay}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("addressBarangay")}
                    />
                    {touched.addressBarangay && errors.addressBarangay && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.addressBarangay}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="addressMunicipality"
                      placeholder="Municipality *"
                      value={formData.addressMunicipality}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("addressMunicipality")}
                    />
                    {touched.addressMunicipality && errors.addressMunicipality && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.addressMunicipality}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <input
                      type="text"
                      name="addressProvince"
                      placeholder="Province *"
                      value={formData.addressProvince}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("addressProvince")}
                    />
                    {touched.addressProvince && errors.addressProvince && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.addressProvince}
                      </p>
                    )}
                  </div>
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
                    <h4 className="font-bold text-gray-900 text-base">
                      Medical Information
                    </h4>
                    <p className="text-sm text-gray-500">
                      Help us provide better care
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col md:col-span-3">
                    <select
                      name="priorityCategory"
                      value={formData.priorityCategory}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("priorityCategory")}
                    >
                      <option value="">Select Priority Category *</option>
                      <option value="Priority (Pregnant)">
                        Priority (Pregnant)
                      </option>
                      <option value="Priority (Senior)">
                        Priority (Senior)
                      </option>
                      <option value="Priority (PWD)">Priority (PWD)</option>
                      <option value="Priority (Infant)">
                        Priority (Infant)
                      </option>
                      <option value="Regular">Regular</option>
                    </select>
                    {touched.priorityCategory && errors.priorityCategory && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.priorityCategory}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="number"
                      name="height"
                      placeholder="Height (cm)"
                      value={formData.height}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("height")}
                    />
                    {touched.height && errors.height && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.height}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="number"
                      name="weight"
                      placeholder="Weight (kg)"
                      value={formData.weight}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("weight")}
                    />
                    {touched.weight && errors.weight && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.weight}
                      </p>
                    )}
                  </div>

                  <input
                    type="text"
                    name="bloodType"
                    placeholder="Blood Type"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  />

                  <textarea
                    name="medicalHistory"
                    placeholder="Medical History (Optional)"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows="2"
                    className="px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all md:col-span-3 resize-none text-sm"
                  />

                  <div className="flex flex-col md:col-span-3">
                    <textarea
                      name="healthConcern"
                      placeholder="Current Health Concern *"
                      value={formData.healthConcern}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows="2"
                      className={inputClass("healthConcern")}
                    />
                    {touched.healthConcern && errors.healthConcern && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.healthConcern}
                      </p>
                    )}
                  </div>
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
                    <h4 className="font-bold text-gray-900 text-base">
                      Appointment Schedule
                    </h4>
                    <p className="text-sm text-gray-500">
                      Choose your preferred date and time
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={new Date().toISOString().split("T")[0]}
                      className={inputClass("appointmentDate")}
                    />
                    {touched.appointmentDate && errors.appointmentDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.appointmentDate}  
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("appointmentTime")}
                    />
                    {touched.appointmentTime && errors.appointmentTime && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.appointmentTime}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mt-2">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1 text-sm">
                          Appointment Review
                        </p>
                        <p className="text-sm text-blue-800">
                          Your appointment will be reviewed and confirmed
                          by our medical staff. You'll receive a
                          notification once it's approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
            <button
              onClick={handlePrevious}
              disabled={activeStep === 1}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                activeStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
            <button
              onClick={activeStep === 4 ? handleSubmit : handleNext}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm"
            >
              {activeStep === 4 ? "Submit" : "Next"}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 text-center mb-6">
            Your appointment has been submitted successfully.
          </p>
          <button
            onClick={() => {
              setShowForm(false);
              setSubmitSuccess(false);
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  </div>
)}
                

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PatientAppointments;
