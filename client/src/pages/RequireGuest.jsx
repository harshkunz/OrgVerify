import { Navigate } from "react-router-dom";

const RequireGuest = ({ currentUser, children }) => {
  if (currentUser) {
    return <Navigate to="/user/profile" />;
  }

  return children;
};

export default RequireGuest;