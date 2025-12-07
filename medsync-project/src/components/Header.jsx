import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import Settings from "../pages/Settings";

function Header({ onSidebarToggle }) {
  const { logout, user } = useAuth(); // assuming user info is available
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-800 shadow-lg animate-slide-down z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Sidebar toggle */}
        <button
          onClick={onSidebarToggle}
          className="text-white hover:bg-violet-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right side: search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search input */}
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white transition-all duration-300"
            />
          </div>

          {/* Notifications */}
          <button className="relative text-white hover:bg-violet-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-110 animate-pulse-slow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-bounce">7</span>
          </button>

          {/* Profile button */}
          <div className="relative">
            <button
              onClick={() => setModalOpen(true)}
              className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-lg transform hover:scale-110 transition-all duration-300"
            >
              RG
            </button>
          </div>
        </div>
      </div>

      {/* Centered horizontal modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-8 relative animate-scale-in"
            style={{ minHeight: "500px" }} // top/bottom spacing
          >
            {/* Logout button at top-right */}
            <button
              onClick={logout}
              className="absolute top-4 right-4 flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14h.01"
                />
              </svg>
              Logout
            </button>

            {/* Profile photo & upload button */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-violet-200 shadow-lg">
                {user?.profilePhoto ? (
                  <img
                    src={`data:image/jpeg;base64,${user.profilePhoto}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.fullName?.charAt(0) + user?.fullName?.charAt(1)
                )}
              </div>

              <label className="cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Upload New Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => console.log("Photo upload logic")}
                  className="hidden"
                />
              </label>
            </div>

            {/* Settings form */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-violet-900 mb-4">Profile Settings</h2>

              <div className="grid grid-cols-1 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-violet-900 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={user?.fullName || ""}
                    onChange={(e) => console.log("handleChange")}
                    className="w-full p-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-violet-900 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={user?.email || ""}
                    onChange={(e) => console.log("handleChange")}
                    className="w-full p-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-violet-900 mb-1">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={user?.contactNumber || ""}
                    onChange={(e) => console.log("handleChange")}
                    className="w-full p-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  />
                </div>

                {/* Role (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-violet-900 mb-1">Role</label>
                  <input
                    type="text"
                    value={user?.role || ""}
                    readOnly
                    className="w-full p-3 border-2 border-violet-200 rounded-lg bg-violet-50 text-gray-600"
                  />
                </div>

                {/* Email Notifications */}
                <div>
                  <button
                    type="button"
                    onClick={() => console.log("toggle notifications")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${user?.emailNotificationsEnabled
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gray-300 text-gray-700"
                      }`}
                  >
                    {user?.emailNotificationsEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {/* Change Password */}
                <div>
                  <button
                    type="button"
                    onClick={() => console.log("change password")}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    Change Password
                  </button>
                </div>

                {/* Save Changes */}
                <div>
                  <button
                    type="button"
                    onClick={() => console.log("save changes")}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </header>
  );
}

export default Header;
