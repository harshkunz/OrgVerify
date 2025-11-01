import { FcGoogle } from "react-icons/fc";
import { FaApple, FaMicrosoft, FaTwitter } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";  // ✅ FIXED: Added Link
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

// Configure axios
axios.defaults.withCredentials = true;

const MAX_ATTEMPTS = 5;
const authurl = import.meta.env.VITE_ADMIN_ROUTE;

const AdminLogin = () => {
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLocked, setIsLocked] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
  const [errorMessage, setErrorMessage] = useState("");
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    
    setIsLoading(true);
    setErrorMessage(""); // Clear previous error message
    
    try {
      const response = await axios.post(
        `${authurl}/login`,
        adminCredentials
      );
      localStorage.setItem("adminToken", response.data.token);
      
      await Swal.fire({
        title: "Success",
        text: "🎉 Admin Login Successful!",
        icon: "success",
        showConfirmButton: false,
        timer: 1500
      });
      
      // Reset attempts on successful login
      setAttempts(0);
      setRemainingAttempts(MAX_ATTEMPTS);
      navigate("/admin/dashboard");
    } catch (error) {
      const backendMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Invalid credentials";
      
      // Set error message to display below form
      setErrorMessage(backendMsg);

      // Increment attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const newRemaining = MAX_ATTEMPTS - newAttempts;
      setRemainingAttempts(newRemaining);

      // Only show Swal on the 5th attempt
      if (newAttempts >= MAX_ATTEMPTS) {
        await Swal.fire({
          title: "Account Locked",
          text: "Too many failed attempts. Please try again later.",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }

      // Handle rate limiting
      if (error.response?.status === 429 || newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setLockSeconds(60);
        timerRef.current = setInterval(() => {
          setLockSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsLocked(false);
              setAttempts(0);
              setRemainingAttempts(MAX_ATTEMPTS);
              return 60;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials({ ...adminCredentials, [name]: value });
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"
              >
                Admin Portal
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-gray-600 dark:text-gray-400"
              >
                Sign in to access the dashboard
              </motion.p>
            </div>

            <motion.form
              variants={containerVariants}
              className="space-y-4"
              onSubmit={handleAdminLogin}
            >
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={adminCredentials.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLocked || isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 disabled:opacity-50"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  {!isLocked && (
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Forgot?
                    </a>
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={adminCredentials.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLocked || isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 disabled:opacity-50"
                />
              </motion.div>

              {/* Error message display */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-red-600 dark:text-red-400"
                >
                  {errorMessage}
                </motion.div>
              )}

              {!isLocked && attempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-amber-600 dark:text-amber-400"
                >
                  {remainingAttempts > 0 ? (
                    <span>Remaining attempts: {remainingAttempts}</span>
                  ) : (
                    <span>No attempts remaining. Account locked.</span>
                  )}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLocked || isLoading}
                  className={`w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
                    (isLocked || isLoading) ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : isLocked ? (
                    `Try again in ${lockSeconds}s`
                  ) : (
                    "Sign in"
                  )}
                </button>

                <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
                  Don't have an admin account?{" "}
                  <Link
                    to="/admin-signup"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                  >
                    Register as Admin
                  </Link>
                </p>
              </motion.div>
            </motion.form>

            {isLocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-sm text-red-600 dark:text-red-400 font-medium"
              >
                Too many login attempts. Please wait {lockSeconds} seconds.
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 gap-3"
            >
              <motion.button
                variants={itemVariants}
                type="button"
                disabled
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 cursor-pointer disabled:opacity-50"
              >
                <FcGoogle className="text-lg" />
                <span>Google</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                type="button"
                disabled
                className="cursor-pointer flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50"
              >
                <FaMicrosoft className="text-blue-600 text-lg" />
                <span>Microsoft</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                type="button"
                disabled
                className="cursor-pointer flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50"
              >
                <FaApple className="text-gray-900 dark:text-gray-200 text-lg" />
                <span>Apple</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                type="button"
                disabled
                className="cursor-pointer flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50"
              >
                <FaTwitter className="text-blue-400 text-lg" />
                <span>Twitter</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
