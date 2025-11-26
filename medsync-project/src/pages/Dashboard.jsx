import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";


function Dashboard() {
  const stats = [
    { title: "Total Patients", value: "1,234", icon: "👥", color: "from-blue-500 to-blue-600" },
    { title: "Active Queues", value: "28", icon: "⏱️", color: "from-cyan-500 to-cyan-600" },
    { title: "Complete Service", value: "892", icon: "✅", color: "from-green-500 to-green-600" },
    { title: "Pending Logs", value: "15", icon: "📋", color: "from-yellow-500 to-yellow-600" }
  ];

  const chartData = [
    { day: "Mon", patients: 45 },
    { day: "Tue", patients: 52 },
    { day: "Wed", patients: 38 },
    { day: "Thu", patients: 61 },
    { day: "Fri", patients: 48 },
    { day: "Sat", patients: 29 },
    { day: "Sun", patients: 18 }
  ];

  const recentActivity = [
    { queueId: "Q-001", patient: "Tyronne", service: "Consultation", staff: "Dr. Smith", priority: "High", status: "Serving" },
    { queueId: "Q-002", patient: "Rhayven", service: "Laboratory", staff: "Dr. Johnson", priority: "Medium", status: "Waiting" },
    { queueId: "Q-003", patient: "Ulysses", service: "Vaccination", staff: "Nurse Mary", priority: "Low", status: "Waiting" },
    { queueId: "Q-004", patient: "Zedric", service: "Consultation", staff: "Dr. Brown", priority: "High", status: "Serving" },
    { queueId: "Q-005", patient: "Marcus", service: "Laboratory", staff: "Dr. Wilson", priority: "Medium", status: "Waiting" }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className="text-4xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Patients Served (Weekly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="patients" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Recent Activity Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Queue ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Service</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Staff</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={index} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{activity.queueId}</td>
                  <td className="px-4 py-3 text-sm">{activity.patient}</td>
                  <td className="px-4 py-3 text-sm">{activity.service}</td>
                  <td className="px-4 py-3 text-sm">{activity.staff}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${activity.priority === "High" ? "bg-red-100 text-red-700" : activity.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {activity.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${activity.status === "Serving" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;