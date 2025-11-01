const Notification = require("../models/Notification");
const User = require("../models/User");
const Employee = require("../models/Employee");

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, category, type } = req.query;

    let recipientId = req.user._id;
    let recipientModel = "User";

    // If user is an employee, get employee record
    if (req.user.role === "employee" && req.user.employeeProfile) {
      const employee = await Employee.findById(req.user.employeeProfile);
      if (employee) {
        recipientId = employee._id;
        recipientModel = "Employee";
      }
    }

    const query = {
      recipient: recipientId,
      recipientModel,
    };

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    // Also include notifications for the user's company
    if (req.user.company) {
      query.$or = [
        { recipient: recipientId, recipientModel },
        { company: req.user.company, recipientModel: "Company" },
      ];
    }

    const notifications = await Notification.find(query)
      .populate("sender", "firstName lastName email photo")
      .populate("company", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    let recipientId = req.user._id;
    let recipientModel = "User";

    if (req.user.role === "employee" && req.user.employeeProfile) {
      const employee = await Employee.findById(req.user.employeeProfile);
      if (employee) {
        recipientId = employee._id;
        recipientModel = "Employee";
      }
    }

    await Notification.updateMany(
      {
        recipient: recipientId,
        recipientModel,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    await Notification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create notification (for internal use)
exports.createNotification = async (req, res) => {
  try {
    const {
      recipientId,
      recipientModel = "User",
      title,
      message,
      type = "info",
      category = "other",
      actionUrl,
      companyId,
    } = req.body;

    const notification = new Notification({
      recipient: recipientId,
      recipientModel,
      sender: req.user._id,
      senderModel: "User",
      company: companyId || req.user.company || null,
      title,
      message,
      type,
      category,
      actionUrl,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

