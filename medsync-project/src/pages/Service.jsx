function Service() {
  const services = [
    { name: "Consultation", count: 342, icon: "🩺", active: 8 },
    { name: "Laboratory", count: 215, icon: "🔬", active: 12 },
    { name: "Vaccination", count: 178, icon: "💉", active: 5 },
    { name: "Pharmacy", count: 267, icon: "💊", active: 3 }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Services</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold text-blue-900">{service.name}</h3>
            <p className="text-gray-600 mt-2">Total Served: <span className="font-semibold">{service.count}</span></p>
            <p className="text-blue-600 mt-1">Active Now: <span className="font-semibold">{service.active}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Service;