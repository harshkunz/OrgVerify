import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiSave, FiCamera } from "react-icons/fi";
import axios from "axios";

const base_URL = import.meta.env.VITE_BACKEND_URL
const authurl = import.meta.env.VITE_AUTH_ROUTE;
const UserProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    photo: null,
  });
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${authurl}/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
        const timer = setTimeout(() => {
          navigate("/login");
        }, 2000);
        return () => clearTimeout(timer);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    console.log("Current User:", currentUser); // Add this
    if (currentUser) {
      setFormData({
        phone: currentUser.phone || "",
        photo: null,
      });
      setPreview(currentUser.photo || "");
      console.log("Photo URL:", currentUser.photo); // Add this
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreview(URL.createObjectURL(file));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("phone", formData.phone);
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo);
      }

      console.log("Sending:", formDataToSend); // Add this

      const { data } = await axios.put(
        `${authurl}/profile`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Response:", data);

      setFormData({
        phone: data.phone || "",
        photo: data.photo || null,
      });
      setPreview(data.photo || "");

      setSuccess("Profile updated successfully!");
      // You might want to update currentUser in parent component here
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Profile Settings
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Profile Photo - Editable */}
          <div className="col-span-2 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                {preview ? (
                  <img
                    src={
                      preview.startsWith("blob:") || preview.startsWith("http")
                        ? preview
                        : `${base_URL}${preview}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-300">
                    {currentUser?.firstName?.charAt(0)}
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FiCamera size={18} />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click camera icon to change photo
            </p>
          </div>

          {/* Read-only Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              First Name
            </label>
            <div className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {currentUser?.firstName || "N/A"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Name
            </label>
            <div className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {currentUser?.lastName || "N/A"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Email
            </label>
            <div className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <FiMail className="mr-2" />
              {currentUser?.email || "N/A"}
            </div>
          </div>

          {/* Editable Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
