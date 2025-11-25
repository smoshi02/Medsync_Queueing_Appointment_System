function Service() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Medical Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "General Consultation", desc: "Primary care and wellness checkups", icon: "🩺" },
          { name: "Laboratory Tests", desc: "Comprehensive diagnostic services", icon: "🔬" },
          { name: "Medical Imaging", desc: "X-ray, CT, and MRI scans", icon: "📡" },
          { name: "Pharmacy", desc: "Prescription and medication services", icon: "💊" },
          { name: "Emergency Care", desc: "24/7 emergency medical services", icon: "🚑" },
          { name: "Telemedicine", desc: "Remote consultations and follow-ups", icon: "💻" }
        ].map((service, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all hover:-translate-y-1">
            <div className="text-4xl mb-3">{service.icon}</div>
            <h3 className="text-lg font-bold text-blue-900">{service.name}</h3>
            <p className="text-gray-600 mt-2 text-sm">{service.desc}</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800 font-semibold text-sm">
              Learn More →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Service;