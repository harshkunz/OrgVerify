import React from 'react';
import { FaChartLine, FaUsers, FaRegThumbsUp, FaBullseye, FaShieldAlt, FaCheckCircle, FaHeadset } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Home = () => {
  const chartData = {
    labels: ['2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Organizations Verified',
        data: [120, 200, 350, 500],
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#333',
          font: {
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          color: '#333',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="home-page bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to Organization Verification System
          </h1>
          <p className="text-xl md:text-2xl">
            Ensuring the authenticity and reliability of organizational credentials with advanced technology.
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">Our Impact</h2>
          <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="stat-card bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <FaChartLine className="stat-icon text-blue-600 text-5xl mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">500+</h3>
              <p className="text-gray-600 dark:text-gray-300">Organizations Verified</p>
            </div>
            <div className="stat-card bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <FaUsers className="stat-icon text-green-600 text-5xl mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">10,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Active Users</p>
            </div>
            <div className="stat-card bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
              <FaRegThumbsUp className="stat-icon text-purple-600 text-5xl mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">98%</h3>
              <p className="text-gray-600 dark:text-gray-300">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="chart-section py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Organizations Verified Over Years
          </h2>
          <div className="chart-container bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md" style={{ height: '400px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our mission is to provide a secure, user-friendly, and reliable platform for organization verification, 
            ensuring that every credential is authentic and trustworthy.
          </p>
        </div>
      </section>

      {/* Goals Section */}
      <section className="goals-section py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">Our Goals</h2>
          <ul className="space-y-6">
            <li className="flex items-center text-lg text-gray-700 dark:text-gray-300">
              <FaBullseye className="text-blue-600 text-2xl mr-4" />
              <span>Expand our reach across all sectors</span>
            </li>
            <li className="flex items-center text-lg text-gray-700 dark:text-gray-300">
              <FaShieldAlt className="text-green-600 text-2xl mr-4" />
              <span>Innovate with the latest technology</span>
            </li>
            <li className="flex items-center text-lg text-gray-700 dark:text-gray-300">
              <FaCheckCircle className="text-purple-600 text-2xl mr-4" />
              <span>Maintain top-notch customer satisfaction</span>
            </li>
            <li className="flex items-center text-lg text-gray-700 dark:text-gray-300">
              <FaHeadset className="text-orange-600 text-2xl mr-4" />
              <span>Enhance user experience continuously</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="service-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Credential Verification</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Verify employee credentials and organizational documents with our advanced verification system.
              </p>
            </div>
            <div className="service-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Secure Storage</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Store your organization's verified credentials securely in our encrypted database.
              </p>
            </div>
            <div className="service-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Real-time Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant notifications about verification status and credential updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info Section */}
      <section className="footer-info py-16 px-6 bg-gray-800 dark:bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">OrgVerify</h3>
          <p className="text-lg mb-6">
            Your trusted partner in organizational excellence. Providing quality and reliable verification 
            services with a commitment to customer satisfaction.
          </p>
          <div className="footer-bottom">
            <p className="text-sm text-gray-400">&copy; 2024 OrgVerify Platform. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;