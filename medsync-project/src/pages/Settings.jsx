import React, { useEffect, useState } from "react";
import { socket } from "../js/socket";
import { fetchWithAuth } from "../js/fetchHelper";

function Settings() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchWithAuth("/api/user/me");
        setUser(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    loadUser();

    socket.on("userUpdate", (updatedUser) => setUser(updatedUser || {}));
    return () => socket.off("userUpdate");
  }, []);

  const handleUpdate = async () => {
    const name = prompt("Enter new name:", user?.name || "");
    if (!name) return;

    try {
      const data = await fetchWithAuth("/api/user/me", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!user) return <p className="p-6">Loading user settings...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Settings</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleUpdate}
        >
          Update Name
        </button>
      </div>
    </div>
  );
}

export default Settings;
