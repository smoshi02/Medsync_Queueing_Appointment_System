import React, { useEffect, useState } from "react";
import { socket } from "../js/socket";
import { fetchWithAuth } from "../js/fetchHelper";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchWithAuth("/api/users");
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    loadUsers();

    socket.on("usersUpdate", (data) => setUsers(Array.isArray(data) ? data : []));
    return () => socket.off("usersUpdate");
  }, []);

  const handleRoleChange = async (id) => {
    const newRole = prompt("Enter new role:");
    if (!newRole) return;
    try {
      const data = await fetchWithAuth(`/api/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">User Management</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-blue-50">
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="text-blue-600 hover:text-blue-800" onClick={() => handleRoleChange(u.id)}>Change Role</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
