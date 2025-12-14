import { useState, useEffect, useMemo } from "react";
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
  Cell,
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
  const [chartFilter, setChartFilter] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // =======================
  // Load dashboard data
  // =======================
  const loadStats = async (filter = "weekly", month = null, year = null) => {
    try {
      setLoading(true);

      let chartEndpoint = `/api/dashboard/served?filter=${filter}`;
      if (filter === "monthly" && month) {
        chartEndpoint += `&month=${month}&year=${year || selectedYear}`;
      } else if (filter === "yearly" && year) {
        chartEndpoint += `&year=${year}`;
      }

      const [stats, chartData, recent] = await Promise.all([
        fetchWithAuth("/api/dashboard/stats"),
        fetchWithAuth(chartEndpoint),
        fetchWithAuth("/api/dashboard/recent-activity"),
      ]);

      const processedData = Array.isArray(chartData)
        ? chartData.map((w) => ({
            label: w.weekLabel,
            count: w.totalServed ?? 0,
          }))
        : [];

      setSummary({
        totalPatients: stats.totalPatients ?? 0,
        activeQueue: stats.activeQueue ?? 0,
        completedServices: stats.completedServices ?? 0,
        weeklyStats: processedData,
        activityLogs: Array.isArray(recent) ? recent : [],
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chartFilter === "monthly") {
      loadStats(chartFilter, selectedMonth, selectedYear);
    } else if (chartFilter === "yearly") {
      loadStats(chartFilter, null, selectedYear);
    } else {
      loadStats(chartFilter);
    }
  }, [chartFilter, selectedMonth, selectedYear]);

  // =======================
  // Realtime updates via WebSocket
  // =======================
  useStompWebSocket(["/topic/stats"], (msg) => {
    if (msg.type === "stats-update") {
      setSummary((prev) => ({
        ...prev,
        totalPatients: msg.data.totalPatients ?? prev.totalPatients,
        activeQueue: msg.data.activeQueue ?? prev.activeQueue,
        completedServices: msg.data.completedServices ?? prev.completedServices,
      }));
      if (chartFilter === "monthly") {
        loadStats(chartFilter, selectedMonth, selectedYear);
      } else if (chartFilter === "yearly") {
        loadStats(chartFilter, null, selectedYear);
      } else {
        loadStats(chartFilter);
      }
    }
  });

  // =======================
  // Chart colors based on value
  // =======================
  const getBarColor = (value, maxValue) => {
    const ratio = value / maxValue;
    if (ratio > 0.7) return "#7c3aed";
    if (ratio > 0.4) return "#a78bfa";
    return "#c4b5fd";
  };

  const maxCount = useMemo(() => {
    return Math.max(...summary.weeklyStats.map((d) => d.count), 1);
  }, [summary.weeklyStats]);

  const handleFilterChange = (filter) => {
    setChartFilter(filter);
    setShowMonthPicker(false);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex + 1);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };

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

        {/* HISTOGRAM CHART WITH FILTERS */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-violet-100">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">Patients Served</h2>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 bg-violet-50 p-1 rounded-lg flex-wrap">
              <button
                onClick={() => handleFilterChange("today")}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                  chartFilter === "today"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-violet-700 hover:bg-violet-100"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleFilterChange("weekly")}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                  chartFilter === "weekly"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-violet-700 hover:bg-violet-100"
                }`}
              >
                Weekly
              </button>
              
              {/* Monthly with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    handleFilterChange("monthly");
                    setShowMonthPicker(!showMonthPicker);
                  }}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                    chartFilter === "monthly"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-violet-700 hover:bg-violet-100"
                  }`}
                >
                  {chartFilter === "monthly" ? months[selectedMonth - 1] : "Monthly"}
                  <span className="text-xs">▼</span>
                </button>
                
                {showMonthPicker && chartFilter === "monthly" && (
                  <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-violet-200 p-2 z-50 grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          selectedMonth === index + 1
                            ? "bg-violet-600 text-white"
                            : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Yearly with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    handleFilterChange("yearly");
                    setShowYearPicker(!showYearPicker);
                  }}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                    chartFilter === "yearly"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-violet-700 hover:bg-violet-100"
                  }`}
                >
                  {chartFilter === "yearly" ? selectedYear : "Yearly"}
                  <span className="text-xs">▼</span>
                </button>
                
                {showYearPicker && chartFilter === "yearly" && (
                  <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-violet-200 p-2 z-50 max-h-60 overflow-y-auto">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`block w-full px-4 py-2 rounded-md text-sm font-medium transition-all text-left ${
                          selectedYear === year
                            ? "bg-violet-600 text-white"
                            : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {summary.weeklyStats.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 font-medium">
                No data available for the selected period.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart 
                data={summary.weeklyStats} 
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#7c3aed" 
                  style={{ fontSize: '13px', fontWeight: '600' }}
                  tickLine={false}
                  angle={chartFilter === "monthly" ? -45 : 0}
                  textAnchor={chartFilter === "monthly" ? "end" : "middle"}
                  height={chartFilter === "monthly" ? 80 : 60}
                />
                <YAxis 
                  allowDecimals={false} 
                  stroke="#7c3aed" 
                  style={{ fontSize: '13px', fontWeight: '600' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    padding: "12px 16px",
                  }}
                  cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={chartFilter === "monthly" ? 40 : 80}
                  animationDuration={800}
                >
                  {summary.weeklyStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.count, maxCount)}
                    />
                  ))}
                </Bar>
              </BarChart>
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