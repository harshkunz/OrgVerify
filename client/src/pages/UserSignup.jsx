import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";

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

      // Calculate score
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

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Password Strength</span>
        <span className="text-sm font-medium">{getStrengthText()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getStrengthColor()}`}
          style={{ width: `${strength}%` }}
        ></div>
      </div>

      <div className="mt-3 text-sm">
        <p className="font-medium mb-1">Password Requirements:</p>
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
            At least one uppercase letter
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
            At least one lowercase letter
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
            At least one number
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
            At least one special character
          </li>
        </ul>
      </div>
    </div>
  );
};
const UserSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1); // Track the farthest step reached
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For positive feedback
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [strength, setStrength] = useState(0); // Add strength state
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
    if (
      formData.orgIdNumber.length > 0 &&
      formData.orgIdNumber.length !== 16
    ) {
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
      const { data } = await axios.get(`${orgIdUrl}/api/org-ids/${formData.orgIdNumber}`);
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
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to verify Organization ID");
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
      const { data } = await axios.get(`${orgIdUrl}/api/org-ids/${formData.orgIdNumber}`);
      if (data.success && data.orgID) {
        // Verify phone matches if provided in orgID
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
      setError(err.response?.data?.error || err.response?.data?.message || "Verification error");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12 overflow-x-hidden">
      <div className="w-full max-w-full md:max-w-7xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            ← Back to Home
          </Link>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Organization Verification System
          </h2>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Please follow the steps below to create your account.
        </p>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex flex-col items-center cursor-pointer ${
                stepNumber <= maxStep ? "" : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => {
                if (stepNumber <= maxStep) setStep(stepNumber);
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {stepNumber}
              </div>
              <div
                className={`text-xs mt-1 ${
                  step >= stepNumber
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500"
                }`}
              >
                {["Verify ID", "Confirm", "Account", "Verify"][stepNumber - 1]}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Step 1: Organization ID Verification */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter your 16-digit Organization ID Number
              </label>
              <input
                type="text"
                name="orgIdNumber"
                placeholder="Enter 16-digit Organization ID"
                value={formData.orgIdNumber}
                onChange={handleInputChange}
                maxLength={16}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleVerifyOrgId}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Verifying..." : "Verify Organization ID"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender
                </label>
                <input
                  type="text"
                  value={formData.gender}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleVerifyIdentity}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </div>
        )}

        {/* Step 3: Create Account */}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create password (min 8 chars)"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <PasswordStrengthMeter password={formData.password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    ? "Passwords match!"
                    : "Passwords do not match!"}
                </p>
              )}
            </div>
            <button
              onClick={handleRegister}
              disabled={
                loading ||
                strength < 80 ||
                formData.password !== formData.confirmPassword
              }
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        )}

        {/* Step 4: Verify Email */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              We sent a 6-digit verification code to{" "}
              <span className="font-medium">{formData.email}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleVerifyEmail}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSignup;
