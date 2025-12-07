import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { icon: "🏠", label: "Dashboard", path: "/" },
    { icon: "⏱️", label: "Queue", path: "/queue" },
    { icon: "📋", label: "Medical Records", path: "/medical-records" },
    { icon: "👥", label: "User Management", path: "/user-management" },
    { icon: "📅", label: "Appointments", path: "/appointments" },
    // Removed Settings
  ];

  return (
    <div
      className={`overflow-hidden bg-gradient-to-b from-violet-900 via-purple-900 to-violet-950 text-white transition-all duration-500 ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      <div className="p-6 animate-fade-in">
        <div className="flex items-center space-x-2">
          <div className="text-3xl animate-bounce-slow">⚕️</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
            MedSync
          </h2>
        </div>
        <p className="text-violet-300 text-sm mt-1">Healthcare Management</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            onClick={() => setActiveItem(item.path)}
            className={`w-full flex items-center px-6 py-3 transition-all duration-300 transform hover:scale-105 hover:translate-x-2 ${
              activeItem === item.path
                ? "bg-violet-800 border-l-4 border-violet-400 shadow-lg"
                : "hover:bg-violet-800"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
