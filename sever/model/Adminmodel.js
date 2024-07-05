const mongoose = require("mongoose");

const roles = ["admin", "team_head", "staff", "regular_user", "user"];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdminApproved: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: roles,
    default: "regular_user",
  },
  userType: {
    type: String,
    enum: ["user", "other_type"], // Add more types as needed
    default: "user", // Set a default user type
  },
  resetPassword: {
    token: {
      type: String,
    },
    expires: {
      type: Date,
    },
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  mobileVerificationToken: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
