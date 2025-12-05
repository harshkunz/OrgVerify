import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const orgIdUrl = import.meta.env.VITEORGIDROUTE || 'http://localhost:7000';

export default function CreateOrgIDPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    phoneno: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    photo: '',
    email: '',
    role: '',
    createdAt: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'country', 'zipCode'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phoneno.trim()) newErrors.phoneno = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }
    setLoading(true);
    try {
      const data = await axios.post(`${orgIdUrl}/id/create`, formData);
      if (data.data.success) {
        setOrgId(data.data.orgID.orgIdNumber);
        Swal.fire({
          title: 'Success!',
          html: `<p style="font-size: 14px; color: #64748b; margin-bottom: 12px">Your Organization ID has been created</p>
                 <div style="background: linear-gradient(135deg, #0ea5e9 0, #3b82f6 100); padding: 16px; border-radius: 12px; margin-top: 16px">
                   <p style="color: white; font-size: 12px; margin: 0 0 8px 0; opacity: 0.9">Generated ID</p>
                   <p style="color: white; font-size: 24px; font-weight: 700; margin: 0; font-family: Courier New, monospace; letter-spacing: 2px">${data.data.orgID.orgIdNumber}</p>
                 </div>`,
          icon: 'success',
          confirmButtonColor: '#0ea5e9',
          confirmButtonText: 'Done'
        });
      } else {
        Swal.fire('Error', data.data.message, 'error');
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || 'Server error. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'John' },
    { name: 'middleName', label: 'Middle Name', type: 'text', placeholder: 'Michael' },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Doe' },
    { name: 'phoneno', label: 'Phone Number', type: 'tel', required: true, placeholder: '251 912 345 678' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter Email' },
    { name: 'role', label: 'Role', type: 'text', required: true, placeholder: 'Enter Role' },
    { name: 'photo', label: 'Photo URL', type: 'text', placeholder: 'Enter Photo URL' }
  ];

  const addressFields = [
    { name: 'street', label: 'Street Address', placeholder: '123 Main Street' },
    { name: 'city', label: 'City', placeholder: 'Addis Ababa' },
    { name: 'state', label: 'State/Region', placeholder: 'Addis Ababa' },
    { name: 'country', label: 'Country', placeholder: 'Ethiopia' },
    { name: 'zipCode', label: 'Zip Code', placeholder: '1000' }
  ];

  return (
  <div className="flex items-center justify-center pt-2 text-xs">
    <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-md px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
            <input
              type="text"
              name="firstName"
              placeholder="first name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
            />
          </div>
          {errors.firstName && (
            <p className="text-[11px] text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
            <input
              type="text"
              name="lastName"
              placeholder="last name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
            />
          </div>
          {errors.lastName && (
            <p className="text-[11px] text-red-500">{errors.lastName}</p>
          )}
        </div>

        {/* Email – full width */}
        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
            
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {errors.gender && (
            <p className="text-[11px] text-red-500">{errors.gender}</p>
          )}
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
            
            <input
              type="text"
              name="role"
              placeholder="Select"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
            />
          </div>
          {errors.role && (
            <p className="text-[11px] text-red-500">{errors.role}</p>
          )}
        </div>

        {/* Phone – full width */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
           
            <input
              type="tel"
              name="phoneno"
              placeholder="+xxx xxx xxx"
              value={formData.phoneno}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
            />
          </div>
          {errors.phoneno && (
            <p className="text-[11px] text-red-500">{errors.phoneno}</p>
          )}
        </div>

        {/* DOB */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
            
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50"
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-[11px] text-red-500">{errors.dateOfBirth}</p>
          )}
        </div>

      </div>

      {/* Address block (simple, below main grid) */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Address (optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addressFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">
                {field.label}
              </label>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2.5 text-xs">
                <input
                  type="text"
                  name={field.name}
                  value={formData.address[field.name]}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-2/6 mx-auto py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>

      {/* Simple success footer */}
      <AnimatePresence>
        {orgId && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 text-[12px] text-center text-emerald-600"
          >
            Generated Org ID: <span className="font-mono">{orgId}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  </div>
);

}
