// adminRoute.js
const express = require("express");
const router = express.Router();
const User = require("../model/Adminmodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const twilio = require("twilio");
const nodemailer = require("nodemailer");

// // Twilio configuration
// const accountSid = "your acc";
// const authToken = "your token";
// const twilioPhone = "your number ";
// const client = twilio(accountSid, authToken);
// const cors = require("cors");

// // Function to send an SMS notification upon admin approval
// function sendApprovalSMS(userMobile) {
//   // Log the userMobile before making the Twilio API call
//   console.log("Sending SMS to:", userMobile);

//   // Ensure the userMobile is formatted correctly (replace with the user's actual mobile number)
//   const toPhoneNumber = `+91${userMobile}`;
//   console.log("Formatted phone number:", toPhoneNumber);

//   client.messages
//     .create({
//       body: "Your account has been approved by the admin. You can now log in.",
//       from: twilioPhone,
//       to: toPhoneNumber,
//     })
//     .then((message) => console.log("SMS sent:", message.sid))
//     .catch((error) => console.error("Error sending SMS:", error));
// }

router.post("/createrequest", async (req, res) => {
  const { name, mobile, email, dob, jobTitle, address, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "Mobile or email already exists" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hashSync(password, saltRounds);

    const newUser = new User({
      name,
      mobile,
      email,
      dob,
      jobTitle,
      address,
      password: passwordHash,
      isAdminApproved: false, // User requires admin approval
      role: "user", // Default role for regular users
    });

    await newUser.save();

    console.log("User registration request sent for admin approval");

    // Send an email notification to the admin (optional)
    sendApprovalEmail("hariharan23052001@gmail.com", {
      name,
      mobile,
      email,
      dob,
      jobTitle,
      address,
    });

    res.status(201).json({
      message: "User registration request sent for admin approval",
      user: {
        name,
        mobile,
        email,
        dob,
        jobTitle,
        address,
        isAdminApproved: false,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/registration-requests", async (req, res) => {
  try {
    // Find all users that require admin approval
    const registrationRequests = await User.find({ isAdminApproved: false });

    if (registrationRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No registration requests found" });
    }

    res.status(200).json({ registrationRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/acceptuserrequest/:mobile", async (req, res) => {
  const { mobile } = req.params;

  try {
    // Find the user by mobile number and update their 'isAdminApproved' status to true
    const user = await User.findOneAndUpdate(
      { mobile },
      { isAdminApproved: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // The following line related to sendApprovalSMS is removed
    // sendApprovalSMS(user.mobile);

    res.status(200).json({ message: "User request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your mail",
    pass: "your pass",
  },
});

// function sendApprovalSMS(userMobile) {
//   // Log the userMobile before making the Twilio API call
//   console.log("Sending SMS to:", userMobile);

//   // Ensure the userMobile is formatted correctly (replace with the user's actual mobile number)
//   const toPhoneNumber = `+91${userMobile}`;
//   console.log("Formatted phone number:", toPhoneNumber);

//   client.messages
//     .create({
//       body: "Your account has been approved by the admin. You can now log in.",
//       from: twilioPhone,
//       to: toPhoneNumber,
//     })
//     .then((message) => console.log("SMS sent:", message.sid))
//     .catch((error) => console.error("Error sending SMS:", error));
// }

// Asynchronous function to send an email notification upon admin approval

async function sendApprovalEmail(userEmail, userDetails) {
  const mailOptions = {
    from: "your mail",
    to: userEmail,
    subject: "Account Approval Notification",
    html: `
      <p>Your account has been approved by the admin. You can now log in.</p>
      <p>Name: ${userDetails.name}</p>
      <p>Mobile: ${userDetails.mobile}</p>
      <p>Email: ${userDetails.email}</p>
      <p>DOB: ${userDetails.dob}</p>
      <p>Job Title: ${userDetails.jobTitle}</p>
      <p>Address: ${userDetails.address}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Function to send an email notification for new user approval request
function sendApprovalRequestEmail(adminEmail, userDetails) {
  const approvalToken = generateUniqueToken(); // Assuming you have this function defined

  const mailOptions = {
    from: "your mail",
    to: adminEmail,
    subject: "New User Approval Request",
    html: `
      <p>You have a new user approval request:</p>
      <p>Name: ${userDetails.name}</p>
      <p>Mobile: ${userDetails.mobile}</p>
      <p>Email: ${userDetails.email}</p>
      <p>DOB: ${userDetails.dob}</p>
      <p>Job Title: ${userDetails.jobTitle}</p>
      <p>Address: ${userDetails.address}</p>
      <p style="margin-top: 20px;">Click the following link to approve:</p>
      <p style="text-align: center;">
        <a href="${process.env.SERVER_BASE_URL}/approve-user/${approvalToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">
          Approve User
        </a>
      </p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

router.get("/approve-user/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { approvalToken: token },
      { isAdminApproved: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found or invalid token" });
    }

    sendApprovalSMS(user.mobile);

    res.status(200).json({ message: "User approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

require("dotenv").config(); // Load environment variables from .env file

router.post("/createadmin", async (req, res) => {
  const {
    ADMIN_NAME,
    ADMIN_PASSWORD,
    ADMIN_EMAIL,
    ADMIN_MOBILE,
    ADMIN_JOB_TITLE,
    ADMIN_ADDRESS,
    ADMIN_DOB,
    ADMIN_IS_APPROVED,
  } = process.env;

  console.log(
    `ADMIN_NAME: ${ADMIN_NAME}, ADMIN_PASSWORD: ${ADMIN_PASSWORD}, ADMIN_EMAIL: ${ADMIN_EMAIL}, ADMIN_MOBILE: ${ADMIN_MOBILE}, ADMIN_JOB_TITLE: ${ADMIN_JOB_TITLE}, ADMIN_ADDRESS: ${ADMIN_ADDRESS}, ADMIN_DOB: ${ADMIN_DOB}, ADMIN_IS_APPROVED: ${ADMIN_IS_APPROVED}`
  );

  try {
    const existingAdmin = await User.findOne({ mobile: ADMIN_MOBILE });

    if (existingAdmin) {
      return res
        .status(409)
        .json({ error: "Admin with this mobile number already exists" });
    }

    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, saltRounds);

    // Create a new admin user with role "admin"
    const newAdmin = new User({
      name: ADMIN_NAME,
      password: passwordHash,
      email: ADMIN_EMAIL,
      mobile: ADMIN_MOBILE,
      jobTitle: ADMIN_JOB_TITLE, // Ensure that jobTitle is provided
      address: ADMIN_ADDRESS,
      dob: new Date(ADMIN_DOB),
      isAdminApproved: ADMIN_IS_APPROVED === "true",
      role: "admin", // Set the role to "admin"
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin user created successfully",
      admin: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        mobile: ADMIN_MOBILE,
        jobTitle: ADMIN_JOB_TITLE,
        address: ADMIN_ADDRESS,
        dob: ADMIN_DOB,
        isAdminApproved: newAdmin.isAdminApproved,
        role: "admin",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/edituser/:mobile", async (req, res) => {
  const { mobile } = req.params;
  const updatedUserDetails = req.body;

  try {
    // Find the user by mobile number and update their details
    const user = await User.findOneAndUpdate({ mobile }, updatedUserDetails);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getuser/:mobile", async (req, res) => {
  const { mobile } = req.params;

  try {
    // Find the user by mobile number
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user details in the response
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/deleteuser/:mobile", async (req, res) => {
  const mobile = req.params.mobile;

  try {
    // Find the user and delete it
    const deletedUser = await User.findOneAndDelete({ mobile: mobile });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/acceptuserrequest/:mobile", async (req, res) => {
  const { mobile } = req.params;

  try {
    // Find the user by mobile number and update their 'isAdminApproved' status to true
    const user = await User.findOneAndUpdate(
      { mobile },
      { isAdminApproved: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send an email notification to the user
    sendApprovalEmail(user.email, {
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      dob: user.dob,
      jobTitle: user.jobTitle,
      address: user.address,
    });

    // Send an SMS notification to the user
    sendApprovalSMS(user.mobile);

    res.status(200).json({ message: "User request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/createteamhead", async (req, res) => {
  const { name, mobile, email, dob, jobTitle, address, password, role } =
    req.body;

  try {
    // Check if the team head already exists
    const existingTeamHead = await User.findOne({ mobile });
    if (existingTeamHead) {
      return res
        .status(409)
        .json({ error: "Team head with this mobile number already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hashSync(password, saltRounds);

    // Create a new team head user with the specified role
    const newTeamHead = new User({
      name,
      mobile,
      email,
      dob,
      jobTitle,
      address,
      password: passwordHash,
      isAdminApproved: true, // Assuming team heads are approved by default
      role: role || "team_head", // Default to "team_head" if no role is provided
    });

    await newTeamHead.save();

    console.log("Team head created successfully");

    res.status(201).json({
      message: "Team head created successfully",
      teamHead: {
        name,
        mobile,
        email,
        dob,
        jobTitle,
        address,
        role: newTeamHead.role, // Include the role in the response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getteamheads", async (req, res) => {
  try {
    // Query the database for team heads with the role "team_head"
    const teamHeads = await User.find({ role: "team_head" });

    res.status(200).json(teamHeads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/createstaff", async (req, res) => {
  const { name, mobile, email, dob, jobTitle, address, password } = req.body;

  try {
    // Check if the staff member already exists
    const existingStaff = await User.findOne({ mobile });
    if (existingStaff) {
      return res
        .status(409)
        .json({ error: "Staff member with this mobile number already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hashSync(password, saltRounds);

    // Create a new staff member with role "staff" and isAdminApproved set to true
    const newStaff = new User({
      name,
      mobile,
      email,
      dob,
      jobTitle,
      address,
      password: passwordHash,
      isAdminApproved: true, // Set to true by default
      role: "staff", // Set the role to "staff"
    });

    await newStaff.save();

    console.log("Staff member created successfully");

    res.status(201).json({
      message: "Staff member created successfully",
      staffMember: {
        name,
        mobile,
        email,
        dob,
        jobTitle,
        address,
        role: "staff", // Include the role in the response
        isAdminApproved: true, // Include the isAdminApproved status in the response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getstaffmembers", async (req, res) => {
  try {
    // Query the database for staff members with the role "staff"
    const staffMembers = await User.find({ role: "staff" });

    res.status(200).json(staffMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/createuser", async (req, res) => {
  const { name, mobile, email, dob, jobTitle, address, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this mobile number already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hashSync(password, saltRounds);

    // Create a new user with the role "regular_user" and isAdminApproved set to true
    const newUser = new User({
      name,
      mobile,
      email,
      dob,
      jobTitle,
      address,
      password: passwordHash,
      isAdminApproved: true, // Set to true by default
      role: "regular_user", // Set the role to "regular_user"
    });

    await newUser.save();

    console.log("User created successfully");

    res.status(201).json({
      message: "User created successfully",
      user: {
        name,
        mobile,
        email,
        dob,
        jobTitle,
        address,
        role: "regular_user", // Include the role in the response
        isAdminApproved: true, // Include the isAdminApproved status in the response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    // Find all regular users
    const regularUsers = await User.find({ isAdminApproved: true });

    if (regularUsers.length === 0) {
      return res.status(404).json({ message: "No regular users found" });
    }

    res.status(200).json({ regularUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (team heads, staff, and regular users)
router.get("/getallusers", async (req, res) => {
  try {
    // Find all users and exclude the password field from the response
    const users = await User.find({}, { password: 0 });

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if userId is valid and handle database operations using the User model
    const user = await User.findById(userId);

    // Your response handling code here
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
