import React, { useState, useEffect, useRef } from "react";
import Settings from "../pages/Settings";
import { useAuth } from "../context/AuthProvider";
import { fetchWithAuth } from "../js/fetchHelper";
import { makePhotoUrl } from "../js/makePhotoUrl";

function Header({ onSidebarToggle }) {
  const { logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const modalRef = useRef();

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchWithAuth("/api/settings/me");
        data.profilePhoto = data.profilePath ? `/uploads/${data.profilePath}` : data.profilePhotoBase64 || null;
        setUser(data);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileContent = user?.profilePhoto
    ? <img src={makePhotoUrl(user.profilePhoto)} alt="Profile" className="w-full h-full object-cover rounded-full" />
    : ((user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || ""));

  return (
    <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-800 shadow-lg z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onSidebarToggle}
          className="text-white hover:bg-violet-700 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-lg hover:scale-110 transition-all duration-300 overflow-hidden"
        >
          {profileContent}
        </button>
      </div>

      {modalOpen && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-auto p-8 relative"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-red-600 font-bold text-lg"
            >
              X
            </button>

            <Settings user={user} setUser={setUser} logout={logout} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
