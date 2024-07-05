// UserCreationForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable"; // Add this import for autoTable
import "./Staff.css";

const UserCreationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    jobTitle: "",
    address: "",
    password: "",
  });

  const [users, setUsers] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/createuser",
        formData
      );
      console.log(response.data);

      // If successful, update the users state with the new user
      setUsers((prevUsers) => [...prevUsers, response.data.user]);

      // Reset the form data
      setFormData({
        name: "",
        mobile: "",
        email: "",
        dob: "",
        jobTitle: "",
        address: "",
        password: "",
      });
    } catch (error) {
      console.error("Error creating user:", error.response.data.error);
    }
  };

  useEffect(() => {
    const fetchRegularUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/getregularusers"
        );
        console.log("Regular user data response:", response.data);

        // Ensure that the response data is an array with expected properties
        if (
          Array.isArray(response.data.users) &&
          response.data.users.length > 0
        ) {
          setUsers(response.data.users);
        } else {
          console.error(
            "Invalid response format or empty regular users array:",
            response.data
          );
        }
      } catch (error) {
        console.error(
          "Error fetching regular users:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchRegularUsers();
  }, []);

  const handleDownloadCSV = (data, fileName) => {
    const csvData = [
      ["Name", "Mobile", "Email", "DOB", "Job Title", "Address"],
      ...data.map((user) => [
        user.name,
        user.mobile,
        user.email,
        user.dob,
        user.jobTitle,
        user.address,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Download CSV is not supported in this browser.");
    }
  };

  // const handleDownloadPDF = (data, fileName) => {
  //   const unit = "pt";
  //   const size = "A4"; // Use A1, A2, A3, or A4 for different sizes
  //   const orientation = "portrait"; // or "landscape"

  //   const doc = new jsPDF(orientation, unit, size);

  //   doc.setFontSize(12);
  //   doc.text("User List", 20, 30);

  //   // Convert the table to a canvas and then add it to the PDF
  //   html2canvas(document.getElementById("userTable")).then((canvas) => {
  //     const imgData = canvas.toDataURL("image/png");
  //     doc.addImage(imgData, "PNG", 20, 40);

  //     doc.autoTable({
  //       startY: 220,
  //       head: [["Name", "Mobile", "Email", "DOB", "Job Title", "Address"]],
  //       body: data.map((user) => [
  //         user.name,
  //         user.mobile,
  //         user.email,
  //         user.dob,
  //         user.jobTitle,
  //         user.address,
  //       ]),
  //     });

  //     doc.save(fileName);
  //   });
  // };

  return (
    <div className="user-management">
      <h2>Create User</h2>
      <h2>User List</h2>
      <table id="userTable" className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Job Title</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.mobile}>
                <td>{user.name}</td>
                <td>{user.mobile}</td>
                <td>{user.email}</td>
                <td>{user.dob}</td>
                <td>{user.jobTitle}</td>
                <td>{user.address}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        className="download-btn"
        onClick={() => handleDownloadCSV(users, "regular_users.csv")}
      >
        Download Regular Users CSV
      </button>
      {/* <button
        className="download-btn"
        onClick={() => handleDownloadPDF(users, "regular_users.pdf")}
      >
        Download Regular Users PDF
      </button> */}

      <form onSubmit={handleSubmit} className="user-form">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Mobile:</label>
        <input
          type="text"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Date of Birth:</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
        />

        <label>Job Title:</label>
        <input
          type="text"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          required
        />

        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default UserCreationForm;
