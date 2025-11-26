import React from "react";
import { Link, useLocation } from "react-router-dom";


function Sidebar({ isOpen, currentPage, setCurrentPage }) {
  const menuItems = [
    { icon: "🏠", label: "Dashboard", page: "dashboard" },
    { icon: "🩺", label: "Service", page: "service" },
    { icon: "👤", label: "Profile", page: "profile" },
    { icon: "⚙️", label: "Settings", page: "settings" }
  ];

  return (
    <div className={`overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950 text-white transition-all duration-300 ${isOpen ? "w-64" : "w-0"}`}>
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="text-3xl">⚕️</div>
          <h2 className="text-2xl font-bold">MedSync</h2>
        </div>
        <p className="text-blue-300 text-sm mt-1">Healthcare Management</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <button key={index} onClick={() => setCurrentPage(item.page)} className={`w-full flex items-center px-6 py-3 transition-colors ${currentPage === item.page ? "bg-blue-800 border-l-4 border-blue-400" : "hover:bg-blue-800"}`}>
            <span className="text-xl mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}


export default Sidebar;
