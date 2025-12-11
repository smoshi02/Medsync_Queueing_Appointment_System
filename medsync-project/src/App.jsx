// App.js
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage"; // <-- your video background page
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import MedicalRecords from "./pages/MedicalRecords";
import UserManagement from "./pages/UserManagement";
import Appointments from "./pages/Appointments";

import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";

// ✅ helper function
const isLoggedIn = () => !!localStorage.getItem("token");

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <Routes>
      {/* ==========================
          PUBLIC LANDING PAGE
      =========================== */}
      <Route
        path="/"
        element={
          isLoggedIn() ? <Navigate to="/home" /> : <LandingPage />
        }
      />

      {/* ==========================
          PUBLIC AUTH ROUTES
      =========================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ==========================
          PROTECTED ROUTES
      =========================== */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
              {/* Sidebar */}
              <Sidebar
                isOpen={sidebarOpen}
                onLogout={handleLogout}
              />

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                <Header
                  isSidebarOpen={sidebarOpen}
                  onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 overflow-auto">
                  <Routes>
                    {/* Home page with video */}
                    <Route path="/home" element={<HomePage />} />

                    {/* Other protected pages */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/queue" element={<Queue />} />
                    <Route path="/medical-records" element={<MedicalRecords />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/appointments" element={<Appointments />} />

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
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
