import { useState, useEffect } from 'react';
import { Activity, Calendar, FileText, Users, Bell } from 'lucide-react';
import logo from '../assets/medsync-logo.png';

const WelcomePage = () => {
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const features = [
    { icon: Calendar, title: "Appointments", desc: "Manage your schedule", color: "bg-violet-500" },
    { icon: Users, title: "Patients", desc: "View patient records", color: "bg-purple-500" },
    { icon: FileText, title: "Records", desc: "Access medical files", color: "bg-indigo-500" },
    { icon: Bell, title: "Notifications", desc: "Stay updated", color: "bg-fuchsia-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-3">
          <img src={logo} alt="MedSync Logo" className="w-12 h-12 object-contain" />
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            MedSync
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">MedSync</span>, <span className="text-violet-600">{username}</span>!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive healthcare management system. Navigate through the features below to get started.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-violet-100"
              >
                <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Use the navigation menu to access different sections of the system
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;