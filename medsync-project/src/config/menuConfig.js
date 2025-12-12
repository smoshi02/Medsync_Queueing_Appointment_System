// src/config/menuConfig.js

import { 
  LayoutDashboard, 
  ListChecks, 
  CalendarCheck, 
  Users, 
  FileText 
} from "lucide-react";

export const menuItems = {
  superadmin: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Queue", icon: ListChecks, path: "/queue" },
    { name: "Appointments", icon: CalendarCheck, path: "/appointments" },
    { name: "User Management", icon: Users, path: "/user-management" },
    { name: "Medical Records", icon: FileText, path: "/medical-records" },
  ],

  doctor: [
    { name: "Queue", icon: ListChecks, path: "/queue" },
    { name: "Appointments", icon: CalendarCheck, path: "/appointments" },
    { name: "Medical Records", icon: FileText, path: "/medical-records" },
  ],

  staff: [
    { name: "Queue", icon: ListChecks, path: "/queue" },
    { name: "Appointments", icon: CalendarCheck, path: "/appointments" },
    { name: "Medical Records", icon: FileText, path: "/medical-records" },
  ],

  patient: [
    { name: "Queue", icon: ListChecks, path: "/queue" },
    { name: "Appointments", icon: CalendarCheck, path: "/appointments" },
  ],
};
