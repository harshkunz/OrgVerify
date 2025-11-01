const axios = require("axios");

// Organization ID server URL (can be configured via environment variable)
const ORG_ID_SERVER_URL = process.env.ORG_ID_SERVER_URL || "http://localhost:6000";

/**
 * Verify Organization ID with the Organization ID server
 * @param {string} orgIdNumber - The 16-digit Organization ID number
 * @returns {Promise<Object>} - Organization ID data or null if not found
 */
exports.verifyOrgId = async (orgIdNumber) => {
  try {
    if (!orgIdNumber || orgIdNumber.length !== 16) {
      throw new Error("Invalid Organization ID number. Must be 16 digits.");
    }

    const response = await axios.get(`${ORG_ID_SERVER_URL}/api/org-ids/${orgIdNumber}`, {
      timeout: 10000, // 10 second timeout
    });

    if (response.data.success && response.data.orgID) {
      return {
        success: true,
        data: response.data.orgID,
      };
    }

    return {
      success: false,
      error: "Organization ID not found",
    };
  } catch (error) {
    console.error("Organization ID verification error:", error.message);
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || "Failed to verify Organization ID",
      };
    }
    return {
      success: false,
      error: "Organization ID server unavailable",
    };
  }
};

/**
 * Verify identity with Organization ID and additional details
 * @param {string} orgIdNumber - The 16-digit Organization ID number
 * @param {Object} identityData - Identity details (firstName, middleName, lastName, phone)
 * @returns {Promise<Object>} - Verification result
 */
exports.verifyIdentity = async (orgIdNumber, identityData) => {
  try {
    if (!orgIdNumber || orgIdNumber.length !== 16) {
      throw new Error("Invalid Organization ID number. Must be 16 digits.");
    }

    // First verify by orgIdNumber
    const verifyResponse = await axios.get(`${ORG_ID_SERVER_URL}/api/org-ids/${orgIdNumber}`, {
      timeout: 10000,
    });

    if (!verifyResponse.data.success || !verifyResponse.data.orgID) {
      return {
        success: false,
        error: "Organization ID not found",
      };
    }

    // Then verify by name if provided
    if (identityData.firstName && identityData.lastName) {
      const nameResponse = await axios.get(`${ORG_ID_SERVER_URL}/api/org-ids/search/name`, {
        params: {
          firstName: identityData.firstName,
          middleName: identityData.middleName,
          lastName: identityData.lastName,
          gender: identityData.gender,
        },
        timeout: 10000,
      });

      if (nameResponse.data.orgIdNumber !== orgIdNumber) {
        return {
          success: false,
          error: "Identity verification failed - name mismatch",
        };
      }
    }

    const response = verifyResponse;

    if (response.data.success) {
      return {
        success: true,
        data: response.data.orgID || response.data,
      };
    }

    return {
      success: false,
      error: "Identity verification failed",
    };
  } catch (error) {
    console.error("Identity verification error:", error.message);
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || "Identity verification failed",
      };
    }
    return {
      success: false,
      error: "Organization ID server unavailable",
    };
  }
};

/**
 * Auto-fill user data from Organization ID
 * @param {string} orgIdNumber - The 16-digit Organization ID number
 * @returns {Promise<Object>} - User data object
 */
exports.getOrgIdData = async (orgIdNumber) => {
  const verification = await exports.verifyOrgId(orgIdNumber);
  
  if (!verification.success) {
    return verification;
  }

  const orgIdData = verification.data;
  
  return {
    success: true,
    data: {
      firstName: orgIdData.firstName,
      middleName: orgIdData.middleName,
      lastName: orgIdData.lastName,
      gender: orgIdData.gender,
      phone: orgIdData.phone_no,
      dateOfBirth: orgIdData.dateOfBirth,
      address: orgIdData.address || {},
      photo: orgIdData.photo,
    },
  };
};

