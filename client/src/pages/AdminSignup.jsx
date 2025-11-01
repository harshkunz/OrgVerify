import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaCheck, FaTimes, FaUserShield } from "react-icons/fa";

const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  React.useEffect(() => {
    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };

    setRequirements(newRequirements);

    let score = 0;
    if (newRequirements.length) score += 20;
    if (newRequirements.uppercase) score += 20;
    if (newRequirements.lowercase) score += 20;
    if (newRequirements.number) score += 20;
    if (newRequirements.specialChar) score += 20;

    setStrength(score);
  }, [password]);

  const getStrengthColor = () => {
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Moderate";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password Strength
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getStrengthText()}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getStrengthColor()}`}
          style={{ width: `${strength}%` }}
        ></div>
      </div>

      <div className="mt-3 text-sm">
        <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">
          Password Requirements:
        </p>
        <ul className="space-y-1">
          <li
            className={`flex items-center ${
              requirements.length ? "text-green-500" : "text-gray-500"
            }`}
          >
            {requirements.length ? (
              <FaCheck className="mr-1" />
            ) : (
              <FaTimes className="mr-1" />
            )}
            At least 8 characters
          </li>
          <li
            className={`flex items-center ${
              requirements.uppercase ? "text-green-500" : "text-gray-500"
            }`}
          >
            {requirements.uppercase ? (
              <FaCheck className="mr-1" />
            ) : (
              <FaTimes className="mr-1" />
            )}
            One uppercase letter
          </li>
          <li
            className={`flex items-center ${
              requirements.lowercase ? "text-green-500" : "text-gray-500"
            }`}
          >
            {requirements.lowercase ? (
              <FaCheck className="mr-1" />
            ) : (
              <FaTimes className="mr-1" />
            )}
            One lowercase letter
          </li>
          <li
            className={`flex items-center ${
              requirements.number ? "text-green-500" : "text-gray-500"
            }`}
          >
            {requirements.number ? (
              <FaCheck className="mr-1" />
            ) : (
              <FaTimes className="mr-1" />
            )}
            One number
          </li>
          <li
            className={`flex items-center ${
              requirements.specialChar ? "text-green-500" : "text-gray-500"
            }`}
          >
            {requirements.specialChar ? (
              <FaCheck className="mr-1" />
            ) : (
              <FaTimes className="mr-1" />
            )}
            One special character
          </li>
        </ul>
      </div>
    </div>
  );
};

const AdminSignup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    role: "admin",
  });

  const adminUrl = import.meta.env.VITE_ADMIN_ROUTE || "http://localhost:5000/api/admin";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { data } = await axios.post(`${adminUrl}/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        role: formData.role,
      });

      if (data.success) {
        setSuccessMessage(
          "Admin registration successful! Redirecting to login..."
        );
        
        setTimeout(() => {
          navigate("/admin-login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setFormData({
      firstName: "Admin",
      lastName: "User",
      email: `admin${Date.now()}@example.com`,
      password: "Admin@123",
      confirmPassword: "Admin@123",
      gender: "male",
      role: "admin",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-block mb-4 text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium transition"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <FaUserShield className="text-purple-600 dark:text-purple-400 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Registration
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create an admin account to manage the system
          </p>
        </div>

        {/* Dev Mode Auto-Fill */}
        {(import.meta.env.MODE === "development" ||
          import.meta.env.VITE_SHOW_AUTO_FILL === "true") && (
          <button
            type="button"
            onClick={handleAutoFill}
            className="w-full mb-4 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
          >
            🎯 Auto-Fill Admin Data (Dev Mode)
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-800">
            {successMessage}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
          </div>

          {/* Gender and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
            <PasswordStrengthMeter password={formData.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
            {formData.password && formData.confirmPassword && (
              <p
                className={`text-sm mt-1 ${
                  formData.password === formData.confirmPassword
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formData.password === formData.confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || formData.password !== formData.confirmPassword}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
          >
            {loading ? "Creating Admin Account..." : "Create Admin Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Already have an admin account?{" "}
          <Link
            to="/admin-login"
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
