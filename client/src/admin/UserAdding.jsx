import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const orgIdUrl = import.meta.env.VITE_ORG_ID_ROUTE || "http://localhost:7000";

export default function CreateOrgIDPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    phone_no: "",
    dateOfBirth: "",
    address: { street: "", city: "", state: "", country: "Ethiopia", zipCode: "" },
  });
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "country", "zipCode"].includes(name)) {
      setFormData((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
    } else setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phone_no.trim()) newErrors.phone_no = "Phone number is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill in all required fields",
        icon: "warning",
        confirmButtonColor: "#0ea5e9",
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${orgIdUrl}/id/create`, formData);
      if (data.success) {
        setOrgId(data.orgID.orgIdNumber);
        Swal.fire({
          title: "✅ Success!",
          html: `<p style="font-size: 14px; color: #64748b; margin-bottom: 12px;">Your Organization ID has been created</p>
                 <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); 
                             padding: 16px; border-radius: 12px; margin-top: 16px;">
                   <p style="color: white; font-size: 12px; margin: 0 0 8px 0; opacity: 0.9;">Generated ID</p>
                   <p style="color: white; font-size: 24px; font-weight: 700; margin: 0; 
                              font-family: 'Courier New', monospace; letter-spacing: 2px;">
                     ${data.orgID.orgIdNumber}
                   </p>
                 </div>`,
          icon: "success",
          confirmButtonColor: "#0ea5e9",
          confirmButtonText: "Done",
        });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "Server error. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "John" },
    { name: "middleName", label: "Middle Name", type: "text", placeholder: "Michael" },
    { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Doe" },
    { name: "phone_no", label: "Phone Number", type: "tel", required: true, placeholder: "+251 912 345 678" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
  ];

  const addressFields = [
    { name: "street", label: "Street Address", placeholder: "123 Main Street" },
    { name: "city", label: "City", placeholder: "Addis Ababa" },
    { name: "state", label: "State/Region", placeholder: "Addis Ababa" },
    { name: "country", label: "Country", placeholder: "Ethiopia" },
    { name: "zipCode", label: "Zip Code", placeholder: "1000" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-sky-400/10 dark:bg-sky-400/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* Glassmorphism card */}
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl 
                        border border-white/20 dark:border-gray-700/50 p-6 sm:p-10 
                        hover:shadow-sky-500/10 transition-shadow duration-500">
          
          {/* Header with icon */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                         bg-gradient-to-br from-sky-400 to-blue-600 mb-4 shadow-lg shadow-sky-500/30"
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 
                         dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2"
            >
              Create Organization ID
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-400 text-sm sm:text-base"
            >
              Fill in the details below to generate a unique organizational identifier
            </motion.p>
          </div>

          {/* Personal Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {inputFields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="flex flex-col"
                >
                  <label 
                    htmlFor={field.name}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  <div className="relative group">
                    <input
                      id={field.name}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                      placeholder={field.placeholder}
                      className={`w-full p-3.5 rounded-xl border-2 transition-all duration-300
                        bg-white/60 dark:bg-gray-700/50 backdrop-blur-sm
                        text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                        ${errors[field.name] 
                          ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : focusedField === field.name
                            ? 'border-sky-500 dark:border-sky-400 ring-4 ring-sky-500/10 shadow-lg shadow-sky-500/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-500'
                        }
                        focus:outline-none`}
                    />
                    
                    {/* Animated border on focus */}
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      initial={false}
                      animate={{
                        opacity: focusedField === field.name ? 1 : 0,
                        scale: focusedField === field.name ? 1 : 0.95,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 blur-sm" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {errors[field.name] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors[field.name]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Gender Select */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 }}
                className="flex flex-col"
              >
                <label 
                  htmlFor="gender"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
                >
                  Gender
                  <span className="text-red-500">*</span>
                </label>
                
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("gender")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full p-3.5 rounded-xl border-2 transition-all duration-300
                    bg-white/60 dark:bg-gray-700/50 backdrop-blur-sm
                    text-gray-900 dark:text-gray-100
                    ${errors.gender 
                      ? 'border-red-400 dark:border-red-500' 
                      : focusedField === "gender"
                        ? 'border-sky-500 dark:border-sky-400 ring-4 ring-sky-500/10 shadow-lg shadow-sky-500/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-sky-300'
                    }
                    focus:outline-none cursor-pointer
                    appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.2em] bg-[right_0.7em_center] bg-no-repeat pr-10`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <AnimatePresence>
                  {errors.gender && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.gender}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>

          {/* Address Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center gap-3 mb-6 mt-8">
              <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Address Details
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addressFields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.05 }}
                  className="flex flex-col"
                >
                  <label 
                    htmlFor={field.name}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize"
                  >
                    {field.label}
                  </label>
                  
                  <input
                    id={field.name}
                    type="text"
                    name={field.name}
                    value={formData.address[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    placeholder={field.placeholder}
                    className={`w-full p-3.5 rounded-xl border-2 transition-all duration-300
                      bg-white/60 dark:bg-gray-700/50 backdrop-blur-sm
                      text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                      ${focusedField === field.name
                        ? 'border-sky-500 dark:border-sky-400 ring-4 ring-sky-500/10 shadow-lg shadow-sky-500/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-500'
                      }
                      focus:outline-none`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full relative overflow-hidden py-4 px-6 text-white font-semibold rounded-xl 
                         bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 
                         hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700
                         shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:scale-100 group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating Organization ID...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Organization ID</span>
                  </>
                )}
              </span>
              
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "linear",
                }}
              />
            </motion.button>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {orgId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 
                           dark:from-emerald-900/20 dark:to-teal-900/20 
                           border-2 border-emerald-200 dark:border-emerald-700/50
                           shadow-lg shadow-emerald-500/10"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                      Organization ID Created Successfully!
                    </h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                      Your unique organizational identifier has been generated
                    </p>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Generated ID</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 tracking-wider">
                          {orgId}
                        </code>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigator.clipboard.writeText(orgId);
                            Swal.fire({
                              toast: true,
                              position: 'top-end',
                              icon: 'success',
                              title: 'Copied to clipboard!',
                              showConfirmButton: false,
                              timer: 2000,
                              timerProgressBar: true,
                            });
                          }}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                                     dark:hover:bg-gray-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
