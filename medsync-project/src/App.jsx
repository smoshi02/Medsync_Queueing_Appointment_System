import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import MedicalRecords from "./pages/MedicalRecords";
import UserManagement from "./pages/UserManagement";
import Appointments from "./pages/Appointments";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
              <Sidebar isOpen={sidebarOpen} />
              <div className="flex-1 flex flex-col">
                <Header
                  onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                  isSidebarOpen={sidebarOpen}
                />
                <main className="flex-1 p-4 overflow-auto">
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
