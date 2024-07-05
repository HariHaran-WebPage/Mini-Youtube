const express = require("express");
const router = express.Router();
const User = require("../model/Adminmodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ... Other imports and configurations ...

router.post("/login", async (req, res) => {
  const { mobile, password } = req.body;

  try {
    // Find the user by mobile number
    const user = await User.findOne({ mobile });

    if (!user) {
      console.log("User not found for mobile:", mobile);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Provided Password:", password);
    console.log("Stored Hashed Password:", user.password);

    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Update the user password in the database with the hashed version of the provided password
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ mobile }, { $set: { password: hashedPassword } });

      console.log("Updated Password in the Database:", hashedPassword);

      return res.status(401).json({ error: "Invalid password" });
    }

    // Check if the user is approved by the admin
    if (!user.isAdminApproved) {
      return res.status(401).json({ error: "User not approved by admin" });
    }

    // Generate a JWT token for the authenticated user with user role information
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "your-secret-key",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user._id,
        username: user.username, // Include other user details as needed
        role: user.role, // Use the 'role' directly from the user document
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
