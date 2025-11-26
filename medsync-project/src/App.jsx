import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import {Routes, Route} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Service from "./pages/Service";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import "./index.css";
import Footer from "./components/Footer"

const App = () => {
  const [sidebarToggle, setSidebarToggle] = useState(true);

  function toggleSidebar() {
    setSidebarToggle(!sidebarToggle);
  }
  

  return (
    <Routes>
      <Route path="/login" element={<Login />}/>
      <Route path="/logout" element={<Logout/>}/>
      <Route path="/*" element={(
      <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Sidebar isOpen={sidebarToggle} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onSidebarToggle={() => setSidebarToggle(!sidebarToggle)} />
          
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/service" element={<Service />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Footer/>
        </div>

      </div>
    </ProtectedRoute>
  )} />
    </Routes>
    
  );
};

export default App;
