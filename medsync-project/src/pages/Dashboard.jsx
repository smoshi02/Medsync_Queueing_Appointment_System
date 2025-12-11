import { useState, useEffect, useMemo } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";
import {
  AreaChart,
  Area,
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
  // Load dashboard data
  // =======================
  const loadStats = async () => {
    try {
      setLoading(true);

      const [stats, weekly, recent] = await Promise.all([
        fetchWithAuth("/api/dashboard/stats"),
        fetchWithAuth("/api/dashboard/weekly-served"),
        fetchWithAuth("/api/dashboard/recent-activity"),
      ]);

      const weeklyData = Array.isArray(weekly)
        ? weekly.map((w) => ({
            weekLabel: w.weekLabel,
            totalServed: w.totalServed ?? 0,
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

  // =======================
  // Memoized sorted weekly stats
  // =======================
  const sortedWeeklyStats = useMemo(() => {
    return [...summary.weeklyStats].sort((a, b) =>
      a.weekLabel.localeCompare(b.weekLabel)
    );
  }, [summary.weeklyStats]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="text-violet-700 text-xl font-medium">Loading dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500">
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title="Total Patients"
            value={summary.totalPatients}
            icon="👥"
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Active Queue"
            value={summary.activeQueue}
            icon="⏱️"
            gradient="from-purple-500 to-fuchsia-600"
          />
          <StatCard
            title="Completed Services"
            value={summary.completedServices}
            icon="✅"
            gradient="from-violet-600 to-purple-700"
          />
        </div>

        {/* WEEKLY CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-violet-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Weekly Served Patients</h2>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          {sortedWeeklyStats.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 font-medium">No weekly data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={sortedWeeklyStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="weekLabel" stroke="#7c3aed" style={{ fontSize: '14px', fontWeight: '500' }} />
                <YAxis allowDecimals={false} stroke="#7c3aed" style={{ fontSize: '14px', fontWeight: '500' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#7c3aed",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="totalServed" stroke="#7c3aed" strokeWidth={3} fill="url(#violetGradient)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RECENT ACTIVITY LOGS */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity Logs</h2>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          {summary.activityLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 font-medium">No activity yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-100 to-purple-100">
                    <th className="p-4 text-left text-violet-900 font-semibold rounded-tl-lg">Queue #</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Patient</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Service</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Staff</th>
                    <th className="p-4 text-left text-violet-900 font-semibold">Priority</th>
                    <th className="p-4 text-left text-violet-900 font-semibold rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.activityLogs.map((log) => (
                    <tr key={log.queueId} className="border-b border-violet-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-transparent transition-all duration-200">
                      <td className="p-4 font-bold text-violet-700">#{log.queueId}</td>
                      <td className="p-4 font-medium text-gray-800">{log.patientName}</td>
                      <td className="p-4 text-gray-700">{log.serviceName}</td>
                      <td className="p-4 text-gray-700">{log.staffName}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${
                          log.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : log.priority === "Urgent"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {log.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${
                          log.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : log.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
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
    </div>
  );
}

// =======================
// StatCard Component
// =======================
function StatCard({ title, value, icon, gradient }) {
  return (
    <div className={`relative p-6 bg-gradient-to-br ${gradient} text-white shadow-lg hover:shadow-2xl rounded-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-sm uppercase tracking-wide font-semibold opacity-90">{title}</h2>
          <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">{icon}</div>
        </div>
        <p className="text-5xl font-bold tracking-tight">{value.toLocaleString()}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-20"></div>
    </div>
  );
}

export default Dashboard;
