const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  orgIdNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{16}$/.test(v); // Matches exactly 16 digits
      },
      message: (props) => `${props.value} is not a valid 16-digit Organization ID!`,
    },
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{1,15}$/.test(v); // Matches 1 to 15 digits
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Matches valid email format
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    default: null,
  },
  passwordResetCode: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["super_admin", "admin", "company_admin", "employee", "user"],
    default: "user",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default: null,
  },
  employeeProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
      photo: {
    type: String,
    default: function() {
      const id = Math.floor(Math.random() * 100);
      return `https://randomuser.me/api/portraits/${this.gender === 'male' ? 'men' : 'women'}/${id}.jpg`;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Check if the password is already hashed
  const isAlreadyHashed = /^\$2[ayb]\$.{56}$/.test(this.password); // Regex to check bcrypt hash
  if (isAlreadyHashed) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to reset password
userSchema.methods.resetPassword = async function (newPassword) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  this.passwordResetCode = null; // Clear reset code
  this.passwordResetExpires = null; // Clear expiration timestamp
  await this.save(); // Save the updated user object
};




const User = mongoose.model("User", userSchema);
module.exports = User;
