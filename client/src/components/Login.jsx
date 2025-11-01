import React, { useState } from "react";
import { FaChartLine, FaThumbsUp, FaCog } from "react-icons/fa";
import Chart from "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate(); // Initialized useNavigate to redirect after login

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/login",
        adminCredentials
      ); // Admin login API call
      console.log("Admin logged in:", response.data);

      // Store token in localStorage for admin authorization
      localStorage.setItem("adminToken", response.data.token);

      Swal.fire("Success", "🎉 Admin Login Successful!", "success");
      navigate("/admin-dashboard"); // Redirect to Admin Dashboard upon successful login
    } catch (error) {
      console.error("Admin login failed:", error);
      Swal.fire("Error", "❌ Admin Login Failed", "error");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setAdminCredentials({ ...adminCredentials, [id]: value });
  };

  const lineChartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "User Growth Over Time",
        data: [10, 20, 30, 40, 50, 60],
        borderColor: "#004a99",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const barChartData = {
    labels: ["Service A", "Service B", "Service C", "Service D"],
    datasets: [
      {
        label: "Service Popularity",
        data: [35, 25, 20, 20],
        backgroundColor: "#2a5298",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Admin Login</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Access exclusive content and features by logging into your admin
          account.
        </p>
      </header>

      <section className="max-w-md mx-auto mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Admin Login</h2>
          <form className="space-y-6" onSubmit={handleAdminLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={adminCredentials.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={adminCredentials.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Admin Login
            </button>
          </form>
        </div>
      </section>

      {/* Additional sections: charts, services, reviews, and footer */}
      <section className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Why Login?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <FaChartLine className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Track Your Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your organization's growth and see your progress over time.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <FaThumbsUp className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Exclusive Content</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Access exclusive resources and content available only to
              registered users.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <FaCog className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Personalized Experience</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your experience based on your preferences and
              goals.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Our Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Growth Over Time</h3>
            <Line data={lineChartData} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Service Popularity</h3>
            <Bar data={barChartData} />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Service A</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Description of Service A. Offering top-notch solutions and
              support.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Service B</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Description of Service B. Comprehensive and reliable service
              offerings.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Service C</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Description of Service C. Innovative approaches and expertise at
              your service.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Service D</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Description of Service D. Providing proper customer customization.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Akash Singh</h3>
            <p className="text-gray-600 dark:text-gray-400">
              "This platform has transformed my organization experience. Highly
              recommend!"
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Rituraj S</h3>
            <p className="text-gray-600 dark:text-gray-400">
              "Fantastic tools and resources. The personalized experience is
              unmatched."
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Divya Bhoi</h3>
            <p className="text-gray-600 dark:text-gray-400">
              "A great platform with excellent customer support and valuable
              content."
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Prakash Verma</h3>
            <p className="text-gray-600 dark:text-gray-400">"An excellent platform for organization management."</p>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">OrgVerify</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your trusted partner in excellence. Providing quality and reliable
            services with a commitment to customer satisfaction.
          </p>
          <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Us</a>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              &copy; 2024 OrgVerify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
