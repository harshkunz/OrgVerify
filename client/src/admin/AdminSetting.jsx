import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminSettings = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:7000";

  const [admin, setAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Dummy data for fallback
  const dummyAdmin = {
    _id: "6932bea1958f7208a29b8c3a",
    firstName: "John",
    lastName: "Lee",
    email: "admin$xyz@example.com",
    role: "admin",
    isAvailable: true,
    gender: "male",
    photo: "https://cdn-icons-png.flaticon.com/512/16683/16683419.png",
    createdAt: "2025-12-05T11:14:41.578+00:00",
    updatedAt: "2025-12-05T11:14:41.578+00:00",
    lastAssigned: "2025-12-05T11:14:41.574+00:00",
  };

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${backendUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(response.data.admin);
        setFormData(response.data.admin);
        setPhotoPreview(response.data.admin.photo);
      } catch (err) {
        // Fallback to dummy data if fetch fails
        setAdmin(dummyAdmin);
        setFormData(dummyAdmin);
        setPhotoPreview(dummyAdmin.photo);
        //Swal.fire("Warning", "Failed to load profile. Using dummy data.", "warning");     //Swal Fire
      }
    };
    fetchProfile();
  }, [backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        Swal.fire("Error", "Please select an image file", "error");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Error", "Image size must be less than 2MB", "error");
        return;
      }
      setFormData((prev) => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      const response = await axios.put(`${backendUrl}/api/admin/profile`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Swal.fire("Success", "Profile updated successfully", "success");
        setAdmin(formData);
        setEditMode(false);
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="flex justify-center items-center h-180 bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-18">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-md px-6 py-6">
        
        {/* Profile Photo */}
        <div className="flex justify-center mb-4">
          <img
            src={photoPreview || "https://via.placeholder.com/120"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border shadow"
          />
        </div>

        {/* Edit / Save Buttons */}
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 mb-5 w-2/8 mx-auto py-2.5 px-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3 justify-center mb-5">
            <button
              onClick={handleSave}
              disabled={loading}
              className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-3xl shadow-md hover:shadow-xl text-xs"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setFormData(admin);
                setPhotoPreview(admin.photo);
              }}
              className="py-2.5 px-6 bg-red-400 hover:bg-red-500 text-white rounded-3xl text-xs shadow-md"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "firstName", label: "First Name" },
            { name: "lastName", label: "Last Name" },
            { name: "email", label: "Email" },
            { name: "role", label: "Role" },
            { name: "photo", label: "Photo" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {field.label}
              </label>
              {field.name === "photo" ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={!editMode}
                  className={`px-3 mt-1 py-2.5 rounded-full text-xs bg-gray-200 dark:bg-slate-700 outline-none
                  ${!editMode ? "opacity-50 cursor-default" : ""}`}
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  disabled={!editMode}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className={`px-3 mt-1 py-2.5 rounded-full text-xs bg-gray-200 dark:bg-slate-700 outline-none
                  ${!editMode ? "opacity-50 cursor-default" : ""}`}
                />
              )}
            </div>
          ))}

          {/* Gender Dropdown */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              disabled={!editMode}
              onChange={handleChange}
              className={`w-full mt-1 px-3 py-2.5 text-xs rounded-full bg-gray-200 dark:bg-slate-700 outline-none appearance-none
              ${!editMode ? "opacity-50 cursor-default" : ""}`}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Available Toggle */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Available</label>
            <div className="flex items-center gap-3 ml-4 mt-2">
              <input
                type="checkbox"
                name="isAvailable"
                disabled={!editMode}
                checked={formData.isAvailable}
                onChange={() =>
                  setFormData((p) => ({ ...p, isAvailable: !p.isAvailable }))
                }
                className="w-4 h-4"
              />
              <span className="text-xs text-gray-700">{formData.isAvailable ? "True" : "False"}</span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-1 text-xs mt-2 ml-4">
            <p><strong>Created:</strong> {new Date(admin.createdAt).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(admin.updatedAt).toLocaleString()}</p>
            <p><strong>Last Assigned:</strong> {new Date(admin.lastAssigned).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
