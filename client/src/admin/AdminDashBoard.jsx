import axios from "axios";
import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { FiMoon, FiSun, FiChevronDown, FiChevronUp, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashBoard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  // State declarations
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [industryCount, setIndustryCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [industryData, setIndustryData] = useState({});
  const [departmentData, setDepartmentData] = useState({});
  const [toggledCard, setToggledCard] = useState(null);
  const [expandedIndustry, setExpandedIndustry] = useState(null);
  const [expandedDepartment, setExpandedDepartment] = useState(null);

  // Theme state management
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true" ||
      (!("darkMode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // Apply theme class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
          setError("No authentication token found. Please login again.");
          setIsLoading(false);
          return;
        }

        const [companiesRes, employeesRes] = await Promise.all([
          axios.get(`${backendUrl}/api/companies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (companiesRes.data.success) {
          const companiesData = companiesRes.data.data || [];
          setCompanies(companiesData);
          
          if (companiesData.length > 0) {
            const industries = [
              ...new Set(companiesData.map((comp) => comp.industry)),
            ];
            setIndustryCount(industries.length);

            const industryCounts = companiesData.reduce((acc, comp) => {
              acc[comp.industry] = (acc[comp.industry] || 0) + 1;
              return acc;
            }, {});
            setIndustryData(industryCounts);
          }
        }

        if (employeesRes.data.success) {
          const employeesData = employeesRes.data.data || [];
          setEmployees(employeesData);
          
          if (employeesData.length > 0) {
            const departments = [
              ...new Set(employeesData.map((emp) => emp.department)),
            ];
            setDepartmentCount(departments.length);

            const departmentCounts = employeesData.reduce((acc, emp) => {
              acc[emp.department] = (acc[emp.department] || 0) + 1;
              return acc;
            }, {});
            setDepartmentData(departmentCounts);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [backendUrl]);

  // Chart data preparation with theme-aware colors
  const getChartColors = () => {
    return darkMode
      ? {
          textColor: "#E5E7EB",
          gridColor: "rgba(255, 255, 255, 0.1)",
          background: "#1F2937",
          cardBg: "#111827",
          borderColor: "#4B5563",
          tooltipBg: "#374151",
          tooltipBorder: "#4B5563",
        }
      : {
          textColor: "#374151",
          gridColor: "rgba(0, 0, 0, 0.05)",
          background: "#FFFFFF",
          cardBg: "#F9FAFB",
          borderColor: "#E5E7EB",
          tooltipBg: "#FFFFFF",
          tooltipBorder: "#E5E7EB",
        };
  };

  const colors = getChartColors();
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: colors.textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.textColor,
        bodyColor: colors.textColor,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: colors.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: colors.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 10,
        },
        beginAtZero: true,
      },
    },
  };

  const industryChartData = {
    labels: Object.keys(industryData),
    datasets: [
      {
        label: "Companies by Industry",
        data: Object.values(industryData),
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(220, 38, 38, 0.7)",
          "rgba(5, 150, 105, 0.7)",
          "rgba(234, 88, 12, 0.7)",
          "rgba(217, 70, 239, 0.7)",
          "rgba(6, 182, 212, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(20, 184, 166, 0.7)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(220, 38, 38, 1)",
          "rgba(5, 150, 105, 1)",
          "rgba(234, 88, 12, 1)",
          "rgba(217, 70, 239, 1)",
          "rgba(6, 182, 212, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(20, 184, 166, 1)",
        ],
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: [
          "rgba(99, 102, 241, 0.9)",
          "rgba(220, 38, 38, 0.9)",
          "rgba(5, 150, 105, 0.9)",
          "rgba(234, 88, 12, 0.9)",
          "rgba(217, 70, 239, 0.9)",
          "rgba(6, 182, 212, 0.9)",
          "rgba(139, 92, 246, 0.9)",
          "rgba(20, 184, 166, 0.9)",
        ],
      },
    ],
  };

  const departmentChartData = {
    labels: Object.keys(departmentData),
    datasets: [
      {
        label: "Employees by Department",
        data: Object.values(departmentData),
        backgroundColor: [
          "rgba(6, 182, 212, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(20, 184, 166, 0.7)",
          "rgba(234, 88, 12, 0.7)",
          "rgba(217, 70, 239, 0.7)",
          "rgba(99, 102, 241, 0.7)",
          "rgba(220, 38, 38, 0.7)",
          "rgba(5, 150, 105, 0.7)",
        ],
        borderColor: [
          "rgba(6, 182, 212, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(20, 184, 166, 1)",
          "rgba(234, 88, 12, 1)",
          "rgba(217, 70, 239, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(220, 38, 38, 1)",
          "rgba(5, 150, 105, 1)",
        ],
        borderWidth: 1,
        hoverOffset: 12,
      },
    ],
  };

  const yearlyData = {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
    datasets: [
      {
        label: "Companies Registered per Year",
        data: [
          companies.filter(
            (comp) => new Date(comp.createdAt).getFullYear() === 2020
          ).length,
          companies.filter(
            (comp) => new Date(comp.createdAt).getFullYear() === 2021
          ).length,
          companies.filter(
            (comp) => new Date(comp.createdAt).getFullYear() === 2022
          ).length,
          companies.filter(
            (comp) => new Date(comp.createdAt).getFullYear() === 2023
          ).length,
          companies.filter(
            (comp) => new Date(comp.createdAt).getFullYear() === 2024
          ).length,
          companies.filter(
            (comp) => new Date(comp.createdAt).getFullYear() === 2025
          ).length,
        ],
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 4,
        pointHitRadius: 10,
      },
    ],
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="max-w-md p-6 rounded-lg shadow-lg bg-red-50 dark:bg-red-900/20 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-red-500 dark:text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with your organization.
            </p>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <>
                <FiSun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <FiMoon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </header>

        {/* Summary Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Companies",
              value: companies.length,
              color: "indigo",
              key: "companies",
              link: "/admin/companies",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )
            },
            {
              title: "Total Employees",
              value: employees.length,
              color: "red",
              key: "employees",
              link: "/admin/employees",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            },
            {
              title: "Industries",
              value: industryCount,
              color: "emerald",
              key: "industries",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )
            },
            {
              title: "Departments",
              value: departmentCount,
              color: "orange",
              key: "departments",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )
            },
          ].map((card) => {
            const colorClasses = {
              indigo: {
                bg: "bg-indigo-50 dark:bg-indigo-900/20",
                text: "text-indigo-600 dark:text-indigo-300",
                hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900/30",
              },
              red: {
                bg: "bg-red-50 dark:bg-red-900/20",
                text: "text-red-600 dark:text-red-300",
                hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
              },
              emerald: {
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                text: "text-emerald-600 dark:text-emerald-300",
                hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
              },
              orange: {
                bg: "bg-orange-50 dark:bg-orange-900/20",
                text: "text-orange-600 dark:text-orange-300",
                hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
              },
            };

            const CardContent = (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className={`p-5 rounded-xl shadow-sm transition-all duration-300 cursor-pointer h-full flex flex-col ${
                  colorClasses[card.color].bg
                } ${!card.link ? colorClasses[card.color].hover : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-sm font-medium uppercase tracking-wider ${colorClasses[card.color].text}`}>
                    {card.title}
                  </h3>
                  <div className={`p-2 rounded-lg ${colorClasses[card.color].text}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-auto">
                  <p className={`text-3xl font-bold ${colorClasses[card.color].text}`}>
                    {card.value.toLocaleString()}
                  </p>
                  {card.link && (
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>View all</span>
                      <FiExternalLink className="ml-1 w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>
            );

            if (card.link) {
              return (
                <Link to={card.link} key={card.key} className="h-full">
                  {CardContent}
                </Link>
              );
            }

            return (
              <div key={card.key} className="h-full">
                {CardContent}
              </div>
            );
          })}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Industry Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl shadow-md transition-colors duration-300 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Companies by Industry
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(industryData).length} industries
              </span>
            </div>
            <div className="h-80">
              <Bar data={industryChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Department Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl shadow-md transition-colors duration-300 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Employees by Department
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(departmentData).length} departments
              </span>
            </div>
            <div className="h-80">
              <Pie data={departmentChartData} options={chartOptions} />
            </div>
          </motion.div>
        </section>

        {/* Yearly Trend Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-xl shadow-md mb-8 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Yearly Company Registration Trend
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              6 year overview
            </span>
          </div>
          <div className="h-96">
            <Line data={yearlyData} options={chartOptions} />
          </div>
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl shadow-md transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Recent Companies
            </h3>
            <Link 
              to="/admin/companies" 
              className="text-sm flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all <FiExternalLink className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {companies
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((company, index) => (
                    <tr 
                      key={index}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        index % 2 === 0
                          ? darkMode
                            ? "bg-gray-800/20"
                            : "bg-gray-50"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {company.industry}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            company.isVerified 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}>
                            {company.isVerified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AdminDashBoard;
