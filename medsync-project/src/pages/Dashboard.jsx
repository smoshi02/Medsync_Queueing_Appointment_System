import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function Dashboard() {
  const [summary, setSummary] = useState({
    totalPatients: 0,
    activeQueue: 0,
    completedServices: 0,
    weeklyStats: [],
    activityLogs: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =======================
  // Load all dashboard data
  // =======================
  const loadStats = async () => {
    try {
      setLoading(true);

      const [stats, weekly, recent] = await Promise.all([
        fetchWithAuth("/api/dashboard/stats"),
        fetchWithAuth("/api/dashboard/weekly-served"),
        fetchWithAuth("/api/dashboard/recent-activity"),
      ]);

      // Map weekly data for Recharts
      const weeklyData = Array.isArray(weekly)
        ? weekly.map((w) => ({
          weekLabel: w.weekLabel,   // must match XAxis dataKey
          totalServed: w.totalServed ?? 0, // must match Bar dataKey
        }))
        : [];

      setSummary({
        totalPatients: stats.totalPatients ?? 0,
        activeQueue: stats.activeQueue ?? 0,
        completedServices: stats.completedServices ?? 0,
        weeklyStats: weeklyData,
        activityLogs: Array.isArray(recent) ? recent : [],
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // =======================
  // Realtime updates via WebSocket
  // =======================
  useStompWebSocket(["/topic/stats"], (msg) => {
    if (msg.type === "stats-update") {
      setSummary((prev) => ({
        ...prev,
        ...msg.data,
      }));
    }
  });

  if (loading)
    return <p className="text-violet-700 text-xl">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-violet-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold text-violet-900 animate-fade-in">
        Dashboard Overview
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card
          title="Total Patients"
          value={summary.totalPatients}
          icon="👥"
          colorFrom="violet-500"
          colorTo="purple-600"
          delay="0.1s"
        />
        <Card
          title="Active Queue"
          value={summary.activeQueue}
          icon="⏱️"
          colorFrom="purple-500"
          colorTo="violet-600"
          delay="0.2s"
        />
        <Card
          title="Completed Services"
          value={summary.completedServices}
          icon="✅"
          colorFrom="violet-600"
          colorTo="purple-700"
          delay="0.3s"
        />
      </div>

      {/* WEEKLY CHART */}
      <div className="bg-white p-6 rounded-xl shadow-xl animate-fade-in border-t-4 border-violet-500">
        <h2 className="text-2xl font-bold mb-6 text-violet-900">
          Weekly Served Patients
        </h2>
        {summary.weeklyStats.length === 0 ? (
          <p className="text-gray-500">No weekly data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={summary.weeklyStats.sort((a, b) => a.weekLabel.localeCompare(b.weekLabel))}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
              <XAxis dataKey="weekLabel" stroke="#7c3aed" />
              <YAxis allowDecimals={false} stroke="#7c3aed" />
              <Tooltip
                contentStyle={{ backgroundColor: "#7c3aed", border: "none", borderRadius: "8px", color: "white" }}
              />
              <defs>
                <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>
              <Bar dataKey="totalServed" fill="url(#violetGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

        )}
      </div>

      {/* RECENT ACTIVITY LOGS */}
      <div className="bg-white p-6 rounded-xl shadow-xl animate-fade-in border-t-4 border-purple-500">
        <h2 className="text-2xl font-bold mb-6 text-violet-900">
          Recent Activity Logs
        </h2>
        {summary.activityLogs.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-100 to-purple-100">
                <tr>
                  <th className="p-3 text-left text-violet-900 font-semibold">
                    Queue #
                  </th>
                  <th className="p-3 text-left text-violet-900 font-semibold">
                    Patient
                  </th>
                  <th className="p-3 text-left text-violet-900 font-semibold">
                    Service
                  </th>
                  <th className="p-3 text-left text-violet-900 font-semibold">
                    Staff
                  </th>
                  <th className="p-3 text-left text-violet-900 font-semibold">
                    Priority
                  </th>
                  <th className="p-3 text-left text-violet-900 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.activityLogs.map((log, index) => (
                  <tr
                    key={log.queueId}
                    className="border-b border-violet-100 hover:bg-violet-50 transition-colors duration-200"
                    style={{
                      animation: `fadeIn 0.5s ease-in ${index * 0.1}s both`,
                    }}
                  >
                    <td className="p-3 font-medium text-violet-700">
                      #{log.queueId}
                    </td>
                    <td className="p-3">{log.patientName}</td>
                    <td className="p-3">{log.serviceName}</td>
                    <td className="p-3">{log.staffName}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${log.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : log.priority === "Urgent"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {log.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${log.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : log.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// =======================
// Card Component
// =======================
function Card({ title, value, icon, colorFrom, colorTo, delay }) {
  return (
    <div
      className={`p-6 bg-gradient-to-br from-${colorFrom} to-${colorTo} text-white shadow-xl rounded-xl transform hover:scale-105 transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-sm uppercase tracking-wide">{title}</h2>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-5xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}

export default Dashboard;
