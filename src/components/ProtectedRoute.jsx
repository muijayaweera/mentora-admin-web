import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserRole } from "../services/userRole";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkRole() {
      if (!user) {
        setCheckingRole(false);
        setIsAdmin(false);
        return;
      }

      try {
        const role = await getUserRole(user.uid);
        if (!cancelled) {
          setIsAdmin(role === "admin");
          setCheckingRole(false);
        }
      } catch (e) {
        console.error("Role check failed:", e);
        if (!cancelled) {
          setIsAdmin(false);
          setCheckingRole(false);
        }
      }
    }

    if (!loading) checkRole();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || checkingRole) return null; // later we can show a loader

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return children;
}
