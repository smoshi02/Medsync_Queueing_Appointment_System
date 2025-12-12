import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import MedicalRecords from "./pages/MedicalRecords";
import UserManagement from "./pages/UserManagement";
import Appointments from "./pages/Appointments";

import PatientQueue from "./pages/PatientQueue";
import PatientAppointments from "./pages/PatientAppointments";

import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

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

  // Sidebar items
  const patientSidebarItems = [
    { name: "Queue", path: "/patient/queue" },
    { name: "Appointments", path: "/patient/appointments" },
  ];

  const protectedSidebarItems = [
    { name: "Home", path: "/home" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Queue", path: "/queue" },
    { name: "Appointments", path: "/appointments" },
    { name: "Medical Records", path: "/medical-records" },
    { name: "User Management", path: "/user-management" },
  ];

  return (
    <Routes>
      {/* Landing page */}
      <Route
        path="/"
        element={isLoggedIn() ? <Navigate to="/queue" replace /> : <LandingPage />}
      />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* PUBLIC PATIENT ROUTES */}
      <Route
        path="/patient/queue"
        element={
          <Layout sidebarItems={patientSidebarItems}>
            <PatientQueue />
          </Layout>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <Layout sidebarItems={patientSidebarItems}>
            <PatientAppointments />
          </Layout>
        }
      />

      {/* PROTECTED STAFF/ADMIN ROUTES */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
              <Sidebar
                items={protectedSidebarItems}
                isOpen={sidebarOpen}
                onLogout={handleLogout}
              />
              <div className="flex-1 flex flex-col">
                <Header
                  isSidebarOpen={sidebarOpen}
                  onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    {/* Home page */}
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

                    {/* STAFF / DOCTOR / SUPER_ADMIN */}
                    <Route
                      path="/queue"
                      element={
                        <RoleProtectedRoute allowedRoles={["SUPER_ADMIN", "DOCTOR", "STAFF"]}>
                          <Queue />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route
                      path="/appointments"
                      element={
                        <RoleProtectedRoute allowedRoles={["SUPER_ADMIN", "DOCTOR", "STAFF"]}>
                          <Appointments />
                        </RoleProtectedRoute>
                      }
                    />

                    {/* Protected medical records */}
                    <Route
                      path="/medical-records"
                      element={
                        <RoleProtectedRoute allowedRoles={["SUPER_ADMIN", "DOCTOR", "STAFF"]}>
                          <MedicalRecords />
                        </RoleProtectedRoute>
                      }
                    />

                    {/* Fallback */}
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
