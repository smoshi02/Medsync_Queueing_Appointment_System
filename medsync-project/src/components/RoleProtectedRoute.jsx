import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const roleRaw = localStorage.getItem("role") || "";
  const role = roleRaw.replace(/^ROLE_+/, "").toUpperCase();

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
