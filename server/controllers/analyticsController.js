const Analytics = require("../models/Analytics");
const Employee = require("../models/Employee");
const Company = require("../models/Company");

// Get analytics for a company
exports.getCompanyAnalytics = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { period = "daily", startDate, endDate } = req.query;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "super_admin" &&
      req.user.role !== "admin" &&
      (req.user.role !== "company_admin" || company._id.toString() !== req.user.company?.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const query = { company: companyId, period };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Generate analytics dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const companyId = req.user.company || req.query.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "super_admin" &&
      req.user.role !== "admin" &&
      (req.user.role !== "company_admin" || company._id.toString() !== req.user.company?.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const employees = await Employee.find({ company: companyId });
    const activeEmployees = employees.filter((e) => e.status === "active");

    // Calculate statistics
    const stats = {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      newHiresThisMonth: employees.filter((e) => {
        const hireDate = new Date(e.hireDate);
        const now = new Date();
        return (
          hireDate.getMonth() === now.getMonth() &&
          hireDate.getFullYear() === now.getFullYear()
        );
      }).length,
      terminationsThisMonth: employees.filter((e) => {
        if (!e.terminationDate) return false;
        const termDate = new Date(e.terminationDate);
        const now = new Date();
        return (
          termDate.getMonth() === now.getMonth() &&
          termDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };

    // Department breakdown
    const departmentStats = {};
    activeEmployees.forEach((emp) => {
      const dept = emp.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          count: 0,
          totalAttendance: 0,
          totalPerformance: 0,
          performanceCount: 0,
        };
      }
      departmentStats[dept].count += 1;
      departmentStats[dept].totalAttendance += parseFloat(emp.attendanceRate || 0);
      if (emp.performanceRatings && emp.performanceRatings.length > 0) {
        const avgRating =
          emp.performanceRatings.reduce((sum, r) => sum + r.rating, 0) /
          emp.performanceRatings.length;
        departmentStats[dept].totalPerformance += avgRating;
        departmentStats[dept].performanceCount += 1;
      }
    });

    const departmentBreakdown = Object.keys(departmentStats).map((dept) => ({
      department: dept,
      employeeCount: departmentStats[dept].count,
      averageAttendance: departmentStats[dept].count > 0
        ? (departmentStats[dept].totalAttendance / departmentStats[dept].count).toFixed(2)
        : 0,
      averagePerformance: departmentStats[dept].performanceCount > 0
        ? (departmentStats[dept].totalPerformance / departmentStats[dept].performanceCount).toFixed(2)
        : 0,
    }));

    // Employment type breakdown
    const employmentTypeBreakdown = {};
    activeEmployees.forEach((emp) => {
      const type = emp.employmentType || "full-time";
      employmentTypeBreakdown[type] = (employmentTypeBreakdown[type] || 0) + 1;
    });

    // Performance distribution
    const performanceDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    activeEmployees.forEach((emp) => {
      if (emp.performanceRatings && emp.performanceRatings.length > 0) {
        const avgRating = Math.round(
          emp.performanceRatings.reduce((sum, r) => sum + r.rating, 0) /
            emp.performanceRatings.length
        );
        performanceDistribution[avgRating] =
          (performanceDistribution[avgRating] || 0) + 1;
      }
    });

    // Generate analytics record
    const analyticsData = await Analytics.generateCompanyAnalytics(
      companyId,
      "daily"
    );

    res.json({
      success: true,
      data: {
        stats,
        departmentBreakdown,
        employmentTypeBreakdown,
        performanceDistribution,
        overallAttendance: activeEmployees.length > 0
          ? (
              activeEmployees.reduce((sum, emp) => {
                return sum + parseFloat(emp.attendanceRate || 0);
              }, 0) / activeEmployees.length
            ).toFixed(2)
          : 0,
        overallPerformance: activeEmployees.filter(
          (emp) => emp.performanceRatings && emp.performanceRatings.length > 0
        ).length > 0
          ? (
              activeEmployees
                .filter(
                  (emp) =>
                    emp.performanceRatings && emp.performanceRatings.length > 0
                )
                .reduce((sum, emp) => {
                  const avgRating =
                    emp.performanceRatings.reduce((s, r) => s + r.rating, 0) /
                    emp.performanceRatings.length;
                  return sum + avgRating;
                }, 0) /
              activeEmployees.filter(
                (emp) =>
                  emp.performanceRatings && emp.performanceRatings.length > 0
              ).length
            ).toFixed(2)
          : 0,
        latestAnalytics: analyticsData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Generate analytics for multiple companies (super admin)
exports.getAllCompaniesAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized. Only admins can view all companies analytics",
      });
    }

    const companies = await Company.find({ status: "active" });
    const analytics = [];

    for (const company of companies) {
      const employees = await Employee.find({ company: company._id });
      const activeEmployees = employees.filter((e) => e.status === "active");

      analytics.push({
        company: {
          _id: company._id,
          name: company.name,
          industry: company.industry,
        },
        stats: {
          totalEmployees: employees.length,
          activeEmployees: activeEmployees.length,
          verified: company.isVerified,
        },
        attendance: activeEmployees.length > 0
          ? (
              activeEmployees.reduce((sum, emp) => {
                return sum + parseFloat(emp.attendanceRate || 0);
              }, 0) / activeEmployees.length
            ).toFixed(2)
          : 0,
      });
    }

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching all companies analytics:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

