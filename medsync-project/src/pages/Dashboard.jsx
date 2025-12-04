import { useState, useEffect } from "react";
import { fetchWithAuth } from "../js/fetchHelper";
import { useStompWebSocket } from "../js/useStompWebSocket";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Dashboard() {
  const [summary, setSummary] = useState({
    totalPatients: 0,
    activeQueue: 0,
    completedServices: 0,
    weeklyStats: [],
    activityLogs: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth("/api/dashboard/stats");

      setSummary({
        totalPatients: data.totalPatients ?? 0,
        activeQueue: data.activeQueue ?? 0,
        completedServices: data.completedServices ?? 0,
        weeklyStats: Array.isArray(data.weeklyStats) ? data.weeklyStats : [],
        activityLogs: Array.isArray(data.activityLogs) ? data.activityLogs : []
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Listen for real-time WebSocket updates
  useStompWebSocket(["/topic/stats"], (msg) => {
    if (msg.type === "stats-update") {
      setSummary((prev) => ({
        ...prev,
        ...msg.data
      }));
    }
  });

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-gray-500 text-sm">Total Patients</h2>
          <p className="text-3xl font-bold">{summary.totalPatients}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-gray-500 text-sm">Active Queue</h2>
          <p className="text-3xl font-bold">{summary.activeQueue}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-gray-500 text-sm">Completed Services</h2>
          <p className="text-3xl font-bold">{summary.completedServices}</p>
        </div>

      </div>

      {/* WEEKLY CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Weekly Served Patients</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.weeklyStats}>
            <XAxis dataKey="weekLabel" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="totalServed" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT ACTIVITY LOGS */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity Logs</h2>

        {summary.activityLogs.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Queue #</th>
                <th className="p-2">Patient</th>
                <th className="p-2">Service</th>
                <th className="p-2">Staff</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {summary.activityLogs.map((log) => (
                <tr key={log.queueId} className="border-b">
                  <td className="p-2">{log.queueId}</td>
                  <td className="p-2">{log.patientName}</td>
                  <td className="p-2">{log.serviceName}</td>
                  <td className="p-2">{log.staffName}</td>
                  <td className="p-2">{log.priority}</td>
                  <td className="p-2">{log.status}</td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
