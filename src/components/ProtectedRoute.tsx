import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
if (isLoading) {
    return null; // or a loading spinner
  }
  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}