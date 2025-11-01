const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: [
        "employee_count",
        "attendance",
        "performance",
        "department",
        "hiring",
        "turnover",
        "custom",
      ],
      required: true,
    },
    metrics: {
      // Employee metrics
      totalEmployees: Number,
      activeEmployees: Number,
      newHires: Number,
      terminations: Number,
      
      // Attendance metrics
      attendanceRate: Number,
      presentCount: Number,
      absentCount: Number,
      leaveCount: Number,
      
      // Performance metrics
      averagePerformanceRating: Number,
      topPerformers: Number,
      underPerformers: Number,
      
      // Department breakdown
      departmentBreakdown: {
        type: Map,
        of: {
          count: Number,
          attendanceRate: Number,
          avgPerformance: Number,
        },
        default: {},
      },
      
      // Custom metrics
      customData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      default: "daily",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
analyticsSchema.index({ company: 1, date: -1 });
analyticsSchema.index({ company: 1, type: 1, date: -1 });
analyticsSchema.index({ date: -1 });

// Static method to generate analytics for a company
analyticsSchema.statics.generateCompanyAnalytics = async function (
  companyId,
  period = "daily"
) {
  const Employee = mongoose.model("Employee");
  const Company = mongoose.model("Company");
  
  const company = await Company.findById(companyId).populate("employees");
  if (!company) throw new Error("Company not found");

  const employees = await Employee.find({ company: companyId });
  const activeEmployees = employees.filter((e) => e.status === "active");

  const analytics = {
    company: companyId,
    type: "employee_count",
    period,
    metrics: {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      newHires: employees.filter(
        (e) =>
          new Date(e.hireDate).toDateString() === new Date().toDateString()
      ).length,
      terminations: employees.filter((e) => e.status === "terminated").length,
      attendanceRate:
        activeEmployees.length > 0
          ? activeEmployees.reduce((sum, emp) => {
              const rate = parseFloat(emp.attendanceRate || 0);
              return sum + rate;
            }, 0) / activeEmployees.length
          : 0,
      presentCount: activeEmployees.reduce(
        (sum, emp) => sum + (emp.attendance?.presentDays || 0),
        0
      ),
      absentCount: activeEmployees.reduce(
        (sum, emp) => sum + (emp.attendance?.absentDays || 0),
        0
      ),
      averagePerformanceRating:
        activeEmployees.length > 0
          ? activeEmployees.reduce((sum, emp) => {
              const ratings = emp.performanceRatings || [];
              const avg =
                ratings.length > 0
                  ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
                  : 0;
              return sum + avg;
            }, 0) / activeEmployees.length
          : 0,
    },
    departmentBreakdown: {},
  };

  // Department breakdown
  const departments = [...new Set(activeEmployees.map((e) => e.department))];
  departments.forEach((dept) => {
    const deptEmployees = activeEmployees.filter((e) => e.department === dept);
    const deptAttendanceRate =
      deptEmployees.length > 0
        ? deptEmployees.reduce((sum, emp) => {
            const rate = parseFloat(emp.attendanceRate || 0);
            return sum + rate;
          }, 0) / deptEmployees.length
        : 0;

    analytics.metrics.departmentBreakdown[dept] = {
      count: deptEmployees.length,
      attendanceRate: deptAttendanceRate,
      avgPerformance: 0, // Can be calculated similarly
    };
  });

  return await this.create(analytics);
};

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;

