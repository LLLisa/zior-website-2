import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/** Gate for admin-only areas (user management, site settings). */
export function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="py-8 text-center text-muted-foreground">Loading…</p>;
  }
  // Signed-out visitors go to sign-in; signed-in non-admins have no business
  // here, so send them home rather than to a login they've already passed.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
