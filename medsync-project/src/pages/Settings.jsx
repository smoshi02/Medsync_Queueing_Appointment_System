import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, LogOut, Camera, Save, X } from "lucide-react";

function Settings({ user, setUser, logout }) {
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const makePhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('data:')) return photo;
    if (photo.startsWith('http')) return photo;
    return `http://localhost:6969${photo}`;
  };

  useEffect(() => {
    if (user) {
      const photoUrl = user.profilePath 
        ? `/uploads/${user.profilePath}` 
        : user.profilePhotoBase64 || user.profilePhoto || null;
      setPhotoPreview(makePhotoUrl(photoUrl));
    }
  }, [user]);

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUser((prev) => ({ ...prev, newPhotoFile: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
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

  const handlePasswordSubmit = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("oldPassword", passwordData.oldPassword);
      formData.append("newPassword", passwordData.newPassword);

      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:6969/api/settings/${user.id}/password`, {
        method: "PUT",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-violet-700 text-lg font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600 text-sm">Manage your profile and account preferences</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-hidden flex flex-col">
          {/* Profile Section */}
          <div className="flex items-center gap-6 pb-4 mb-4 border-b border-gray-200 flex-shrink-0">
            {/* Profile Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#4785DB] to-[#deef46] flex items-center justify-center text-white text-3xl font-bold border-4 border-violet-100 shadow-xl">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-800">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 text-sm">{user?.email}</p>
              <div className="inline-block bg-violet-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mt-1">
                {user?.role || "User"}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-md text-sm"
              >
                <Lock size={16} />
                Change Password
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 font-semibold shadow-md text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {/* Personal Information */}
              <div className="col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Personal Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={user?.firstName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={user?.middleName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="Enter middle name"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={user?.lastName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="Enter last name"
                />
              </div>

              {/* Contact Information */}
              <div className="col-span-2 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Phone size={20} className="text-blue-600" />
                  Contact Information
                </h3>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <Mail size={14} className="text-blue-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={user?.email || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <Phone size={14} className="text-blue-600" />
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={user?.contactNumber || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Lock size={24} className="text-violet-600" />
                Change Password
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;