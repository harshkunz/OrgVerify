import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";


const UserLogin = ({ setCurrentUser }) => {
  const [captchaToken, setCaptchaToken] = useState("");
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
  const authurl = import.meta.env.VITE_AUTH_ROUTE;

  // Enhanced auto-fill function with visual feedback
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

      // Visual feedback
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
      setError(err.response?.data?.error || "Login error");
    } finally {
      setLoading(false);
    }
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

      // Optionally: also store user info if sent via query
      // localStorage.setItem("user", JSON.stringify(user));

      navigate("/user/profile"); // Redirect to user dashboard
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            ← Back to Home
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Login
          </h2>
        </div>

        {/* Enhanced Auto-fill Button */}
        {(import.meta.env.MODE === "development" ||
          import.meta.env.MODE === "production") && (
          <div className="mb-4 relative group">
            <button
              onClick={autoFillTestCredentials}
              className="auto-fill-button w-full py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-medium rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                Auto-fill Test Credentials
              </span>
            </button>
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-yellow-600 dark:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Development mode only
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Rest of the component remains unchanged */}
        {!verificationStep ? (
          <>
            {/* Login Method Toggle */}
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-2 font-medium ${
                  loginMethod === "email"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => setLoginMethod("email")}
              >
                Email
              </button>
              <button
                className={`flex-1 py-2 font-medium ${
                  loginMethod === "orgId"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => setLoginMethod("orgId")}
              >
                Organization ID
              </button>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              {loginMethod === "email" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
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
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization ID Number
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
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                
                onChange={(token) => {setCaptchaToken(token);
                   setCaptchaError("");
                }}
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

 <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (!captchaToken) {
                  setCaptchaError("Please complete the captcha before continuing with Google.");
                  return;
                }
                window.location.href = `${authurl}/google`;
              }}
              disabled={!captchaToken}
              className={`w-full flex items-center justify-center gap-3 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition ${
                !captchaToken ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            {captchaError && (
              <div className="text-red-500 text-sm mt-2">{captchaError}</div>
            )}
          </div>

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Verification Step */}
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                We sent a 6-digit verification code to your{" "}
                {loginMethod === "email" ? "email" : "registered email"}
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
                onClick={handleVerifyLogin}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                onClick={() => setVerificationStep(false)}
                className="w-full py-2 px-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium rounded-lg"
              >
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
