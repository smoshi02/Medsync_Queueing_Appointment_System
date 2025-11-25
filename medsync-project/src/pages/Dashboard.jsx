
function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Patients", value: "1,234", icon: "👥", color: "from-blue-500 to-blue-600" },
          { title: "Appointments Today", value: "48", icon: "📅", color: "from-cyan-500 to-cyan-600" },
          { title: "Pending Reports", value: "12", icon: "📋", color: "from-blue-400 to-blue-500" },
          { title: "Active Staff", value: "32", icon: "👨‍⚕️", color: "from-indigo-500 to-indigo-600" }
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className="text-4xl opacity-80">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {[
            "New patient registration completed",
            "Lab results uploaded for Patient #1045",
            "Appointment scheduled for tomorrow at 10:00 AM",
            "Medical report generated for Dr. Smith",
            "Prescription renewed for Patient #2031"
          ].map((activity, i) => (
            <div key={i} className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <p className="text-gray-700">{activity}</p>
              <span className="ml-auto text-xs text-gray-500">2 mins ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;