import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Load current logged-in user info
  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/users/me");
      setUser(data);
      if (data.profilePhoto) {
        setPhotoPreview(`data:image/jpeg;base64,${data.profilePhoto}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Optional: subscribe to live updates via WebSocket
  useStompWebSocket(["/topic/users"], (msg) => {
    if (msg.type === "users-update" && user) {
      const updatedUser = msg.data.find((u) => u.id === user.id);
      if (updatedUser) setUser(updatedUser);
    }
  });

  // Handle form field changes
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Save edited user info
  const handleSave = async () => {
    try {
      setSaving(true);
      await fetchWithAuth(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      alert("Profile updated!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Upload and preview profile photo
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetchWithAuth(`/api/users/${user.id}/photo`, {
        method: "POST",
        body: formData,
      });

      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      alert("Photo uploaded!");
    } catch (err) {
      alert(`Error uploading photo: ${err.message}`);
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    const oldPassword = prompt("Enter old password:");
    const newPassword = prompt("Enter new password:");
    if (!oldPassword || !newPassword) return;

    try {
      await fetchWithAuth(
        `/api/users/${user.id}/password?oldPassword=${oldPassword}&newPassword=${newPassword}`,
        { method: "PUT" }
      );
      alert("Password changed successfully!");
    } catch (err) {
      alert(`Error changing password: ${err.message}`);
    }
  };

  // Toggle email notifications
  const handleNotificationToggle = async () => {
    try {
      await fetchWithAuth(
        `/api/users/${user.id}/notifications?enableNotifications=${!user.emailNotificationsEnabled}`,
        { method: "PUT" }
      );
      setUser({
        ...user,
        emailNotificationsEnabled: !user.emailNotificationsEnabled,
      });
    } catch (err) {
      alert(`Error updating notifications: ${err.message}`);
    }
  };

  if (loading) return <p>Loading user settings...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {user && (
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Profile Photo */}
          <div>
            <label className="block font-medium mb-1">Profile Photo</label>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full mb-2"
              />
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={user.fullName || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block font-medium">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={user.contactNumber || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block font-medium">Role</label>
            <input
              type="text"
              value={user.role}
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>

          {/* Email Notifications */}
          <div>
            <label className="block font-medium">Email Notifications</label>
            <button
              type="button"
              onClick={handleNotificationToggle}
              className={`px-4 py-2 rounded ${
                user.emailNotificationsEnabled
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {user.emailNotificationsEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Change Password */}
          <div>
            <button
              type="button"
              onClick={handlePasswordChange}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Change Password
            </button>
          </div>

          {/* Save Changes */}
          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Settings;
