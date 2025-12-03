import express from "express";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // adjust for production
});

app.use(express.json());

// ===== Mock Database =====
let queueStats = [
  { service: "Medical Consultation", total: 5, active: 1 },
  { service: "Pharmacy Services", total: 3, active: 0 },
];
let queues = {
  "Medical Consultation": [
    { queueId: 1, patient: "John Doe", staff: "Dr. Smith", priority: "High", status: "Serving" },
  ],
  "Pharmacy Services": [],
};

let appointments = [
  { id: 1, patientName: "John Doe", service: "Medical Consultation", doctor: "Dr. Smith", dateTime: "2025-12-03 10:00", status: "Scheduled" },
];

let medicalRecords = [
  { patientId: 1, patientName: "John Doe", dob: "1990-01-01", lastVisit: "2025-11-01", medicalRecords: ["Blood test", "X-ray"] },
];

let users = [
  { id: 1, name: "Admin", email: "admin@example.com", role: "Admin" },
  { id: 2, name: "Nurse Joy", email: "nurse@example.com", role: "Staff" },
];

let profiles = {
  "admin@example.com": { name: "Admin", email: "admin@example.com", role: "Admin" },
  "nurse@example.com": { name: "Nurse Joy", email: "nurse@example.com", role: "Staff" },
};

// ===== JWT Auth Middleware =====
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded;
    next();
  });
};

// ===== HTTP API =====

// Dashboard
app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({
    stats: queueStats,
    chart: [], // add chart data here
    recentActivity: [], // populate recent activity
  });
});

// Queue
app.get("/api/queue/stats", authMiddleware, (req, res) => res.json(queueStats));
app.get("/api/queue/:service", authMiddleware, (req, res) => {
  res.json(queues[req.params.service] || []);
});

// Appointments
app.get("/api/appointments", authMiddleware, (req, res) => res.json(appointments));
app.post("/api/appointments/:id/cancel", authMiddleware, (req, res) => {
  appointments = appointments.map(a => a.id == req.params.id ? { ...a, status: "Cancelled" } : a);
  io.emit("appointmentsUpdate", appointments);
  res.json(appointments);
});
app.post("/api/appointments/:id/reschedule", authMiddleware, (req, res) => {
  const { dateTime } = req.body;
  appointments = appointments.map(a => a.id == req.params.id ? { ...a, dateTime } : a);
  io.emit("appointmentsUpdate", appointments);
  res.json(appointments);
});

// Medical Records
app.get("/api/medical-records", authMiddleware, (req, res) => res.json(medicalRecords));

// Users
app.get("/api/users", authMiddleware, (req, res) => res.json(users));
app.put("/api/users/:id/role", authMiddleware, (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (user) user.role = req.body.role;
  io.emit("usersUpdate", users);
  res.json(users);
});

// Profile/Settings
app.get("/api/user/me", authMiddleware, (req, res) => {
  const profile = profiles[req.user.email];
  res.json(profile);
});
app.put("/api/user/me", authMiddleware, (req, res) => {
  const profile = profiles[req.user.email];
  if (profile) profile.name = req.body.name || profile.name;
  io.emit("userUpdate", profile);
  res.json(profile);
});

// ===== Socket.IO =====
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Unauthorized"));
    socket.user = decoded;
    next();
  });
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.email}`);

  // Initial emit
  socket.emit("queueUpdate", { stats: queueStats, queues });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.email}`);
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 6969;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
