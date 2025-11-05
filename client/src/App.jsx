import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import Home from "./components/Pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ThemeProvider from "./pages/ThemeProvider";
import AdminLayout from "./pages/AdminLayout";
import axios from "axios";
import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import ForgotPassword from "./pages/ResetPassword";
import UserLayout from "./user/UserLayout";

import UserManagementPage from "./admin/UserManagementPage";
import ExternalUserManagement from "./admin/ExternalUserManagement";
import UserProfilePage from "./user/UserProfile";
import RequireGuest from "./pages/RequireGuest";
import UserAccountSetting from "./user/UserAccountSetting";
import CompanyLayout from "./company/CompanyLayout";
import CompanyDashboard from "./company/CompanyDashboard";
import AboutPage from "./pages/AboutPage";
import AdminSignup from "./pages/AdminSignup";
import AdminHomePage from "./components/Pages/AdminHomePages";
import UserAddingPage from "./admin/UserAdding";

axios.defaults.withCredentials = true;

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setCurrentUser(token);
    }
  }, []);

  return (
    <ThemeProvider>
      <Toaster />
      <Routes>
        {/* Landing & About Pages */}
        <Route 
          path="/" 
          element={
            <LandingPage>
              <Home />
            </LandingPage>
          } 
        />

        {/* Auth Routes - Pass currentUser and setCurrentUser */}
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
            <RequireGuest currentUser={currentUser}>
              <AdminLogin setCurrentUser={setCurrentUser} />
            </RequireGuest>
          } 
        />
        
        <Route path="/admin-signup" element={<AdminSignup />} />

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

        {/* Company Routes */}
        <Route 
          path="/company/dashboard" 
          element={
            <CompanyLayout>
              <CompanyDashboard />
            </CompanyLayout>
          } 
        />
        <Route 
          path="/company/employees" 
          element={
            <CompanyLayout>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Employees</h2>
                <p>Employee management page - to be implemented</p>
              </div>
            </CompanyLayout>
          } 
        />
        <Route 
          path="/company/settings" 
          element={
            <CompanyLayout>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Company Settings</h2>
                <p>Company settings page - to be implemented</p>
              </div>
            </CompanyLayout>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminLayout>
              <AdminHomePage />
            </AdminLayout>
          } 
        />

        <Route 
          path="/admin/dashboard" 
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } 
        />

        <Route 
          path="/admin/create/users" 
          element={
            <AdminLayout>
              <UserAddingPage />
            </AdminLayout>
          } 
        />

        <Route 
          path="/admin/users" 
          element={
            <AdminLayout>
              <UserManagementPage />
            </AdminLayout>
          } 
        />
        <Route 
          path="/admin/users/external" 
          element={
            <AdminLayout>
              <ExternalUserManagement />
            </AdminLayout>
          } 
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;