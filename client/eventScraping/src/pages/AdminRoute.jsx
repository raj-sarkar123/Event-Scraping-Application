import { Navigate } from "react-router-dom";

function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/admin/login" />;
  return children;
}

export default AdminRoute;
