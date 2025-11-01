const Company = require("../models/Company");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Create a new company
exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      registrationNumber,
      email,
      phone,
      address,
      description,
      industry,
      size,
      website,
    } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({
      $or: [{ email }, { registrationNumber }],
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        error: "Company with this email or registration number already exists",
      });
    }

    // Create company
    const company = new Company({
      name,
      registrationNumber,
      email,
      phone,
      address: address || {},
      description,
      industry,
      size,
      website,
      admin: req.user._id,
    });

    await company.save();

    // Update user role to company_admin
    await User.findByIdAndUpdate(req.user._id, {
      role: "company_admin",
      company: company._id,
    });

    // Create notification for super admin
    const superAdmin = await User.findOne({ role: "super_admin" });
    if (superAdmin) {
      await Notification.create({
        recipient: superAdmin._id,
        recipientModel: "User",
        sender: req.user._id,
        senderModel: "User",
        company: company._id,
        title: "New Company Registration",
        message: `${name} has registered and is pending verification`,
        type: "info",
        category: "company",
        actionUrl: `/admin/companies/${company._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Company created successfully. Awaiting verification.",
      data: company,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all companies (with filters)
exports.getAllCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      isVerified,
      industry,
      search,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (isVerified !== undefined) query.isVerified = isVerified === "true";
    if (industry) query.industry = industry;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    // If user is company_admin, only show their company
    if (req.user.role === "company_admin") {
      query._id = req.user.company;
    }

    const companies = await Company.find(query)
      .populate("admin", "firstName lastName email phone")
      .populate("employees")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single company
exports.getCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate("admin", "firstName lastName email phone")
      .populate({
        path: "employees",
        populate: {
          path: "user",
          select: "firstName lastName email phone photo",
        },
      });

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
        error: "Unauthorized to view this company",
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const company = await Company.findById(id);

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
        error: "Unauthorized to update this company",
      });
    }

    // Don't allow changing verification status unless super_admin
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
      delete updates.isVerified;
      delete updates.verificationStatus;
      delete updates.verifiedBy;
    }

    Object.assign(company, updates);
    await company.save();

    res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Verify company (super_admin only)
exports.verifyCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized. Only admins can verify companies",
      });
    }

    const company = await Company.findById(id).populate("admin");

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    if (action === "approve") {
      company.isVerified = true;
      company.verificationStatus = "approved";
      company.verifiedAt = new Date();
      company.verifiedBy = req.user._id;

      // Create notification for company admin
      await Notification.create({
        recipient: company.admin._id,
        recipientModel: "User",
        sender: req.user._id,
        senderModel: "User",
        company: company._id,
        title: "Company Verified",
        message: `Your company "${company.name}" has been verified and approved!`,
        type: "success",
        category: "verification",
        actionUrl: `/company/dashboard`,
      });
    } else if (action === "reject") {
      company.verificationStatus = "rejected";
      company.verifiedBy = req.user._id;

      await Notification.create({
        recipient: company.admin._id,
        recipientModel: "User",
        sender: req.user._id,
        senderModel: "User",
        company: company._id,
        title: "Company Verification Rejected",
        message: `Your company "${company.name}" verification was rejected. Please contact support.`,
        type: "error",
        category: "verification",
      });
    }

    await company.save();

    res.json({
      success: true,
      message: `Company ${action === "approve" ? "verified" : "rejected"} successfully`,
      data: company,
    });
  } catch (error) {
    console.error("Error verifying company:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized. Only super admin can delete companies",
      });
    }

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found",
      });
    }

    // Delete all employees
    await Employee.deleteMany({ company: id });

    // Update user roles
    await User.updateMany(
      { company: id },
      { $unset: { company: 1 }, role: "user" }
    );

    await Company.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get company statistics
exports.getCompanyStats = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

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

    const stats = {
      totalEmployees: await Employee.countDocuments({
        company: id,
      }),
      activeEmployees: await Employee.countDocuments({
        company: id,
        status: "active",
      }),
      departments: await Employee.distinct("department", { company: id }),
      averageAttendance: 0, // Can be calculated from analytics
      recentHires: await Employee.countDocuments({
        company: id,
        hireDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

