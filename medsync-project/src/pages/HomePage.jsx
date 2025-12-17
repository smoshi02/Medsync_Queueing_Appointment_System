import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { fetchWithAuth } from "../js/fetchHelper";
import { Calendar, Bell, Shield, ArrowRight } from "lucide-react";
import sangabVideo from "../assets/sangab.mp4";

const HomePage = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Reduce wait times and manage appointments efficiently with our intelligent scheduling system."
    },
    {
      icon: Bell,
      title: "Real-time Updates",
      description: "Receive instant notifications about your queue and appointment status."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Your data is protected with enterprise-grade security and HIPAA compliance."
    }
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchWithAuth("/api/settings/me");
        setUser(data);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Video Background - Visible */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src={sangabVideo} type="video/mp4" />
      </video>

      {/* Clean Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-blue-50/40 z-10"></div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-[#5996EC]/10 rounded-full blur-3xl z-10 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#4785DB]/10 rounded-full blur-3xl z-10 animate-float-delayed"></div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-screen px-6">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-slideUp">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome{user && <span className="text-[#5996EC]">, {user.firstName}</span>}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your medical appointments, queue position, and records all in one place.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#5996EC]/30 hover:-translate-y-1 animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#5996EC] to-[#4785DB] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Icon size={28} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Hover Arrow */}
                <div className="flex items-center gap-2 text-[#5996EC] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm">Learn more</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#5996EC] to-[#4785DB] rounded-full"></div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 10s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;