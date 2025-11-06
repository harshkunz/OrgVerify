import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence } from "framer-motion";

const UserLogin = ({ setCurrentUser }) => {
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    orgIdNumber: "",
    password: "",
  });
  const [captchaError, setCaptchaError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const authurl = import.meta.env.VITE_AUTH_ROUTE;

  const autoFillTestCredentials = () => {
    if (
      import.meta.env.MODE === "development" ||
      import.meta.env.MODE === "production"
    ) {
      setFormData({
        email: "xyz@gmail.com",
        orgIdNumber: "1111111111111119",
        password: "@xyz123$$",
      });

      const button = document.querySelector(".auto-fill-button");
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 1000);
      }

      console.log(
        "Auto-filled test credentials in",
        import.meta.env.MODE,
        "mode"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    if (
      (loginMethod === "email" && !formData.email) ||
      (loginMethod === "orgId" && !formData.orgIdNumber) ||
      !formData.password
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Please complete the captcha verification");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        password: formData.password,
        captchaToken,
      };

      if (loginMethod === "email") {
        payload.email = formData.email;
      } else {
        payload.orgIdNumber = formData.orgIdNumber;
      }

      const { data } = await axios.post(`${authurl}/login`, payload);
      localStorage.setItem("token", data.token);

      if (data.success) {
        if (data.requiresVerification) {
          setVerificationStep(true);
        } else {
          navigate("/user/profile");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login error";
      setError(errorMsg);

      // Reset ReCAPTCHA on verification/captcha errors
      if (
        errorMsg.toLowerCase().includes("verification") ||
        errorMsg.toLowerCase().includes("expired") ||
        errorMsg.toLowerCase().includes("captcha") ||
        errorMsg.toLowerCase().includes("invalid")
      ) {
        setCaptchaToken("");
        setCaptchaError("Verification expired. Please complete the captcha again.");
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle ReCAPTCHA expiration
  const handleCaptchaExpire = () => {
    setCaptchaToken("");
    setCaptchaError("Verification expired. Please verify again.");
  };

  const handleVerifyLogin = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${authurl}/verify-email`, {
        [loginMethod === "email" ? "email" : "orgIdNumber"]:
          loginMethod === "email" ? formData.email : formData.orgIdNumber,
        code: verificationCode,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/user/profile");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-2 transition-colors duration-300">
      <div className="w-full max-w-md">
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
          className="bg-white dark:bg-gray-800 rounded-4xl shadow-2xl p-4 mx-4-2 border-2 border-blue-100 dark:border-gray-700 transition-colors duration-300"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center mb-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-2"
            >
              <svg
                className="w-6 h-6 text-purple-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-normal">
              User Login
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sign in to access your account
            </p>
          </motion.div>

          {/* Auto-fill Button */}
          {(import.meta.env.MODE === "development" ||
            import.meta.env.MODE === "production") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mb-4"
            >
              <button
                onClick={autoFillTestCredentials}
                className="auto-fill-button block mx-auto w-2/4 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs rounded-3xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Auto-fill Test Credentials
                </span>
              </button>
            </motion.div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border-1 border-red-100 dark:border-red-800 rounded-3xl flex items-start overflow-hidden"
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
                <div>
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                  {(error.toLowerCase().includes("verification") ||
                    error.toLowerCase().includes("expired") ||
                    error.toLowerCase().includes("captcha")) && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      ⚠️ Please complete the reCAPTCHA below again.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!verificationStep ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Login Method Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="flex gap-4 mb-4 p-2"
                >
                  <button
                    className={`relative flex-1 py-1.5 text-sm font-normal rounded-3xl transition-all duration-300 group ${
                      loginMethod === "email"
                        ? "text-purple-700 dark:text-blue-400 bg-purple-100 dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setLoginMethod("email")}
                  >
                    Email
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-300 ${
                        loginMethod === "email" ? "" : "w-0 group-hover:w-3/4"
                      }`}
                    ></span>
                  </button>

                  <button
                    className={`relative flex-1 py-1.5 text-sm font-normal rounded-3xl transition-all duration-300 group ${
                      loginMethod === "orgId"
                        ? "text-purple-700 dark:text-blue-400 bg-purple-100 dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setLoginMethod("orgId")}
                  >
                    Organization ID
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-300 ${
                        loginMethod === "orgId" ? "" : "w-0 group-hover:w-3/4"
                      }`}
                    ></span>
                  </button>
                </motion.div>

                {/* Login Form */}
                <div className="space-y-3 mx-3">
                  <AnimatePresence mode="wait">
                    {loginMethod === "email" ? (
                      <motion.div
                        key="email"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-xs font-medium/50 text-black dark:text-gray-300 mb-1.5">
                          Email Address
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
                      </motion.div>
                    ) : (
                      <motion.div
                        key="orgId"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-xs font-medium/50 text-black dark:text-gray-300 mb-1.5">
                          Organization ID Number
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <label className="block text-xs font-medium/50 text-black dark:text-gray-300 mb-1.5">
                      Password
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
                        placeholder="Enter your password"
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
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="flex items-center justify-between text-xs px-4"
                  >
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 text-gray-700 dark:text-gray-300"
                      >
                        Remember me
                      </label>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="font-medium text-purple-600 hover:text-blue-600 dark:text-purple-400 dark:hover:text-blue-400 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  {/* ReCAPTCHA */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    className="flex justify-center pt-2 pb-1"
                  >
                    <div className="transform scale-90 origin-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={(token) => {
                          setCaptchaToken(token);
                          setCaptchaError("");
                          setError("");
                        }}
                        onExpired={handleCaptchaExpire}
                        onErrored={() => {
                          setCaptchaToken("");
                          setCaptchaError(
                            "Verification failed. Please try again."
                          );
                        }}
                        theme="light"
                      />
                    </div>
                  </motion.div>

                  {/* Login Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.0 }}
                    whileHover={!loading ? { scale: 1.03 } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-2/4 mx-auto text-xs py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <svg
                          className="w-4 h-4 ml-1 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  className="relative my-4"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </motion.div>

                {/* Google Sign In */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                >
                  <motion.button
                    whileHover={{ scale: captchaToken ? 1.05 : 1 }}
                    whileTap={{ scale: captchaToken ? 0.95 : 1 }}
                    onClick={() => {
                      if (!captchaToken) {
                        setCaptchaError(
                          "Please complete the captcha before continuing with Google."
                        );
                        return;
                      }
                      window.location.href = `${authurl}/google`;
                    }}
                    disabled={!captchaToken}
                    className={`w-2/4 mx-auto flex items-center justify-center text-xs gap-2 py-2.5 px-6 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-3xl transition-all duration-300 shadow-md hover:shadow-lg ${
                      !captchaToken ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <img
                      src="https://developers.google.com/identity/images/g-logo.png"
                      alt="Google"
                      className="w-4 h-4"
                    />
                    Continue with Google
                  </motion.button>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                  className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400"
                >
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-purple-600 hover:text-blue-600 dark:text-purple-400 dark:hover:text-blue-400 transition-colors"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-3xl"
                >
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
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
                  </motion.svg>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold text-sm">
                    Verification code sent!
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    We sent a 6-digit code to your{" "}
                    {loginMethod === "email" ? "email" : "registered email"}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
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
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  onClick={handleVerifyLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </>
                  )}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVerificationStep(false)}
                  className="w-full py-2.5 px-4 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium rounded-3xl border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300"
                >
                  Back to login
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default UserLogin;
