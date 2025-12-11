import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";
import { makePhotoUrl } from "../js/makePhotoUrl";

function Settings({ user, setUser, logout }) {
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(makePhotoUrl(user?.profilePhoto));
  const [error, setError] = useState("");

  // Load user if not passed
  useEffect(() => {
    if (!user) {
      const loadUser = async () => {
        try {
          setLoading(true);
          const data = await fetchWithAuth("/api/settings/me");
          data.profilePhoto = data.profilePath ? `/uploads/${data.profilePath}` : data.profilePhotoBase64 || null;
          setUser((prev) => ({ ...prev, ...data }));
          setPhotoPreview(makePhotoUrl(data.profilePhoto));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }
  }, [user, setUser]);

  // WebSocket live updates
  useStompWebSocket(["/topic/users"], (msg) => {
    if (msg.type === "users-update" && user) {
      const updatedUser = msg.data.find((u) => u.id === user.id);
      if (updatedUser) {
        updatedUser.profilePhoto = updatedUser.profilePath
          ? `/uploads/${updatedUser.profilePath}`
          : updatedUser.profilePhotoBase64 || null;
        setUser((prev) => ({ ...prev, ...updatedUser }));
        setPhotoPreview(makePhotoUrl(updatedUser.profilePhoto));
      }
    }
  });

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Save the file for upload
  setUser((prev) => ({ ...prev, newPhotoFile: file }));

  // Preview
  const reader = new FileReader();
  reader.onloadend = () => {
    // reader.result is already a proper data URL
    setPhotoPreview(reader.result);
  };
  reader.readAsDataURL(file);
};


  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("firstName", user.firstName || "");
      formData.append("middleName", user.middleName || "");
      formData.append("lastName", user.lastName || "");
      formData.append("email", user.email || "");
      formData.append("contactNumber", user.contactNumber || "");

      if (user.newPhotoFile) formData.append("profilePhoto", user.newPhotoFile);

      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:6969/api/settings/${user.id}`,
        {
          method: "PUT",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();

      updated.profilePhoto = updated.profilePath
        ? `/uploads/${updated.profilePath}`
        : updated.profilePhotoBase64 || null;

      setUser((prev) => ({ ...prev, ...updated, newPhotoFile: null }));
      setPhotoPreview(makePhotoUrl(updated.profilePhoto));
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const oldPass = prompt("Enter old password:");
    const newPass = prompt("Enter new password:");
    if (!oldPass || !newPass) return;
    try {
      await fetchWithAuth(
        `/api/settings/${user.id}/password?oldPassword=${oldPass}&newPassword=${newPass}`,
        { method: "PUT" }
      );
      alert("Password changed!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p className="text-violet-700 text-lg animate-pulse">Loading user settings...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-violet-900 animate-fade-in">Settings</h1>
      <div className="bg-white rounded-xl shadow-xl p-8 animate-slide-up border-t-4 border-violet-500">
        <form encType="multipart/form-data" onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center space-x-6 animate-fade-in">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-violet-200 shadow-lg">
              {photoPreview ? (
                <img src={makePhotoUrl(photoPreview)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-900 mb-2">Profile Photo</label>
              <label className="cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Upload New Photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* User fields */}
          {["firstName", "middleName", "lastName", "email", "contactNumber"].map((field) => (
            <div key={field} className="animate-fade-in">
              <label className="block text-sm font-medium text-violet-900 mb-2">
                {field.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase())}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={user[field] || ""}
                onChange={handleChange}
                className="w-full p-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
              />
            </div>
          ))}

          {/* Role */}
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-violet-900 mb-2">Role</label>
            <input type="text" value={user.role || ""} readOnly className="w-full p-3 border-2 border-violet-200 bg-violet-50 rounded-lg text-gray-600" />
          </div>

          {/* Change Password */}
          <div className="animate-fade-in">
            <button type="button" onClick={handlePasswordChange} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 font-semibold">
              Change Password
            </button>
          </div>

          {/* Save */}
          <div className="animate-fade-in">
            <button type="button" onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Logout */}
          <div className="animate-fade-in">
            <button type="button" onClick={logout} className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-300 font-semibold">
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
