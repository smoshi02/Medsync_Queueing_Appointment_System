import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { fetchWithAuth } from "../js/fetchHelper";
import sangabVideo from "../assets/sangab.mp4";

const HomePage = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchWithAuth("/api/settings/me");
        setUser(data);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={sangabVideo} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>

      {/* Centered Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-screen text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Welcome{user ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-12">
          Manage your medical appointments, queue position, and records all in one place.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-2 text-[#B52DB5]">Smart Scheduling</h3>
            <p className="text-gray-700">
              Reduce wait times and manage appointments efficiently with our intelligent scheduling system.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-2 text-[#B52DB5]">Real-time Updates</h3>
            <p className="text-gray-700">
              Receive instant notifications about your queue and appointment status.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-2 text-[#B52DB5]">Secure & Compliant</h3>
            <p className="text-gray-700">
              Your data is protected with enterprise-grade security and HIPAA compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
