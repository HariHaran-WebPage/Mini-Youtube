const express = require("express");
const cors = require("cors");
const router = express.Router();
const User = require("../model/Adminmodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

router.use(cors());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your mail",
    pass: "your pass",
  },
});

// Function to generate a random token
function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Function to send a password reset email
function sendPasswordResetEmail(userEmail, resetToken) {
  const resetLink = `http://yourfrontendapp.com/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: "your mail",
    to: userEmail,
    subject: "Password Reset",
    html: `<p>You have requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending password reset email:", error);
    } else {
      console.log("Password reset email sent:", info.response);
    }
  });
}

// Route to handle both initiating password reset and resetting the password with token
router.post("/forgotpassword", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    if (user.resetPassword.expires > new Date()) {
      const remainingTime = Math.ceil(
        (user.resetPassword.expires - new Date()) / 1000 / 60
      );
      console.log(
        "Reset link already sent. Remaining time:",
        remainingTime,
        "minutes"
      );
      return res.status(200).json({
        msg: `A reset link has already been sent to your email. Please check your email. The link is valid for ${remainingTime} minutes.`,
      });
    }

    const token = uuidv4();
    const hashedToken = await bcrypt.hash(token, 10);

    // Update the resetPassword object
    user.resetPassword = {
      token: token,
      expires: new Date(Date.now() + 10 * 60 * 1000), // valid for 10 minutes
    };

    await user.save();

    const resetPasswordLink = `http://localhost:3000/Passwordreset/?token=${token}`;

    const mailOptions = {
      from: "your mail",
      to: email,
      subject: "Password Reset",
      html: `Click <a href="${resetPasswordLink}">here</a> to reset your password. This link is valid for 10 minutes only.`,
    };

    const info = await transporter.sendMail(mailOptions);

    if (info.rejected.length > 0) {
      console.log(`Email rejected: ${info.rejected}`);
      return res
        .status(400)
        .json({ msg: "Email rejected. Please try again later." });
    }

    console.log(`Email sent: ${info.response}`);
    res
      .status(200)
      .json({ msg: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Something went wrong. Please try again later." });
  }
});

router.post("/changepassword", async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    console.log("Received email for password change:", email);

    const user = await User.findOne({
      email: email.toLowerCase(),
      "resetPassword.token": token,
      "resetPassword.expires": { $gt: new Date() },
    });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User before update:", user);

    // Update the user's password and reset token
    user.password = newPassword;
    user.resetPassword = {};
    await user.save();

    console.log("User after update:", user);

    console.log("Password reset successfully for email:", email);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred. Please try again later." });
  }
});

module.exports = router;
