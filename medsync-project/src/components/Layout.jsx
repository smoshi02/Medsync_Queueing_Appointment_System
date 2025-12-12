import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children, sidebarItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar items={sidebarItems} isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isSidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
