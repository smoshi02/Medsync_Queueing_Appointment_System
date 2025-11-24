import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

const App = () => {
  const [sidebarToggle, setSidebarToggle] = useState(true);

  function toggleSidebar() {
    setSidebarToggle(!sidebarToggle);
  }

  return (
    <div className="flex h-screen bg-gray-100"> 
      <Sidebar isOpen={sidebarToggle} />

      <div className="flex flex-col flex-1">
        <Header onSidebartoggle={toggleSidebar} />

        <main className="flex-1 bg-slate-200">
          Pogi Ako
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
