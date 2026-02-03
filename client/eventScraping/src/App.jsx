import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./services/api";

import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./pages/AdminRoute";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data || null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Events />} />

        {/* ADMIN AUTH */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN DASHBOARD (PROTECTED) */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute user={user}>
              <Dashboard />
            </AdminRoute>
          }
        />
      </Routes>
   
  );
}

export default App;
