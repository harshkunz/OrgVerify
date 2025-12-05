import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./admin/AdminDashBoard";
import ThemeProvider from "./pages/ThemeProvider";
import AdminLayout from "./pages/AdminLayout";
import axios from "axios";
import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import ForgotPassword from "./pages/ResetPassword";
import UserLayout from "./pages/UserLayout";

import UserProfilePage from "./user/UserProfile";
import RequireGuest from "./pages/RequireGuest";
import UserAccountSetting from "./user/UserAccountSetting";
import CompanyLayout from "./company/CompanyLayout";
import CompanyDashboard from "./company/CompanyDashboard";
import AdminSignup from "./pages/AdminSignup";
import UserManage from "./admin/UserManage";
import AdminSetting from "./admin/AdminSetting";

axios.defaults.withCredentials = true;

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const authUrl = import.meta.env.VITE_AUTH_ROUTE;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get(`${authUrl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // server responds with { success: true, user: { ... } }
        setCurrentUser(res.data?.user || null);
      } catch (err) {
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, []);

  return (
    <ThemeProvider>
      <Toaster />
      <Routes>

        {/* Landing Page */}
        <Route 
          path="/" 
          element={
            <LandingPage />
          } 
        />

        {/* Auth Pages */}
        <Route 
          path="/login" 
          element={
            <RequireGuest currentUser={currentUser}>
              <UserLogin setCurrentUser={setCurrentUser} />
            </RequireGuest>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <RequireGuest currentUser={currentUser}>
              <UserSignup setCurrentUser={setCurrentUser} />
            </RequireGuest>
          } 
        />

        <Route 
          path="/admin/login" 
          element={
            <RequireGuest currentUser={currentUser} forAdmin={true}>
              <AdminLogin setCurrentUser={setCurrentUser} />
            </RequireGuest>
          } 
        />
        
        <Route path="/admin/signup" element={<AdminSignup />} />

        {/* Reset Password*/}
        <Route 
          path="/reset-password" 
          element={
            <RequireGuest currentUser={currentUser}>
              <ForgotPassword />
            </RequireGuest>
          } 
        />


        {/* User Routes */}
        <Route 
          path="/user/profile" 
          element={
            <UserLayout>
              <UserProfilePage />
            </UserLayout>
          } 
        />

        <Route 
          path="/user/settings" 
          element={
            <UserLayout>
              <UserAccountSetting />
            </UserLayout>
          } 
        />


        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } 
        />

        <Route 
          path="/admin/users" 
          element={
            <AdminLayout>
              <UserManage />
            </AdminLayout>
          } 
        />

        <Route
          path="/admin/setting"
          element={
            <AdminLayout>
              <AdminSetting />
            </AdminLayout>
          }
        />

      </Routes>
    </ThemeProvider>
  );
};

export default App;