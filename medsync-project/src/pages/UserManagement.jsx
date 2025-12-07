import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load summary users for table
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/users");
      setUsers(
        data.map((u) => ({
          ...u,
          name:
            u.name ||
            `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim(),
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

  // WebSocket updates
  useStompWebSocket(["/topic/users"], (msg) => {
    if (msg.type === "users-update") {
      const updatedUsers = msg.data.map((u) => ({
        ...u,
        name:
          u.name ||
          `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim(),
        email: u.email || "",
        status: u.status || "active",
      }));
      setUsers(updatedUsers);
    }
  });

  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await fetchWithAuth(
        `/api/users/${user.role}/${user.id}/status?status=${newStatus}`,
        { method: "PUT" }
      );
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      await fetchWithAuth(`/api/users/${user.role}/${user.id}`, {
        method: "DELETE",
      });
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch full user for view or edit
  const fetchFullUser = async (user, setFn) => {
    try {
      const fullUser = await fetchWithAuth(`/api/users/${user.role}/${user.id}`);
      setFn(fullUser);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers =
    filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  if (loading)
    return (
      <div className="p-6 min-h-screen flex items-center justify-center text-violet-700 text-xl animate-pulse">
        Loading users...
      </div>
    );
  if (error)
    return (
      <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
        {error}
      </p>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-violet-900">User Management</h1>

      {/* Filters */}
      <div className="mb-4 flex items-center space-x-4">
        {["all", "doctor", "staff"].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-2 rounded-lg ${
              filterRole === role
                ? "bg-violet-600 text-white"
                : "bg-violet-200 text-violet-800"
            }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setShowAddUser(true)}
          className="ml-auto bg-gradient-to-r from-violet-600 to-purple-700 text-white px-6 py-3 rounded-xl shadow-md"
        >
          + Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-violet-500 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-violet-100 to-purple-100">
            <tr>
              {["Name", "Email", "Role", "Status", "Actions"].map((col) => (
                <th
                  key={col}
                  className="p-3 text-left text-violet-900 font-semibold"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={`${u.role}-${u.id}`}
                className="border-b border-violet-100 hover:bg-violet-50"
              >
                <td className="p-3">{u.name || "N/A"}</td>
                <td className="p-3">{u.email || "N/A"}</td>
                <td className="p-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    onClick={() => toggleStatus(u)}
                    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold ${
                      u.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => fetchFullUser(u, setSelectedUser)}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg"
                  >
                    View
                  </button>
                  <button
                    onClick={() => fetchFullUser(u, setEditingUser)}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(u)}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={(updated) => {
            setUsers((prev) =>
              prev.map((u) => (u.id === updated.id ? updated : u))
            );
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

// === View Modal ===
function UserModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-auto max-h-[90vh] p-6">
        <h2 className="text-2xl font-bold mb-4">{user.name}'s Profile</h2>
        {Object.entries(user).map(([key, value]) => {
          if (value === null || value === undefined) return null;
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          return (
            <div className="mb-2" key={key}>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          );
        })}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-violet-600 text-white px-4 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// === Edit Modal ===
function EditUserModal({ user, onSave, onCancel }) {
  const [form, setForm] = useState({ ...user });
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitEdit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-auto max-h-[90vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Edit {user.role}</h2>
        <form onSubmit={submitEdit} className="space-y-4">
          {Object.entries(form).map(([key, value]) => (
            <div className="mb-2" key={key}>
              <label className="text-gray-500 text-sm">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </label>
              <input
                className="w-full border px-3 py-2 rounded-lg"
                name={key}
                value={value || ""}
                onChange={handleChange}
              />
            </div>
          ))}
          <div className="flex space-x-2 mt-4">
            <button
              type="submit"
              className="bg-yellow-400 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, addUser }) {
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    addressStreet: "",
    addressBarangay: "",
    addressMunicipality: "",
    addressProvince: "",
    dateHired: new Date().toISOString().slice(0, 10), // default to today
    phoneNumber: "",
    emergencyContactNumber: "",
    status: "active"
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    const requiredFields = ["firstName", "lastName", "username", "password", "email"];
    for (const field of requiredFields) {
      if (!form[field] || form[field].trim() === "") {
        return `Field "${field}" is required.`;
      }
    }
    if (!role) return "Please select a role.";
    return null;
  };

  const submitForm = async (e) => {
  e.preventDefault();

  const validationError = validateForm();
  if (validationError) return setError(validationError);

  const url =
    role === "staff"
      ? "/api/users/admin/add/staff"
      : "/api/users/admin/add/doctor";

  try {
    // fetchWithAuth already parses JSON and throws errors automatically
    const newUser = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role, status: "active" }),
    });

    // Normalize user data for table display
    const userForTable = {
      id: newUser.staffId || newUser.doctorId || newUser.id,
      role,
      status: newUser.status || "active",
      name:
        `${newUser.firstName || ""} ${newUser.middleName || ""} ${
          newUser.lastName || ""
        }`.trim() || "N/A",
      email: newUser.email || "N/A",
      ...newUser,
    };

    addUser(userForTable); // Update table
    onClose(); // Close modal
  } catch (err) {
    console.error(err);
    setError(err.message || "Failed to add user");
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Add New User</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Role</label>
          <select className="w-full border px-3 py-2 rounded-lg" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Select role...</option>
            <option value="doctor">Doctor</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {role && (
          <form onSubmit={submitForm} className="space-y-4">
            {Object.entries(form).map(([key, value]) => {
              // Show only relevant fields
              if (role === "doctor" && ["dateHired", "phoneNumber", "emergencyContactNumber"].includes(key)) return null;
              if (role === "staff" && ["specialization", "contactNumber", "availability", "dateOfBirth", "employmentStatus"].includes(key)) return null;

              const type = key.toLowerCase().includes("date") ? "date" : key === "email" ? "email" : key === "password" ? "password" : "text";

              return (
                <div key={key}>
                  <label className="text-sm text-gray-500">{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</label>
                  <input
                    type={type}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg"
                    required={["firstName","lastName","username","password","email"].includes(key)}
                  />
                </div>
              );
            })}

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-violet-600 text-white">Create User</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


export default UserManagement;