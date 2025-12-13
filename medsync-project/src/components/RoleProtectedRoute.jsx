import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const roleRaw = localStorage.getItem("role") || "";
  
  // Remove all ROLE_ prefixes (handles ROLE_ROLE_SUPER_ADMIN too)
  const role = roleRaw.replace(/^(ROLE_)+/g, "").toUpperCase();

  console.log("🔒 RoleProtectedRoute Check:");
  console.log("  - Token exists:", !!token);
  console.log("  - Raw role from storage:", roleRaw);
  console.log("  - Normalized role:", role);
  console.log("  - Allowed roles:", allowedRoles);

  // If no token, redirect to login
  if (!token) {
    console.log("  ❌ No token - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed roles list
  const hasAccess = allowedRoles.includes(role);
  
  console.log("  - Has access:", hasAccess);

  if (!hasAccess) {
    console.log("  ❌ Access denied - redirecting to home");
    return <Navigate to="/home" replace />;
  }

  console.log("  ✅ Access granted");
  return children;
};

export default RoleProtectedRoute;