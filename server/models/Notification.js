const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["User", "Admin", "Employee"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
      default: null,
    },
    senderModel: {
      type: String,
      enum: ["User", "Admin", "Employee", "System"],
      default: "System",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "success",
        "error",
        "warning",
        "info",
        "company_verification",
        "employee_added",
        "employee_removed",
        "performance_review",
        "attendance",
        "system",
        "chat",
      ],
      default: "info",
    },
    category: {
      type: String,
      enum: [
        "company",
        "employee",
        "attendance",
        "performance",
        "system",
        "chat",
        "verification",
        "other",
      ],
      default: "other",
    },
    actionUrl: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ company: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, category: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

module.exports = mongoose.model("Notification", notificationSchema);
