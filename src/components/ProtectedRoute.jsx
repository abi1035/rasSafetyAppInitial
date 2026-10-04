import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  allowedRole,
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRole &&
    profile?.role !== allowedRole
  ) {
    if (profile?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (profile?.role === "framer") {
      return <Navigate to="/framer" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;