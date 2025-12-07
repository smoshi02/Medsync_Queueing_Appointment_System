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
    <>
      {/* Inject animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fade-in { animation: fadeIn 0.5s ease-in; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
      `}</style>

      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Main Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
                <Sidebar isOpen={sidebarOpen} />

                <div className="flex-1 flex flex-col">
                  <Header
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    isSidebarOpen={sidebarOpen}
                  />

                  {/* PAGE CONTENT */}
                  <main className="flex-1 p-6 overflow-auto animate-slide-up">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 animate-scale-in">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/queue" element={<Queue />} />
                        <Route path="/medical-records" element={<MedicalRecords />} />
                        <Route path="/user-management" element={<UserManagement />} />
                        <Route path="/appointments" element={<Appointments />} />
                      </Routes>
                    </div>
                  </main>

                  <Footer />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
