import { Navigate } from "react-router-dom";

const RequireGuest = ({ currentUser, children, forAdmin = false }) => {
  if (currentUser) {
    const role =
      typeof currentUser === "string"
        ? null
        : (currentUser.role || (currentUser?.user?.role));

    // If this guard is for the admin login page:
    // - allow access when a non-admin user is logged in (so they can switch accounts)
    // - redirect if an admin is already logged in
    if (forAdmin) {
      if (role && String(role).toLowerCase().includes("admin")) {
        return <Navigate to="/admin/dashboard" />;
      }

      return children;
    }

    // Default behavior for user login/signup pages
    if (role && String(role).toLowerCase().includes("admin")) {
      return <Navigate to="/admin/dashboard" />;
    }

    return <Navigate to="/user/profile" />;
  }

  return children;
};

export default RequireGuest;