// src/services/api.js
export const fetchDashboardStats = async () => {
  const res = await fetch("/api/dashboard/stats");
  return res.json();
};

export const fetchRecentActivity = async () => {
  const res = await fetch("/api/dashboard/recent-activity");
  return res.json();
};

export const fetchQueuePatients = async (queue) => {
  const res = await fetch(`/api/queue/${queue}`);
  return res.json();
};

export const fetchMedicalRecords = async () => {
  const res = await fetch("/api/medical-records");
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch("/api/users");
  return res.json();
};

export const fetchAppointments = async () => {
  const res = await fetch("/api/appointments");
  return res.json();
};
