import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { socket } from "../js/socket";
import { fetchWithAuth } from "../js/fetchHelper";

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState("");

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const data = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/dashboard`);
      if (!data) return; // already redirected
      setStats(Array.isArray(data.stats) ? data.stats : []);
      setChartData(Array.isArray(data.chart) ? data.chart : []);
      setRecentActivity(Array.isArray(data.recentActivity) ? data.recentActivity : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Listen for real-time updates
    const handleUpdate = (data) => {
      setStats(Array.isArray(data.stats) ? data.stats : []);
      setChartData(Array.isArray(data.chart) ? data.chart : []);
      setRecentActivity(Array.isArray(data.recentActivity) ? data.recentActivity : []);
    };

    socket.on("dashboardUpdate", handleUpdate);
    return () => socket.off("dashboardUpdate", handleUpdate);
  }, []);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!stats.length) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-6 text-white`}
          >
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

      {chartData.length > 0 && (
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
      )}

      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Recent Activity Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th>Queue ID</th>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Staff</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-blue-50">
                    <td>{item.queueId}</td>
                    <td>{item.patient}</td>
                    <td>{item.service}</td>
                    <td>{item.staff}</td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : item.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === "Serving" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
