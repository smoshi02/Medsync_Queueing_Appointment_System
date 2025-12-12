import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import MedicalRecords from "./pages/MedicalRecords";
import UserManagement from "./pages/UserManagement";
import Appointments from "./pages/Appointments";

import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";

const isLoggedIn = () => !!localStorage.getItem("token");

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/", { replace: true });
  };

  // Role-based redirect helper
  const getRoleRedirect = () => {
    const role = localStorage.getItem("role")?.toUpperCase();
    if (role === "SUPER_ADMIN") return "/dashboard";
    if (role === "DOCTOR" || role === "STAFF" || role === "PATIENT") return "/queue";
    return "/home";
  };

  return (
    <Routes>
      {/* PUBLIC LANDING PAGE */}
      <Route
        path="/"
        element={isLoggedIn() ? <Navigate to={getRoleRedirect()} replace /> : <LandingPage />}
      />

      {/* PUBLIC AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* PUBLIC PAGES (accessible without login) */}
      <Route path="/queue" element={<Queue />} />
      <Route path="/appointments" element={<Appointments />} />

      {/* PROTECTED PAGES */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
              <Sidebar isOpen={sidebarOpen} onLogout={handleLogout} />
              <div className="flex-1 flex flex-col">
                <Header
                  isSidebarOpen={sidebarOpen}
                  onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 overflow-auto">
                  <Routes>
                    {/* Home page for logged-in users */}
                    <Route path="/home" element={<HomePage />} />

                    {/* SUPER_ADMIN only */}
                    <Route
                      path="/dashboard"
                      element={
                        <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                          <Dashboard />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route
                      path="/user-management"
                      element={
                        <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                          <UserManagement />
                        </RoleProtectedRoute>
                      }
                    />

                    {/* PROTECTED MEDICAL RECORDS */}
                    <Route
                      path="/medical-records"
                      element={
                        <RoleProtectedRoute allowedRoles={["SUPER_ADMIN", "DOCTOR", "STAFF"]}>
                          <MedicalRecords />
                        </RoleProtectedRoute>
                      }
                    />

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
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
