import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Only redirect if trying to access protected page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
