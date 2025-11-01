const express = require("express");
const router = express.Router();
const {
  createCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
  verifyCompany,
  deleteCompany,
  getCompanyStats,
} = require("../controllers/companyController");
const { authenticateUser, roleMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticateUser);

// Create company (any authenticated user can create)
router.post("/", createCompany);

// Get all companies (with filters)
router.get("/", getAllCompanies);

// Get company statistics
router.get("/stats/:id", getCompanyStats);

// Get single company
router.get("/:id", getCompany);

// Update company (company_admin or super_admin)
router.put(
  "/:id",
  roleMiddleware(["super_admin", "admin", "company_admin"]),
  updateCompany
);

// Verify company (super_admin or admin only)
router.post(
  "/:id/verify",
  roleMiddleware(["super_admin", "admin"]),
  verifyCompany
);

// Delete company (super_admin only)
router.delete(
  "/:id",
  roleMiddleware(["super_admin"]),
  deleteCompany
);

module.exports = router;

