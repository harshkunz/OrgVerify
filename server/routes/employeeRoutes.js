const express = require("express");
const router = express.Router();
const {
  addEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  removeEmployee,
  updateAttendance,
  addPerformanceRating,
} = require("../controllers/employeeController");
const { authenticateUser, roleMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticateUser);

// Add employee (company_admin, admin, super_admin)
router.post(
  "/",
  roleMiddleware(["super_admin", "admin", "company_admin"]),
  addEmployee
);

// Get all employees (with filters)
router.get("/", getAllEmployees);

// Get single employee
router.get("/:id", getEmployee);

// Update employee
router.put("/:id", updateEmployee);

// Remove/terminate employee (company_admin, admin, super_admin)
router.delete(
  "/:id",
  roleMiddleware(["super_admin", "admin", "company_admin"]),
  removeEmployee
);

// Update attendance (company_admin, admin, super_admin)
router.post(
  "/:id/attendance",
  roleMiddleware(["super_admin", "admin", "company_admin"]),
  updateAttendance
);

// Add performance rating (company_admin, admin, super_admin)
router.post(
  "/:id/performance",
  roleMiddleware(["super_admin", "admin", "company_admin"]),
  addPerformanceRating
);

module.exports = router;

