import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";

function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

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

  useStompWebSocket(["/topic/users"], (msg) => {
    if (msg.type === "users-update" && user) {
      const updatedUser = msg.data.find((u) => u.id === user.id);
      if (updatedUser) setUser(updatedUser);
    }
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

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
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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

  const handlePasswordChange = async () => {
    const oldPass = prompt("Enter old password:");
    const newPass = prompt("Enter new password:");
    if (!oldPass || !newPass) return;

    try {
      await fetchWithAuth(
        `/api/users/${user.id}/password?oldPassword=${oldPass}&newPassword=${newPass}`,
        { method: "PUT" }
      );
      alert("Password changed!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

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

  if (loading)
    return (
      <p className="text-violet-700 text-lg animate-pulse">
        Loading user settings...
      </p>
    );

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-violet-900 animate-fade-in">
        Settings
      </h1>

      <div className="bg-white rounded-xl shadow-xl p-8 animate-slide-up border-t-4 border-violet-500">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Profile Photo */}
          <div className="flex items-center space-x-6 animate-fade-in">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-violet-200 shadow-lg">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.fullName?.charAt(0) + user.fullName?.charAt(1)
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-violet-900 mb-2">
                Profile Photo
              </label>

              <label className="cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Upload New Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <label className="block text-sm font-medium text-violet-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={user.fullName || ""}
              onChange={handleChange}
              className="w-full p-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
            />
          </div>

          {/* Email */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <label className="block text-sm font-medium text-violet-900 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              className="w-full p-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
            />
          </div>

          {/* Contact Number */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <label className="block text-sm font-medium text-violet-900 mb-2">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={user.contactNumber || ""}
              onChange={handleChange}
              className="w-full p-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
            />
          </div>

          {/* Role */}
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <label className="block text-sm font-medium text-violet-900 mb-2">
              Role
            </label>
            <input
              type="text"
              value={user.role || ""}
              readOnly
              className="w-full p-3 border-2 border-violet-200 rounded-lg bg-violet-50 text-gray-600"
            />
          </div>

          {/* Email Notifications */}
          <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <label className="block text-sm font-medium text-violet-900 mb-2">
              Email Notifications
            </label>

            <button
              type="button"
              onClick={handleNotificationToggle}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                user.emailNotificationsEnabled
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {user.emailNotificationsEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Change Password */}
          <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <button
              type="button"
              onClick={handlePasswordChange}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Change Password
            </button>
          </div>

          {/* Save Changes */}
          <div className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
