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

  const [previousStats, setPreviousStats] = useState({
    totalPatients: 0,
    activeQueue: 0,
    completedServices: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartFilter, setChartFilter] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dataSourceFilter, setDataSourceFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const loadStats = async (filter = "weekly", month = null, year = null, source = "all") => {
    try {
      setLoading(true);

      let chartEndpoint = `/api/dashboard/served?filter=${filter}`;
      if (filter === "monthly" && month) {
        chartEndpoint += `&month=${month}&year=${year || selectedYear}`;
      } else if (filter === "yearly" && year) {
        chartEndpoint += `&year=${year}`;
      }
     
      if (source !== "all") {
        chartEndpoint += `&source=${source}`;
      }

      const [stats, chartData, queueCards, appointments, medicalRecords] = await Promise.all([
        fetchWithAuth("/api/dashboard/stats"),
        fetchWithAuth(chartEndpoint),
        fetchWithAuth("/api/patient-queue/cards").catch(() => []),
        fetchWithAuth("/api/appointments").catch(() => []),
        fetchWithAuth("/api/medical-records").catch(() => []),
      ]);

      const processedData = Array.isArray(chartData)
        ? chartData.map((w) => ({ label: w.weekLabel, count: w.totalServed ?? 0 }))
        : [];

      const activityLogs = [];
      let activeQueueCount = 0;

      // Calculate active queue from all services
      if (Array.isArray(queueCards)) {
        for (const card of queueCards) {
          try {
            const queueData = await fetchWithAuth(`/api/patient-queue/service/${encodeURIComponent(card.serviceName)}`);
            if (Array.isArray(queueData)) {
              queueData.forEach(queue => {
                const patientName = queue.patientName ||
                  (queue.patient ? `${queue.patient.firstName || ''} ${queue.patient.lastName || ''}`.trim() : 'Unknown');
               
                const status = queue.status || 'Unknown';
                if (status === 'WAITING' || status === 'IN_PROGRESS' || status === 'Waiting' || status === 'In Progress') {
                  activeQueueCount++;
                }
               
                activityLogs.push({
                  id: `queue-${queue.queueId}`,
                  patientName: patientName,
                  serviceType: `Queue - ${card.serviceName}`,
                  status: status,
                  timestamp: queue.timeRegistered || queue.createdAt || new Date(),
                  source: 'queue'
                });
              });
            }
          } catch (err) {
            console.log(`Error fetching queue for ${card.serviceName}:`, err);
          }
        }
      }

      if (Array.isArray(appointments)) {
        appointments.forEach(appt => {
          const patientName = appt.patientName ||
            `${appt.firstName || ''} ${appt.middleName || ''} ${appt.lastName || ''}`.trim() || 'Unknown';
          activityLogs.push({
            id: `appointment-${appt.appointmentId}`,
            patientName: patientName,
            serviceType: 'Appointment',
            status: appt.status || 'Unknown',
            timestamp: appt.date || appt.createdAt || new Date(),
            source: 'appointment'
          });
        });
      }

      if (Array.isArray(medicalRecords)) {
        medicalRecords.forEach(record => {
          if (record.queue && record.queue.patient) {
            const patient = record.queue.patient;
            const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown';
            const serviceName = record.queue.service ? record.queue.service.serviceName : 'Medical Record';
            activityLogs.push({
              id: `medical-${record.recordId}`,
              patientName: patientName,
              serviceType: `Medical Record - ${serviceName}`,
              status: record.status || 'Unknown',
              timestamp: record.createdAt || new Date(),
              source: 'medical'
            });
          }
        });
      }

      activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Store previous stats for comparison before updating
      setPreviousStats({
        totalPatients: summary.totalPatients || stats.totalPatients,
        activeQueue: summary.activeQueue || activeQueueCount,
        completedServices: summary.completedServices || stats.completedServices,
      });
     
      setSummary({
        totalPatients: stats.totalPatients ?? 0,
        activeQueue: activeQueueCount,
        completedServices: stats.completedServices ?? 0,
        weeklyStats: processedData,
        activityLogs: activityLogs,
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (chartFilter === "monthly") {
      loadStats(chartFilter, selectedMonth, selectedYear, dataSourceFilter);
    } else if (chartFilter === "yearly") {
      loadStats(chartFilter, null, selectedYear, dataSourceFilter);
    } else {
      loadStats(chartFilter, null, null, dataSourceFilter);
    }
  }, [chartFilter, selectedMonth, selectedYear, dataSourceFilter]);

  // WebSocket real-time updates
  useStompWebSocket([
    "/topic/stats", 
    "/topic/queue", 
    "/topic/patient-queue", 
    "/topic/private/appointments", 
    "/topic/medical-records"
  ], (msg) => {
    console.log("📡 Dashboard WebSocket message received:", msg);
   
    // Auto-reload on any update - NO MANUAL REFRESH NEEDED
    if (
      msg.type === "queue-update" || 
      msg.type === "queue-created" || 
      msg.type === "queue-status-changed" ||
      msg.type === "appointments-update" || 
      msg.type === "appointment-completed" ||
      msg.type === "appointment-approved" ||
      msg.type === "appointment-cancelled" ||
      msg.type === "medical-records-update" ||
      msg.type === "stats-update"
    ) {
      console.log("🔄 Real-time update detected, refreshing dashboard automatically...");
      
      // Reload stats based on current filters
      if (chartFilter === "monthly") {
        loadStats(chartFilter, selectedMonth, selectedYear, dataSourceFilter);
      } else if (chartFilter === "yearly") {
        loadStats(chartFilter, null, selectedYear, dataSourceFilter);
      } else {
        loadStats(chartFilter, null, null, dataSourceFilter);
      }
    }
  });

  const getBarColor = (value, maxValue) => {
    const ratio = value / maxValue;
    if (ratio > 0.7) return "#4785DB";
    if (ratio > 0.4) return "#5996EC";
    return "#6BA5F0";
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

  const filteredActivityLogs = summary.activityLogs.filter(log => {
    if (activityFilter === "all") return true;
    if (activityFilter === "queue") return log.source === "queue";
    if (activityFilter === "appointment") return log.source === "appointment";
    return true;
  });

  const totalPages = Math.ceil(filteredActivityLogs.length / itemsPerPage);
  const paginatedLogs = filteredActivityLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredActivityLogs.length]);

  // Calculate real-time percentages and trends from database
  const totalServices = summary.completedServices + summary.activeQueue;
  const queuePercentage = totalServices > 0 ? ((summary.activeQueue / totalServices) * 100).toFixed(1) : 0;
  const completedPercentage = totalServices > 0 ? ((summary.completedServices / totalServices) * 100).toFixed(1) : 0;

  // Calculate trends based on previous vs current stats
  const patientTrend = previousStats.totalPatients > 0 
    ? (((summary.totalPatients - previousStats.totalPatients) / previousStats.totalPatients) * 100).toFixed(1)
    : 0;
  const queueTrend = previousStats.activeQueue > 0
    ? (((summary.activeQueue - previousStats.activeQueue) / previousStats.activeQueue) * 100).toFixed(1)
    : 0;
  const completedTrend = previousStats.completedServices > 0
    ? (((summary.completedServices - previousStats.completedServices) / previousStats.completedServices) * 100).toFixed(1)
    : 0;

  if (loading && summary.totalPatients === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#503878] border-t-transparent mb-4"></div>
          <p className="text-[#503878] text-xl font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-red-50 p-8 rounded-xl border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 md:p-8 lg:p-10">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#5996EC] to-[#4785DB] bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 text-base">Real-time monitoring and analytics • Auto-updates every change</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 text-sm font-medium">Live Updates Active</span>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards with Real-time Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <EnhancedStatCard 
            title="Total Patients" 
            value={summary.totalPatients}
            icon="👥"
            color="from-blue-500 to-blue-600"
            trend={Math.abs(patientTrend)}
            trendUp={parseFloat(patientTrend) >= 0}
            showTrend={previousStats.totalPatients > 0}
          />
          <EnhancedStatCard 
            title="Active Queue" 
            value={summary.activeQueue}
            icon="⏳"
            color="from-yellow-500 to-orange-500"
            percentage={queuePercentage}
            showProgress={true}
            trend={Math.abs(queueTrend)}
            trendUp={parseFloat(queueTrend) >= 0}
            showTrend={previousStats.activeQueue > 0}
          />
          <EnhancedStatCard 
            title="Completed Services" 
            value={summary.completedServices}
            icon="✅"
            color="from-green-500 to-emerald-600"
            percentage={completedPercentage}
            showProgress={true}
            trend={Math.abs(completedTrend)}
            trendUp={parseFloat(completedTrend) >= 0}
            showTrend={previousStats.completedServices > 0}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#5996EC] to-[#4785DB] bg-clip-text text-transparent">
              Patients Served
            </h2>
           
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleFilterChange("today")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  chartFilter === "today"
                    ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleFilterChange("weekly")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  chartFilter === "weekly"
                    ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Weekly
              </button>
             
              {/* Monthly Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    handleFilterChange("monthly");
                    setShowMonthPicker(!showMonthPicker);
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    chartFilter === "monthly"
                      ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {chartFilter === "monthly" ? months[selectedMonth - 1] : "Monthly"}
                  <span className="text-xs">▼</span>
                </button>
               
                {showMonthPicker && chartFilter === "monthly" && (
                  <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 grid grid-cols-3 gap-2 w-[420px] right-0">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          selectedMonth === index + 1
                            ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white"
                            : "bg-gray-50 text-[#503878] hover:bg-gray-100"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Yearly Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    handleFilterChange("yearly");
                    setShowYearPicker(!showYearPicker);
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    chartFilter === "yearly"
                      ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {chartFilter === "yearly" ? selectedYear : "Yearly"}
                  <span className="text-xs">▼</span>
                </button>
               
                {showYearPicker && chartFilter === "yearly" && (
                  <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50 max-h-60 overflow-y-auto">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`block w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                          selectedYear === year
                            ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white"
                            : "bg-gray-50 text-[#503878] hover:bg-gray-100"
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

          {/* Data Source Filter */}
          <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600 flex items-center">Filter by:</span>
            <button
              onClick={() => setDataSourceFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dataSourceFilter === "all"
                  ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDataSourceFilter("queue")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dataSourceFilter === "queue"
                  ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Queue Only
            </button>
            <button
              onClick={() => setDataSourceFilter("appointment")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dataSourceFilter === "appointment"
                  ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Appointment Only
            </button>
          </div>

          {summary.weeklyStats.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No data available for the selected period.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={summary.weeklyStats}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  style={{ fontSize: '13px' }}
                  tickLine={false}
                  angle={chartFilter === "monthly" ? -45 : 0}
                  textAnchor={chartFilter === "monthly" ? "end" : "middle"}
                  height={chartFilter === "monthly" ? 80 : 60}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#6b7280"
                  style={{ fontSize: '13px' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    color: "#503878",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: "12px",
                  }}
                  cursor={{ fill: 'rgba(80, 56, 120, 0.05)' }}
                  formatter={(value, name, props) => [`${value} Patients`, props.payload.label]}
                  labelStyle={{ fontWeight: "600", marginBottom: "4px" }}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={chartFilter === "monthly" ? 50 : 90}
                  animationDuration={800}
                >
                  {summary.weeklyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.count, maxCount)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity Logs */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">
          <div className="bg-gradient-to-r from-[#5996EC] to-[#4785DB] p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-white">Recent Activity</h2>
             
              {/* Activity Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setActivityFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activityFilter === "all"
                      ? "bg-white text-[#503878] shadow-md"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setActivityFilter("queue");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activityFilter === "queue"
                      ? "bg-white text-[#503878] shadow-md"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  Queue
                </button>
                <button
                  onClick={() => {
                    setActivityFilter("appointment");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activityFilter === "appointment"
                      ? "bg-white text-[#503878] shadow-md"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                  Appointment
                </button>
              </div>
            </div>
          </div>
         
          {filteredActivityLogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No activity yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Service Type</th>
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log, index) => {
                      let displayStatus = log.status;
                      if (log.status === "IN_PROGRESS" || log.status === "In Progress") {
                        displayStatus = "Ongoing";
                      } else if (log.status === "COMPLETED" || log.status === "Completed") {
                        displayStatus = "Complete";
                      } else if (log.status === "WAITING" || log.status === "Waiting") {
                        displayStatus = "Waiting";
                      } else if (log.status === "Confirmed") {
                        displayStatus = "Complete";
                      } else if (log.status === "Pending") {
                        displayStatus = "Waiting";
                      } else if (log.status === "Cancelled") {
                        displayStatus = "Cancelled";
                      }

                      return (
                        <tr key={log.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${
                                log.source === "queue" ? "bg-blue-400" :
                                log.source === "appointment" ? "bg-purple-400" :
                                "bg-gray-400"
                              }`}></span>
                              <span className={`text-xs font-semibold uppercase tracking-wide ${
                                log.source === "queue" ? "text-blue-700" :
                                log.source === "appointment" ? "text-purple-700" :
                                "text-gray-700"
                              }`}>
                                {log.source === "queue" ? "Queue" :
                                 log.source === "appointment" ? "Appointment" :
                                 "Other"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-gray-900">
                            {log.patientName || "Unknown"}
                          </td>
                          <td className="px-8 py-5 text-sm text-gray-700">
                            {log.serviceType || "N/A"}
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                              displayStatus === "Complete"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : displayStatus === "Ongoing"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : displayStatus === "Waiting"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : displayStatus === "Cancelled"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}>
                              {displayStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 bg-gray-50 border-t border-gray-200 gap-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-[#503878] border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                   
                    <div className="hidden sm:flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-11 h-11 rounded-lg text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white"
                                : "bg-white text-[#503878] border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-[#503878] border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EnhancedStatCard({ title, value, icon, color, trend, trendUp, percentage, showProgress, showTrend }) {
  return (
    <div className={`bg-gradient-to-r ${color} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden`}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/90 text-sm font-medium mb-2 uppercase tracking-wide">{title}</p>
            <p className="text-5xl font-bold text-white animate-fade-in">{value.toLocaleString()}</p>
          </div>
          <div className="text-4xl opacity-30">{icon}</div>
        </div>
        
        {showTrend && trend !== undefined && (
          <div className="flex items-center gap-2 mt-4">
            <span className={`text-sm font-semibold flex items-center gap-1 ${
              trendUp ? 'text-white' : 'text-white/80'
            }`}>
              {trendUp ? '↑' : '↓'} {trend}%
            </span>
            <span className="text-white/70 text-xs">real-time</span>
          </div>
        )}
        
        {showProgress && percentage !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/90 text-xs font-medium">Utilization</span>
              <span className="text-white font-semibold text-sm">{percentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;