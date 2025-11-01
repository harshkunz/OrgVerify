import React, { useState, useEffect } from "react";
import { Building2, Users, TrendingUp, CheckCircle, AlertCircle, Clock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const CompanyDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: [],
    recentHires: 0,
  });
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [companiesRes, statsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/companies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/companies/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (companiesRes.data.success && companiesRes.data.data.length > 0) {
          setCompany(companiesRes.data.data[0]);
          if (statsRes.data.success) {
            setStats(statsRes.data.data);
          }
        } else {
          navigate("/company/register");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response?.status === 404) {
          navigate("/company/register");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Departments",
      value: stats.departments?.length || 0,
      icon: Building2,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Recent Hires (30 days)",
      value: stats.recentHires,
      icon: TrendingUp,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {company?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your company's activity
        </p>
      </div>

      {/* Verification Status */}
      {company && (
        <div className={`mb-6 p-4 rounded-lg ${
          company.isVerified
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
        }`}>
          <div className="flex items-center gap-3">
            {company.isVerified ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {company.isVerified ? "Company Verified" : "Pending Verification"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {company.isVerified
                  ? "Your company has been verified and approved."
                  : "Your company registration is pending admin approval."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.textColor} p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/company/employees/add")}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800 text-left transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Employee</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Register a new employee to your company
            </p>
          </button>
          <button
            onClick={() => navigate("/company/employees")}
            className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-800 text-left transition-colors"
          >
            <Building2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Manage Employees</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage your employee list
            </p>
          </button>
          <button
            onClick={() => navigate("/company/settings")}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800 text-left transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Company Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update your company information
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;

