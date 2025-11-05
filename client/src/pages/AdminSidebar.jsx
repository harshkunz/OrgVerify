import React from "react";
import { 
  FaTachometerAlt, 
  FaBuilding, 
  FaUserPlus, 
  FaUsersCog,
  FaUserShield,
} from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

/**
 * AdminSidebar - Navigation sidebar for admin dashboard
 * @returns {JSX.Element} React component
 */
const AdminSidebar = () => {
  const location = useLocation();

  // Helper function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-full md:w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col h-screen sticky top-0">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Dashboard
      </h2>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {/* Dashboard Link */}
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive("/admin")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaTachometerAlt className={`${
              isActive("/admin") ? "text-blue-600 dark:text-blue-300" : "text-blue-500 dark:text-blue-400"
            }`} />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Organization Management Section */}
          <div className="mt-2">
            <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Organization Management
            </p>
            
            <Link
              to="/admin/companies"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive("/admin/companies")
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <FaBuilding className={`${
                isActive("/admin/companies") ? "text-green-600 dark:text-green-300" : "text-green-500 dark:text-green-400"
              }`} />
              <span className="font-medium">Companies</span>
            </Link>
          </div>

          {/* User Management Section */}
          <div className="mt-2">
            <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              User Management
            </p>
            
            <Link
              to="/admin/create/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive("/admin/addingUser")
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <FaUserPlus className={`${
                isActive("/admin/addingUser") ? "text-blue-600 dark:text-blue-300" : "text-blue-500 dark:text-blue-400"
              }`} />
              <span className="font-medium">Create New User</span>
            </Link>
            
            <Link
              to="/admin/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive("/admin/usermanagement")
                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <FaUsersCog className={`${
                isActive("/admin/usermanagement") ? "text-red-600 dark:text-red-300" : "text-red-500 dark:text-red-400"
              }`} />
              <span className="font-medium">Manage Accounts</span>
            </Link>
            
            <Link
              to="/admin/users/external"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive("/admin/ExternalUserManagement")
                  ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              <FaUserShield className={`${
                isActive("/admin/ExternalUserManagement") ? "text-orange-600 dark:text-orange-300" : "text-orange-500 dark:text-orange-400"
              }`} />
              <span className="font-medium">External Users</span>
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
};
 
export default AdminSidebar;