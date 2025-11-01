import React from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaUsers, FaUserFriends } from 'react-icons/fa';
import AdminDashBoard from '../admin/AdminDashBoard';



const AdminDashboard = () => {
  return (
    <div className="w-full px-4 py-6 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome, Admin 👋</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8">
        Manage organizations, users, and employees effortlessly. Use the quick actions below or navigate using the sidebar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Companies */}
        <Link
          to="/admin/companies"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <FaBuilding className="text-4xl text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl font-semibold">Companies</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage registered companies.
              </p>
            </div>
          </div>
        </Link>

        {/* User Management */}
        <Link
          to="/admin/usermanagement"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <FaUsers className="text-4xl text-green-600 dark:text-green-400" />
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage user accounts and permissions.
              </p>
            </div>
          </div>
        </Link>

        {/* External Users */}
        <Link
          to="/admin/ExternalUserManagement"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <FaUserFriends className="text-4xl text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold">External Users</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage external user accounts.
              </p>
            </div>
          </div>
        </Link>
      </div>
      <AdminDashBoard />
    </div>
  );
};

export default AdminDashboard;
