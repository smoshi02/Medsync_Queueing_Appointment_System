import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const [sidebarToggle, setSidebarToggle] = useState(true);

  const toggleSidebar = () => setSidebarToggle(!sidebarToggle);

  const menuItems = [
    { icon: "🏠", label: "Dashboard", path: "/" },
    { icon: "🩺", label: "Service", path: "/services" },
    { icon: "👤", label: "Profile", path: "/profile" },
    { icon: "⚙️", label: "Settings", path: "/settings" },
  ];

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-100">
              <Sidebar isOpen={sidebarToggle} menuItems={menuItems} />
              <div className="flex-1 flex flex-col">
                <Header onSidebarToggle={toggleSidebar} isSidebarOpen={sidebarToggle} />
                <main className="flex-1 bg-slate-200 p-4 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
