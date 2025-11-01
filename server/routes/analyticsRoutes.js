const express = require("express");
const router = express.Router();
const {
  getCompanyAnalytics,
  getDashboardData,
  getAllCompaniesAnalytics,
} = require("../controllers/analyticsController");
const { authenticateUser, roleMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticateUser);

// Get dashboard data
router.get("/dashboard", getDashboardData);

// Get analytics for a specific company
router.get("/company/:companyId", getCompanyAnalytics);

// Get analytics for all companies (super_admin only)
router.get(
  "/all",
  roleMiddleware(["super_admin", "admin"]),
  getAllCompaniesAnalytics
);

module.exports = router;

