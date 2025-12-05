const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      region: String,
      country: {
        type: String,
        default: "Ethiopia",
      },
      zipCode: String,
    },
    description: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      enum: [
        "Technology",
        "Finance",
        "Healthcare",
        "Education",
        "Manufacturing",
        "Retail",
        "Services",
        "Government",
        "NGO",
        "Other",
      ],
      required: true,
    },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      required: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    employeeCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "basic", "premium", "enterprise"],
      default: "free",
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
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

// Indexes for better query performance
// Note: registrationNumber and email have unique: true, so skip duplicate indexes
companySchema.index({ admin: 1 });
companySchema.index({ status: 1 });
companySchema.index({ isVerified: 1 });

// Virtual for active employees count
companySchema.virtual("activeEmployeesCount").get(function () {
  return this.employees?.filter((emp) => emp.status === "active").length || 0;
});

// Method to update employee count
companySchema.methods.updateEmployeeCount = async function () {
  const Employee = mongoose.model("Employee");
  this.employeeCount = await Employee.countDocuments({
    company: this._id,
    status: "active",
  });
  await this.save();
};

const Company = mongoose.model("Company", companySchema);

module.exports = Company;

