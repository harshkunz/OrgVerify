import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    const calculateStrength = () => {
      let score = 0;
      const newRequirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[^A-Za-z0-9]/.test(password),
      };

      setRequirements(newRequirements);

      if (newRequirements.length) score += 20;
      if (newRequirements.uppercase) score += 20;
      if (newRequirements.lowercase) score += 20;
      if (newRequirements.number) score += 20;
      if (newRequirements.specialChar) score += 20;

      setStrength(score);
    };

    calculateStrength();
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
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600"
    >
      <div className="flex justify-between mb-2">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Password Strength
        </span>
        <span
          className={`text-xs font-semibold ${
            strength < 40
              ? "text-red-500"
              : strength < 80
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {getStrengthText()}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.3 }}
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
        ></motion.div>
      </div>

      <ul className="space-y-1.5">
        {[
          { key: "length", text: "At least 8 characters" },
          { key: "uppercase", text: "One uppercase letter" },
          { key: "lowercase", text: "One lowercase letter" },
          { key: "number", text: "One number" },
          { key: "specialChar", text: "One special character" },
        ].map((req) => (
          <motion.li
            key={req.key}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`flex items-center text-xs ${
              requirements[req.key]
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {requirements[req.key] ? (
              <FaCheck className="mr-2 flex-shrink-0" />
            ) : (
              <FaTimes className="mr-2 flex-shrink-0" />
            )}
            {req.text}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const UserSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    orgIdNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handlePasswordStrength = (password) => {
    let score = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };

    if (requirements.length) score += 20;
    if (requirements.uppercase) score += 20;
    if (requirements.lowercase) score += 20;
    if (requirements.number) score += 20;
    if (requirements.specialChar) score += 20;

    setStrength(score);
  };

  useEffect(() => {
    handlePasswordStrength(formData.password);
  }, [formData.password]);

  const orgIdUrl = import.meta.env.VITE_ORG_ID_ROUTE || "http://localhost:6000";
  const authurl = import.meta.env.VITE_AUTH_ROUTE;

  useEffect(() => {
    if (formData.orgIdNumber.length > 0 && formData.orgIdNumber.length !== 16) {
      setError("Organization ID must be 16 digits");
    } else {
      setError("");
    }
  }, [formData.orgIdNumber]);

  const goToStep = (nextStep) => {
    setStep(nextStep);
    if (nextStep > maxStep) setMaxStep(nextStep);
  };

  const handleVerifyOrgId = async () => {
    if (formData.orgIdNumber.length !== 16) {
      setError("Please enter a valid 16-digit Organization ID");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const { data } = await axios.get(
        `${orgIdUrl}/api/org-ids/${formData.orgIdNumber}`
      );
      if (data.success && data.orgID) {
        setFormData((prev) => ({
          ...prev,
          firstName: data.orgID.firstName,
          middleName: data.orgID.middleName,
          lastName: data.orgID.lastName,
          gender: data.orgID.gender,
        }));
        setSuccessMessage("Organization ID verified successfully!");
        goToStep(2);
      } else {
        setError(data.error || "Organization ID not found");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to verify Organization ID"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async () => {
    if (!formData.phone) {
      setError("Phone number is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const { data } = await axios.get(
        `${orgIdUrl}/api/org-ids/${formData.orgIdNumber}`
      );
      if (data.success && data.orgID) {
        if (data.orgID.phone_no && data.orgID.phone_no !== formData.phone) {
          setError("Phone number does not match Organization ID record");
          setLoading(false);
          return;
        }
        setSuccessMessage("Identity verified successfully!");
        goToStep(3);
      } else {
        setError(data.error || "Identity verification failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Verification error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const { data } = await axios.post(`${authurl}/register`, {
        orgIdNumber: formData.orgIdNumber,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });
      if (data.success) {
        setSuccessMessage(
          "Registration successful! Please check your email for verification."
        );
        goToStep(4);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const { data } = await axios.post(`${authurl}/verify-email`, {
        email: formData.email,
        code: verificationCode,
      });
      localStorage.setItem("token", data.token);

      if (data.success) {
        setSuccessMessage("Email verified successfully!");
        navigate("/user/profile");
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Verify ID" },
    { number: 2, label: "Confirm" },
    { number: 3, label: "Account" },
    { number: 4, label: "Verify" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6 transition-colors duration-300">
      <div className="w-full max-w-2xl">
        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex text-sm items-center mb-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <svg
              className="w-4 h-4 ml-2 mr-1 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 border-2 border-blue-100 dark:border-gray-700 transition-colors duration-300"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-3"
            >
              <svg
                className="w-7 h-7 text-purple-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-normal mb-1">
              User Signup
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create your account in a few simple steps
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between mb-6 px-4"
          >
            {steps.map((s, index) => (
              <div key={s.number} className="flex flex-col items-center flex-1">
                <div
                  onClick={() => {
                    if (s.number <= maxStep) setStep(s.number);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step >= s.number
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110"
                      : s.number <= maxStep
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer hover:scale-105"
                      : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {s.number}
                </div>
                <div
                  className={`text-xs mt-2 font-medium text-center ${
                    step >= s.number
                      ? "text-purple-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {s.label}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute w-full h-0.5 bg-gray-200 dark:bg-gray-700 top-5 left-1/2 -z-10 hidden md:block"></div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border-1 border-red-100 dark:border-red-800 rounded-3xl flex items-start overflow-hidden"
              >
                <svg
                  className="w-4 h-4 mx-1 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border-1 border-green-100 dark:border-green-800 rounded-3xl flex items-start overflow-hidden"
              >
                <svg
                  className="w-4 h-4 mx-1 text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {successMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {/* Step 1: Organization ID Verification */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 px-3"
              >
                <div>
                  <label className="block text-xs text-black dark:text-gray-300 mb-1.5">
                    16-Digit Organization ID Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="orgIdNumber"
                      placeholder="Enter 16-digit Organization ID"
                      value={formData.orgIdNumber}
                      onChange={handleInputChange}
                      maxLength={16}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: !loading ? 1.02 : 1 }}
                  whileTap={{ scale: !loading ? 0.98 : 1 }}
                  onClick={handleVerifyOrgId}
                  disabled={loading}
                  className="w-2/5 mx-auto py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {loading ? "Verifying..." : "Verify Organization ID"}
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Confirm Identity */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 px-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      readOnly
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middleName}
                      readOnly
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      readOnly
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={formData.gender}
                      readOnly
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: !loading ? 1.02 : 1 }}
                  whileTap={{ scale: !loading ? 0.98 : 1 }}
                  onClick={handleVerifyIdentity}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {loading ? "Verifying..." : "Continue"}
                </motion.button>
              </motion.div>
            )}

            {/* Step 3: Create Account */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 px-3"
              >
                <div>
                  <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={formData.password} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black dark:text-gray-300 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && (
                    <p
                      className={`text-xs mt-1.5 flex items-center ${
                        formData.password === formData.confirmPassword
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <FaCheck className="mr-1" /> Passwords match
                        </>
                      ) : (
                        <>
                          <FaTimes className="mr-1" /> Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: !loading ? 1.02 : 1 }}
                  whileTap={{ scale: !loading ? 0.98 : 1 }}
                  onClick={handleRegister}
                  disabled={
                    loading ||
                    strength < 80 ||
                    formData.password !== formData.confirmPassword
                  }
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {loading ? "Registering..." : "Register"}
                </motion.button>
              </motion.div>
            )}

            {/* Step 4: Verify Email */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 px-3"
              >
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-3xl">
                  <svg
                    className="w-10 h-10 text-purple-600 dark:text-blue-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold text-sm">
                    Verification code sent!
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium">{formData.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl font-mono tracking-widest placeholder-gray-300 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    maxLength={6}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: !loading ? 1.02 : 1 }}
                  whileTap={{ scale: !loading ? 0.98 : 1 }}
                  onClick={handleVerifyEmail}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Link */}
          <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-600 hover:text-blue-600 dark:text-purple-400 dark:hover:text-blue-400 transition-colors"
            >
              Login here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserSignup;
