const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern", "freelance"],
      default: "full-time",
    },
    hireDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    terminationDate: {
      type: Date,
      default: null,
    },
    salary: {
      type: Number,
      default: null,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    directReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave", "terminated", "suspended"],
      default: "active",
    },
    workLocation: {
      type: String,
      enum: ["office", "remote", "hybrid"],
      default: "office",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
      },
    ],
    performanceRatings: [
      {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        reviewDate: Date,
        reviewPeriod: String,
        comments: String,
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
      },
    ],
    attendance: {
      totalDays: {
        type: Number,
        default: 0,
      },
      presentDays: {
        type: Number,
        default: 0,
      },
      absentDays: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
// Note: user and employeeId have unique: true, so skip duplicate indexes
employeeSchema.index({ company: 1, employeeId: 1 });
employeeSchema.index({ company: 1, status: 1 });
employeeSchema.index({ manager: 1 });

// Virtual for employment duration
employeeSchema.virtual("employmentDuration").get(function () {
  if (this.terminationDate) {
    return Math.floor(
      (this.terminationDate - this.hireDate) / (1000 * 60 * 60 * 24)
    );
  }
  return Math.floor((Date.now() - this.hireDate) / (1000 * 60 * 60 * 24));
});

// Virtual for attendance rate
employeeSchema.virtual("attendanceRate").get(function () {
  if (this.attendance.totalDays === 0) return 0;
  return (
    (this.attendance.presentDays / this.attendance.totalDays) * 100
  ).toFixed(2);
});

// Pre-save middleware to update company employee count
employeeSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("status")) {
    const Company = mongoose.model("Company");
    const company = await Company.findById(this.company);
    if (company) {
      await company.updateEmployeeCount();
    }
  }
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;

