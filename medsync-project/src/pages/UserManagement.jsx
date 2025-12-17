import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";


// Validation messages
const validationMessages = {
  firstName: "First name is required",
  lastName: "Last name is required",
  middleName: "Middle name is required", // optional
  username: "Username is required",
  password: "Password is required",
  email: "Email is required",
  role: "Role is required",
  addressStreet: "Street address is required",
  addressBarangay: "Barangay is required",
  addressMunicipality: "Municipality is required",
  addressProvince: "Province is required",
  phoneNumber: "Phone number is required",
  emergencyContactNumber: "Emergency contact number is required",
};


function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/users");
      setUsers(
        data.map((u) => ({
          ...u,
          id: u.id || u.staffId || u.doctorId,
          name: u.name,
          email: u.email || "",
          status: u.status || "active",
        }))
      );
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadUsers();
  }, []);


 useStompWebSocket(["/topic/users"], (msg) => {
  if (msg.type === "user-login" || msg.type === "user-logout") {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === msg.userId && u.role === msg.role
          ? { ...u, status: msg.type === "user-login" ? "active" : "inactive" }
          : u
      )
    );
  }
});



  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await fetchWithAuth(`/api/users/${user.role}/${user.id}/status?status=${newStatus}`, {
        method: "PUT",
      });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
    } catch (err) {
      setError(err.message);
    }
  };


  const deleteUser = async (user) => {
    try {
      await fetchWithAuth(`/api/users/${user.role}/${user.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message);
    }
  };


  const fetchFullUser = async (user, setFn) => {
    try {
      const fullUser = await fetchWithAuth(`/api/users/${user.role}/${user.id}`);
      fullUser.id = fullUser.id || fullUser.staffId || fullUser.doctorId;
      fullUser.role = user.role;
      setFn(fullUser);
    } catch (err) {
      setError(err.message);
    }
  };


  const updateUser = async (updatedUser) => {
    try {
      const saved = await fetchWithAuth(
        `/api/users/admin/edit/${updatedUser.role}/${updatedUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        }
      );


      const tableUser = {
        ...saved,
        id: saved.id || saved.staffId || saved.doctorId,
        role: updatedUser.role,
        status: saved.status || saved.employmentStatus || "active",
        name: `${saved.firstName || ""} ${saved.middleName || ""} ${saved.lastName || ""}`.trim(),
        email: saved.email || "N/A",
      };


      setUsers((prev) => prev.map((u) => (u.id === tableUser.id ? tableUser : u)));
    } catch (err) {
      setError(err.message || "Failed to update user");
    }
  };


  const filteredUsers = filterRole === "all" ? users : users.filter((u) => u.role === filterRole);


  if (loading)
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-violet-700 text-xl font-semibold">Loading users...</p>
        </div>
      </div>
    );


  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      </div>
    );


  return (
    <div className="min-h-screen bg-white p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#5996EC] to-[#4785DB] bg-clip-text text-transparent mb-2">User Management</h1>
        <p className="text-gray-600">Manage doctors, staff, and system users</p>
      </div>


      {/* Filters & Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          {["all", "doctor", "staff"].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${filterRole === role
                  ? "bg-[#177EF3] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>


        <button
          onClick={() => setShowAddUser(true)}
          className="ml-auto bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </button>
      </div>


      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-violet-50 border-b border-gray-200">
              <tr>
                {["Name", "Email", "Role", "Status", "Actions"].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr
                  key={`${u.role}-${u.id}`}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5996EC] flex items-center justify-center text-white font-semibold shadow-md">
                        {u.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium text-gray-900">{u.name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(u)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${u.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchFullUser(u, setSelectedUser)}
                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-200"
                        title="View"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => fetchFullUser(u, setEditingUser)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                        title="Edit"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteUser(u)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modals */}
      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={async (updated) => {
            await updateUser(updated);
            setEditingUser(null);
          }}
          onCancel={() => setEditingUser(null)}
        />
      )}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          addUser={(newUser) => setUsers((prev) => [...prev, newUser])}
        />
      )}
    </div>
  );
}


/* InfoField Component */
function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

/* USER MODAL */
function UserModal({ user, onClose }) {
  const fullName = `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""
    }`.trim();

  const cleaned = { ...user };
  delete cleaned.password;
  delete cleaned.staffId;
  delete cleaned.doctorId;
  delete cleaned.status;
  delete cleaned.notificationsEnabled;

  const skipFields = [
    "firstName",
    "middleName",
    "lastName",
    "username",
    "email",
    "addressStreet",
    "addressBarangay",
    "addressMunicipality",
    "addressProvince",
    "contactNumber",
    "phoneNumber",
    "emergencyContactNumber",
    "notificationsEnabled",
    "emailNotificationsEnabled",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#503878] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                {fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-violet-100 text-sm">@{user.username}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <InfoField label="Street" value={user.addressStreet} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Barangay" value={user.addressBarangay} />
                  <InfoField label="Municipality" value={user.addressMunicipality} />
                </div>
                <InfoField label="Province" value={user.addressProvince} />
              </div>
            </div>

            {/* Contact Info */}
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
                <InfoField label="Email" value={user.email} />
                <InfoField label="Phone" value={user.phoneNumber || user.contactNumber} />
                <InfoField label="Emergency Contact" value={user.emergencyContactNumber} />
              </div>
            </div>

            {/* Other Details */}
            {Object.entries(cleaned).filter(([key]) => !skipFields.includes(key)).length > 0 && (
              <div className="lg:col-span-2 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-violet-900">Other Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(cleaned).map(([key, value]) => {
                    if (skipFields.includes(key)) return null;
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase());
                    return (
                      <InfoField key={key} label={label} value={value} />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#503878] text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/* EDIT USER MODAL */
function EditUserModal({ user, onSave, onCancel }) {
  const [form, setForm] = useState({ ...user });
  const [errors, setErrors] = useState({});


  const excludedFields = [
    "dateHired",
    "emailNotificationsEnabled",
    "notificationsEnabled",
    "password",
    "status",
    "staffId",
    "doctorId",
    "id",
    "role",
    "name",
    "employmentStatus",
    "medicalRecords",
    "profilePath",
    "availability",
    "specialization"
  ];


  const requiredFields = [
    "firstName",
    "middleName",
    "lastName",
    "username",
    "email",
    "addressStreet",
    "addressBarangay",
    "addressMunicipality",
    "addressProvince",
    "phoneNumber",
    "emergencyContactNumber",
  ];


  const fieldGroups = {
    personal: ["firstName", "middleName", "lastName", "username", "email"],
    address: ["addressStreet", "addressBarangay", "addressMunicipality", "addressProvince"],
    contact: ["phoneNumber", "emergencyContactNumber"],
    other: [],
  };


  Object.keys(form).forEach((key) => {
    if (
      !excludedFields.includes(key) &&
      !fieldGroups.personal.includes(key) &&
      !fieldGroups.address.includes(key) &&
      !fieldGroups.contact.includes(key)
    ) {
      fieldGroups.other.push(key);
    }
  });


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };


  const validate = () => {
    const newErrors = {};
    Object.keys(validationMessages).forEach((key) => {
      if (requiredFields.includes(key) && !form[key] && validationMessages[key]) {
        newErrors[key] = validationMessages[key];
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };


  const getInputClass = (key) =>
    `w-full border-2 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 ${errors[key] ? "border-red-500" : "border-gray-200"
    }`;


  const renderField = (key) => {
    const type =
      key.includes("date") || key.includes("Date")
        ? "date"
        : key === "email"
          ? "email"
          : "text";


    return (
      <div key={key}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}{" "}
          {requiredFields.includes(key) && <span className="text-red-500">*</span>}
        </label>
        <input
          name={key}
          type={type}
          value={form[key] || ""}
          onChange={handleChange}
          className={getInputClass(key)}
        />
        {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
      </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#503878] to-[#D946EF] p-6 text-white">
        <h2 className="text-3xl font-bold">Edit {user.role}</h2>
        <p className="text-violet-200 mt-1">Update user information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldGroups.personal.map((key) => renderField(key))}
            </div>
          </section>


          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldGroups.address.map((key) => renderField(key))}
            </div>
          </section>


          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldGroups.contact.map((key) => renderField(key))}
            </div>
          </section>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#503878] to-[#D946EF] text-white font-semibold hover:shadow-lg transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




/* ADD USER MODAL */
function AddUserModal({ onClose, addUser }) {
  const [role, setRole] = useState("staff");
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    addressStreet: "",
    addressBarangay: "",
    addressMunicipality: "",
    addressProvince: "",
    phoneNumber: "",
    emergencyContactNumber: "",
  });
  const [errors, setErrors] = useState({});


  const validate = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      if (!form[key] && validationMessages[key]) {
        newErrors[key] = validationMessages[key];
      }
    });
    if (!role) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;


    try {
      const saved = await fetchWithAuth(`/api/admin/add/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });


      alert(
        `User created successfully!\nUsername: ${saved.username}\nPassword has been sent to the user's email.`
      );


      const tableUser = {
        ...saved,
        id: saved.id || saved.staffId || saved.doctorId,
        role,
        name: `${saved.firstName || ""} ${saved.middleName || ""} ${saved.lastName || ""}`.trim(),
        status: saved.status || saved.employmentStatus || "active",
      };


      addUser(tableUser);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || "Failed to add user" });
    }
  };


  const getInputClass = (key) =>
    `w-full border-2 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 ${errors[key] ? "border-red-500" : "border-gray-200"}`;


  const renderField = (key, type = "text") => (
    <div key={key}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}{" "}
        {validationMessages[key] && <span className="text-red-500">*</span>}
      </label>
      <input
        name={key}
        type={type}
        value={form[key]}
        onChange={handleChange}
        className={getInputClass(key)}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );


  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-[#5996EC] to-[#4785DB] p-6 text-white">
        <h2 className="text-3xl font-bold">Add New User</h2>
        <p className="text-violet-200 mt-1">Create a new doctor or staff account</p>
      </div>


      <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            className={getInputClass("role")}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select role</option>
            <option value="doctor">Doctor</option>
            <option value="staff">Staff</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>


        {/* Personal Information */}
        <h3 className="text-lg font-bold text-gray-900 mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["firstName", "middleName", "lastName", "email"].map((key) =>
            renderField(key, key === "email" ? "email" : "text")
          )}
        </div>


        {/* Address */}
        <h3 className="text-lg font-bold text-gray-900 mb-3">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["addressStreet", "addressBarangay", "addressMunicipality", "addressProvince"].map((key) =>
            renderField(key)
          )}
        </div>


        {/* Contact */}
        <h3 className="text-lg font-bold text-gray-900 mb-3">Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["phoneNumber", "emergencyContactNumber"].map((key) => renderField(key))}
        </div>


        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white font-semibold hover:shadow-lg transition-all duration-200"
          >
            Add User
          </button>
        </div>
      </form>
    </div>
  </div>
);}


export default UserManagement;
