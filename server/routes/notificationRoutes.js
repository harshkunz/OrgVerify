const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} = require("../controllers/notificationController");
const { authenticateUser, roleMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticateUser);

// Get all notifications
router.get("/", getNotifications);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Mark all notifications as read
router.put("/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

// Create notification (for admins/company admins)
router.post(
  "/",
  roleMiddleware(["super_admin", "admin", "company_admin"]),
  createNotification
);

module.exports = router;

