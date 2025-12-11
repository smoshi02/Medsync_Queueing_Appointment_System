import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/medsync-logo.png";

function Sidebar({ isOpen }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "⏱️", label: "Queue", path: "/queue" },
    { icon: "📋", label: "Medical Records", path: "/medical-records" },
    { icon: "👥", label: "User Management", path: "/user-management" },
    { icon: "📅", label: "Appointments", path: "/appointments" },
  ];

  return (
    <div
      className={`h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white transition-all duration-300 ease-in-out shadow-2xl ${
        isOpen ? "w-72" : "w-0"
      } overflow-hidden flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-8 border-b border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative">
              <img
                src={logo}
                alt="MedSync Logo"
                className="w-24 h-24 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">MedSync</h2>
            <p className="text-violet-200 text-xs mt-1 font-medium tracking-wide">
              Healthcare Management
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = activeItem === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              onClick={() => setActiveItem(item.path)}
              className={`group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white/20 shadow-lg backdrop-blur-md"
                  : "hover:bg-white/10 hover:backdrop-blur-md"
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
              )}

              {/* Icon Container */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white/20 shadow-md"
                    : "bg-white/5 group-hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
              </div>

              {/* Label */}
              <span
                className={`ml-4 font-medium transition-all duration-200 ${
                  isActive ? "text-white" : "text-violet-100 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-all duration-200"></div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
