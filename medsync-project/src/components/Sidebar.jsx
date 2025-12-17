import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/medsync-logo.png";


/* =======================
   SVG Icon Components
======================= */
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6" />
  </svg>
);


const QueueIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const MedicalRecordsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);


const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);


/* =======================
        Sidebar
======================= */
function Sidebar({ isOpen, customItems }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);


  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);


  const roleRaw = localStorage.getItem("role") || "ROLE_PATIENT";
  const role = roleRaw.replace(/^ROLE_+/, "").toUpperCase();


  const menuConfig = {
    SUPER_ADMIN: [
      { icon: <HomeIcon />, label: "Dashboard", path: "/dashboard" },
      { icon: <QueueIcon />, label: "Queue", path: "/queue" },
      { icon: <MedicalRecordsIcon />, label: "Medical Records", path: "/medical-records" },
      { icon: <UsersIcon />, label: "User Management", path: "/user-management" },
      { icon: <CalendarIcon />, label: "Appointments", path: "/appointments" },
    ],
    DOCTOR: [
      { icon: <QueueIcon />, label: "Queue", path: "/queue" },
      { icon: <CalendarIcon />, label: "Appointments", path: "/appointments" },
      { icon: <MedicalRecordsIcon />, label: "Medical Records", path: "/medical-records" },
    ],
    STAFF: [
      { icon: <QueueIcon />, label: "Queue", path: "/queue" },
      { icon: <CalendarIcon />, label: "Appointments", path: "/appointments" },
      { icon: <MedicalRecordsIcon />, label: "Medical Records", path: "/medical-records" },
    ],
    PATIENT: [
      { icon: <QueueIcon />, label: "Queue", path: "/patient/queue" },
      { icon: <CalendarIcon />, label: "Appointments", path: "/patient/appointments" },
    ],
  };


  const menuItems =
    (customItems && Array.isArray(customItems) ? customItems : menuConfig[role]) || [];


  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300
      ${isOpen ? "w-64" : "w-20"} flex flex-col`}
    >
      {/* Logo */}
      <div className={`p-6 border-b border-gray-200 ${isOpen ? "" : "flex justify-center"}`}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="MedSync Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-900">MedSync</h2>
              <p className="text-xs text-gray-500">Healthcare Platform</p>
            </div>
          </div>
        ) : (
          <img
            src={logo}
            alt="MedSync Logo"
            className="w-10 h-10 object-contain"
          />
        )}
      </div>


      {/* Menu */}
      <nav className={`flex-1 px-3 py-6 space-y-2 ${isOpen ? "overflow-y-auto" : "overflow-hidden"}`}>
        {menuItems.map((item, index) => {
          const isActive = activeItem === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              onClick={() => setActiveItem(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative
                ${isActive
                  ? "bg-[#5996EC] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"}
                ${!isOpen ? "justify-center" : ""}`}
              title={!isOpen ? item.label : ""}
            >
              <div className={`transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-gray-500"}`}>
                {item.icon}
              </div>
              {isOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
             
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


export default Sidebar;

