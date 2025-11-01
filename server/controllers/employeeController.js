const Employee = require("../models/Employee");
const User = require("../models/User");
const Company = require("../models/Company");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/email");

// Generate unique employee ID
const generateEmployeeId = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");

  const prefix = company.name.substring(0, 3).toUpperCase();
  const count = await Employee.countDocuments({ company: companyId });
  const employeeId = `${prefix}-${String(count + 1).padStart(4, "0")}`;

  return employeeId;
};


// Add employee to company
exports.addEmployee = async (req, res) => {
  try {
    const {
      userId,
      department,
      position,
      jobTitle,
      employmentType,
      salary,
      managerId,
      workLocation,
      skills,
      emergencyContact,
    } = req.body;

    const companyId = req.user.company || req.body.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    // Verify company exists and user has permission
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
      (req.user.role !== "company_admin" || company.admin.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to add employees",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user is already an employee
    const existingEmployee = await Employee.findOne({ user: userId });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        error: "User is already an employee",
      });
    }

    // Generate employee ID
    const employeeId = await generateEmployeeId(companyId);

    // Create employee record
    const employee = new Employee({
      user: userId,
      company: companyId,
      employeeId,
      department,
      position,
      jobTitle: jobTitle || position,
      employmentType: employmentType || "full-time",
      salary: salary || null,
      manager: managerId || null,
      workLocation: workLocation || "office",
      skills: skills || [],
      emergencyContact: emergencyContact || {},
    });

    await employee.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      role: "employee",
      company: companyId,
      employeeProfile: employee._id,
    });

    // Update company employee count
    await company.updateEmployeeCount();

    // Create notification for employee
    await Notification.create({
      recipient: userId,
      recipientModel: "User",
      sender: req.user._id,
      senderModel: "User",
      company: companyId,
      title: "Welcome to the Team!",
      message: `You have been added as an employee at ${company.name}`,
      type: "success",
      category: "employee",
      actionUrl: `/employee/profile`,
    });

    // Send email notification
    try {
      await sendEmail(
        user.email,
        "Welcome to the Team!",
        `You have been successfully added as an employee at ${company.name}. Your employee ID is ${employeeId}.`
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    const populatedEmployee = await Employee.findById(employee._id)
      .populate("user", "firstName lastName email phone photo")
      .populate("manager", "user")
      .populate("company", "name");

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      data: populatedEmployee,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Get all employees (with filters)
exports.getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      companyId,
      department,
      status,
      search,
    } = req.query;

    const query = {};

    // If user is company_admin or employee, filter by their company
    if (req.user.role === "company_admin" || req.user.role === "employee") {
      query.company = req.user.company;
    } else if (companyId && (req.user.role === "super_admin" || req.user.role === "admin")) {
      query.company = companyId;
    }

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query)
      .populate("user", "firstName lastName email phone photo orgIdNumber")
      .populate("company", "name")
      .populate("manager", "user")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Get single employee
exports.getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate("user", "firstName lastName email phone photo orgIdNumber")
      .populate("company", "name industry")
      .populate("manager", "user employeeId")
      .populate("directReports", "user employeeId");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "super_admin" &&
      req.user.role !== "admin" &&
      (req.user.role !== "company_admin" &&
        employee.company.toString() !== req.user.company?.toString()) &&
      (req.user.role !== "employee" || employee.user._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to view this employee",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "super_admin" &&
      req.user.role !== "admin" &&
      (req.user.role !== "company_admin" &&
        employee.company.toString() !== req.user.company?.toString()) &&
      (req.user.role !== "employee" || employee.user._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to update this employee",
      });
    }

    // Employees can only update certain fields
    if (req.user.role === "employee") {
      const allowedUpdates = ["emergencyContact"];
      Object.keys(updates).forEach((key) => {
        if (!allowedUpdates.includes(key)) {
          delete updates[key];
        }
      });
    }

    Object.assign(employee, updates);
    await employee.save();

    const populatedEmployee = await Employee.findById(employee._id)
      .populate("user", "firstName lastName email phone photo")
      .populate("company", "name");

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: populatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// terminate employee
exports.removeEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { terminationDate, reason } = req.body;

    const employee = await Employee.findById(id).populate("company");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "super_admin" &&
      req.user.role !== "admin" &&
      (req.user.role !== "company_admin" ||
        employee.company.admin.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to remove employees",
      });
    }

    employee.status = "terminated";
    employee.terminationDate = terminationDate || new Date();
    await employee.save();

    // Update user role
    await User.findByIdAndUpdate(employee.user, {
      $unset: { company: 1, employeeProfile: 1 },
      role: "user",
    });

    // Update company employee count
    await employee.company.updateEmployeeCount();

    // Create notification
    await Notification.create({
      recipient: employee.user,
      recipientModel: "User",
      sender: req.user._id,
      senderModel: "User",
      company: employee.company._id,
      title: "Employment Terminated",
      message: `Your employment at ${employee.company.name} has been terminated. ${reason ? `Reason: ${reason}` : ""}`,
      type: "error",
      category: "employee",
    });

    res.json({
      success: true,
      message: "Employee removed successfully",
    });
  } catch (error) {
    console.error("Error removing employee:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date } = req.body; // status: 'present', 'absent', 'leave'

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Update attendance
    employee.attendance.totalDays += 1;
    if (status === "present") {
      employee.attendance.presentDays += 1;
    } else if (status === "absent") {
      employee.attendance.absentDays += 1;
    }
    employee.attendance.lastUpdated = date || new Date();

    await employee.save();

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: {
        attendance: employee.attendance,
        attendanceRate: employee.attendanceRate,
      },
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Add performance rating
exports.addPerformanceRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewPeriod, comments } = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "super_admin" &&
      req.user.role !== "admin" &&
      req.user.role !== "company_admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to add performance ratings",
      });
    }

    employee.performanceRatings.push({
      rating,
      reviewDate: new Date(),
      reviewPeriod: reviewPeriod || "quarterly",
      comments,
      reviewedBy: req.user.employeeProfile || req.user._id,
    });

    await employee.save();

    // Create notification
    await Notification.create({
      recipient: employee.user,
      recipientModel: "User",
      sender: req.user._id,
      senderModel: "User",
      company: employee.company,
      title: "Performance Review",
      message: `You have received a performance rating of ${rating}/5 for ${reviewPeriod}`,
      type: "info",
      category: "performance",
      actionUrl: `/employee/profile#performance`,
    });

    res.json({
      success: true,
      message: "Performance rating added successfully",
      data: employee.performanceRatings[employee.performanceRatings.length - 1],
    });
  } catch (error) {
    console.error("Error adding performance rating:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

