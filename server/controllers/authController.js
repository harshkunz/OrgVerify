const User = require("../models/User");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();


// User Signup
exports.register = async (req, res) => {
  try {
    const {
      orgIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      phone,
      email,
      password,
      role,
    } = req.body;

    console.log()

    const existingUser = await User.findOne({
      $or: [{ orgIdNumber }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error:
          existingUser.orgIdNumber === orgIdNumber
            ? `User with this ${orgIdNumber} Organization ID already registered.`
            : "Email already in use",
      });
    }

    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordStrength.message,
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      orgIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      phone,
      email,
      password,
      verificationCode,
      role: role || "none",
    });

    /*
    await sendVerificationEmail(email, verificationCode); 
    */
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for verification.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
    });
  }
};

const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!hasUppercase) {
    return { isValid: false, message: "Password must include at least one uppercase letter." };
  }
  if (!hasLowercase) {
    return { isValid: false, message: "Password must include at least one lowercase letter." };
  }
  if (!hasNumber) {
    return { isValid: false, message: "Password must include at least one number." };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: "Password must include at least one special character." };
  }

  return { isValid: true, message: "Password is strong." };
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();


    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        orgIdNumber: user.orgIdNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      error: "Email verification failed",
    });
  }
};


// User Login
exports.login = async (req, res) => {
  try {
    const { email, orgIdNumber, password, captchaToken  } = req.body;
    const identifier = email || orgIdNumber;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: "Email/Organization ID is required",
      });
    }

    if(!captchaToken){
      return res.status(400).json({
        success: false,
        error: "please, idenitify your self you're not robot   it's required",
      })
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password is required",
      });
    }

    const isHuman = await validateCaptcha(captchaToken);
    if (!isHuman) {
      return res.status(403).json({ message: "CAPTCHA validation failed" });
    }

    // Find user by email or Organization ID
    const user = await User.findOne({
      $or: [{ email }, { orgIdNumber }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Incorrect password, please try again or reset your password",
      });
    }

    if (!user.isVerified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = code;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

      await user.save();
      await sendVerificationEmail(user.email, code);

      return res.json({
        success: true,
        requiresVerification: true,
        message: "Email verification required. Code sent to your email.",
      });
    }
    

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        orgIdNumber: user.orgIdNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during login",
    });
  }
};

const validateCaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
  );
  return response.data.success;
}


// Google OAuth Login
exports.googleOAuthCallback = async (req, res) => {
  try {
    // Passport attaches user object to req.user after successful authentication
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Respond with token and user info
    // res.json({
    //   success: true,
    //   token,
    //   user: {
    //     id: user._id,
    //     email: user.email,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     role: user.role,
    //   },
    // });
    res.redirect(
      `${process.env.CLIENT_URL}/login?token=${token}`
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.status(500).json({ success: false, error: "Google login failed" });
  }
};

// Forgot password - send reset code.
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No account with that email exists",
      });
    }

    // Generate and save reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset code
    await sendPasswordResetEmail(user.email, resetCode);

    res.json({
      success: true,
      message: "Password reset code sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error sending reset code",
    });
  }
};

// Verify password reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Email and code are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User with ${email} not found`,
      });
    }

    // Check reset code
    if (user.passwordResetCode !== code) {
      return res.status(401).json({
        success: false,
        error: "Invalid reset code, please enter the code correct sent to your email",
      });
    }

    // Check if code expired
    if (user.passwordResetExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        error: "Reset code has expired",
      });
    }

    res.json({
      success: true,
      message: "Code verified. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    res.status(500).json({
      success: false,
      error: "Server error verifying reset code",
    });
  }
};

// Reset password after code verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }
    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Reset code is required",
      });
    }
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: "New password is required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User with ${email} not found`,

      });
    }

    // Verify reset code and expiration
    if (user.passwordResetCode !== code) {
      return res.status(401).json({
        success: false,
        error: "Invalid reset code, please enter the code correct sent to your email",
      });
    }

    if (user.passwordResetExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        error: "Reset code has expired",
      });
    }

    // Reset the password using the reusable method
    await user.resetPassword(newPassword);

    // Respond with success
    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error:
        "An error occurred while resetting the password. Please try again later.",
    });
  }
};


// Get Current User
exports.getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const User = require('../models/User');
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        orgIdNumber: user.orgIdNumber,
        isVerified: user.isVerified,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};