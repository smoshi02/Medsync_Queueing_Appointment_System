import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import MedicalRecords from "./pages/MedicalRecords";
import UserManagement from "./pages/UserManagement";
import Appointments from "./pages/Appointments";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const [sidebarToggle, setSidebarToggle] = useState(true);

  const toggleSidebar = () => setSidebarToggle(!sidebarToggle);

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
              <Sidebar isOpen={sidebarToggle} />
              <div className="flex-1 flex flex-col">
                <Header onSidebarToggle={toggleSidebar} isSidebarOpen={sidebarToggle} />
                <main className="flex-1 bg-slate-200 p-4 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/queue" element={<Queue />} />
                    <Route path="/medical-records" element={<MedicalRecords />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/appointments" element={<Appointments />} />
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
