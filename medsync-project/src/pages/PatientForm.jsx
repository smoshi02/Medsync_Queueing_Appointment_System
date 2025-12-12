import { useState } from "react";

function PatientForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    civilStatus: "",
    contactNumber: "",
    emergencyContactNumber: "",
    addressStreet: "",
    addressBarangay: "",
    addressMunicipality: "",
    addressProvince: "",
    priorityCategory: "",
    height: "",
    weight: "",
    pastMedicalHistory: "",
    presentComplaint: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save patient data");

      setSuccessMessage("Patient registered successfully!");
      setErrorMessage("");
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        civilStatus: "",
        contactNumber: "",
        emergencyContactNumber: "",
        addressStreet: "",
        addressBarangay: "",
        addressMunicipality: "",
        addressProvince: "",
        priorityCategory: "",
        height: "",
        weight: "",
        pastMedicalHistory: "",
        presentComplaint: "",
      });
    } catch (err) {
      setErrorMessage(err.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Patient Registration Form</h2>

      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="middleName"
            placeholder="Middle Name"
            value={formData.middleName}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Gender and Civil Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="civilStatus"
            value={formData.civilStatus}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </div>

        {/* Date of Birth and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <select
            name="priorityCategory"
            value={formData.priorityCategory}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Priority Category</option>
            <option value="Regular">Regular</option>
            <option value="Priority">Priority</option>
            <option value="Appointment">Appointment</option>
          </select>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="emergencyContactNumber"
            placeholder="Emergency Contact"
            value={formData.emergencyContactNumber}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="addressStreet"
            placeholder="Street"
            value={formData.addressStreet}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="addressBarangay"
            placeholder="Barangay"
            value={formData.addressBarangay}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="addressMunicipality"
            placeholder="Municipality"
            value={formData.addressMunicipality}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="addressProvince"
            placeholder="Province"
            value={formData.addressProvince}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Height, Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={formData.height}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Past Medical History */}
        <textarea
          name="pastMedicalHistory"
          placeholder="Past Medical History"
          value={formData.pastMedicalHistory}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          rows={3}
        ></textarea>

        {/* Present Complaint */}
        <textarea
          name="presentComplaint"
          placeholder="Present Complaint"
          value={formData.presentComplaint}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          rows={3}
        ></textarea>

        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-all"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default PatientForm;
