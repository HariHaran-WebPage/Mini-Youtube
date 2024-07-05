// src/components/AdminDashboard.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable"; // Add this import for autoTable
import "../Admin/Admin.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const tableRef = useRef(null);
  const [editedUserDetails, setEditedUserDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teamHeads, setTeamHeads] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]); // Add this line
  const [regularUsers, setRegularUsers] = useState([]);

  const [teamHeadForm, setTeamHeadForm] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    jobTitle: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    // Fetch the list of all users from the backend
    axios
      .get("http://localhost:5000//registration-requests")
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    // Fetch the list of team heads from the backend
    axios
      .get("http://localhost:5000/getteamheads")
      .then((response) => {
        setTeamHeads(response.data);
      })
      .catch((error) => {
        console.error("Error fetching team heads:", error);
      });

    axios
      .get("http://localhost:5000/getstaffmembers")
      .then((response) => {
        // Update the state with the staff members
        setStaffMembers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching staff members:", error);
      });

    axios
      .get("http://localhost:5000/users")
      .then((response) => {
        setRegularUsers(response.data.users); // Assuming your response object has a 'users' property containing the array of users
      })
      .catch((error) => {
        console.error("Error fetching regular users:", error);
      });
  }, []); // Empty dependency array to run the effect only once when the component mounts

  const handleAcceptUser = (mobile) => {
    // Send a request to the backend to accept the user with the specified mobile number
    axios
      .post(`http://localhost:5000/acceptuserrequest/${mobile}`)
      .then((response) => {
        // Update the state or trigger a re-fetch of the user list
        // based on your application architecture
        console.log("User accepted successfully:", response.data.message);
      })
      .catch((error) => {
        console.error("Error accepting user:", error);
      });
  };

  const handleSearchClick = () => {
    console.log("Search clicked with term:", searchTerm);
  };

  const handleEditUser = (mobile) => {
    // Fetch the user details from the backend based on the mobile number
    axios
      .get(`http://localhost:5000/getuser/${mobile}`)
      .then((response) => {
        const user = response.data.user;

        // Open a modal with the user details for editing
        setEditedUserDetails(user);
        setShowEditModal(true);

        // Log the user details to check if they are fetched correctly
        console.log("Fetched User Details:", user);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  };

  const handleEditSubmit = () => {
    // Log the edited user details before sending the PUT request
    console.log("Edited User Details:", editedUserDetails);

    // Send a PUT request to update user details
    axios
      .put(
        `http://localhost:5000/edituser/${editedUserDetails.mobile}`,
        editedUserDetails
      )
      .then((response) => {
        console.log(response.data.message);
        // Handle success, close the modal, or redirect as needed
        setShowEditModal(false);
        // Optionally, you can update the user list or trigger a re-fetch
      })
      .catch((error) => {
        console.error("Error updating user details:", error);
        // Handle error, show an error message, etc.
      });
  };

  const handleEditFieldChange = (fieldName, value) => {
    setEditedUserDetails((prevDetails) => ({
      ...prevDetails,
      [fieldName]: value,
    }));
  };

  const handleDeleteUser = (mobile) => {
    // Send a request to the backend to delete the user with the specified mobile number
    axios
      .delete(`http://localhost:5000/deleteuser/${mobile}`)
      .then((response) => {
        // Update the state to remove the deleted user
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.mobile !== mobile)
        );
        console.log("User deleted successfully:", response.data.message);
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  // const handleDownloadPDF = (data, fileName) => {
  //   // Get the table as a canvas
  //   html2canvas(tableRef.current).then((canvas) => {
  //     const imgData = canvas.toDataURL("image/png");

  //     // Calculate the page dimensions
  //     const pdfWidth = 210;
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //     // Create a PDF
  //     const pdf = new jsPDF("p", "mm", "a4");

  //     // Add an initial page
  //     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  //     // Customize the styles for the table in the PDF
  //     const tableStyles = {
  //       startY: pdfHeight + 10,
  //       theme: "grid",
  //       styles: {
  //         halign: "center",
  //         valign: "middle",
  //       },
  //       headStyles: {
  //         fillColor: "#3498db",
  //         textColor: "#fff",
  //         fontSize: 12,
  //       },
  //       columnStyles: {
  //         0: { cellWidth: 40 }, // Adjust the width of specific columns if needed
  //       },
  //     };

  //     // Add the table to the PDF
  //     pdf.autoTable({
  //       html: tableRef.current,
  //       ...tableStyles,
  //     });

  //     // Save the PDF
  //     pdf.save(fileName);
  //   });
  // };

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

  const handleTeamHeadFormChange = (e) => {
    const { name, value } = e.target;
    setTeamHeadForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleCreateTeamHead = (e) => {
    e.preventDefault();
    // Send a request to the backend to create a Team Head
    axios
      .post("http://localhost:5000/createteamhead", teamHeadForm)
      .then((response) => {
        // Update the state or trigger a re-fetch of the user list
        // based on your application architecture
        console.log("Team Head created successfully:", response.data.message);
        // Clear the form fields after successful creation
        setTeamHeadForm({
          name: "",
          mobile: "",
          email: "",
          dob: "",
          jobTitle: "",
          address: "",
          password: "",
        });
      })
      .catch((error) => {
        console.error("Error creating Team Head:", error);
      });
  };

  // Filter users based on role

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or mobile"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch onClick={handleSearchClick} />
      </div>

      <div className="table-container">
        <table className="users-table" ref={tableRef}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>DOB</th>
              <th>Job Title</th>
              <th>Address</th>
              <th>Action</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.mobile}</td>
                <td>{user.email}</td>
                <td>{user.dob}</td>
                <td>{user.jobTitle}</td>
                <td>{user.address}</td>
                <td>
                  {!user.isAdminApproved && (
                    <button onClick={() => handleAcceptUser(user.mobile)}>
                      Accept User
                    </button>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEditUser(user.mobile)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDeleteUser(user.mobile)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={() => handleDownloadCSV(users, "all_users.csv")}>
          Download All Users CSV
        </button>
        {/* <button onClick={() => handleDownloadPDF(users, "all_users.pdf")}>
          Download All Users PDF
        </button> */}
      </div>

      {showEditModal && (
        <div className="edit-modal">
          <h2>Edit User</h2>
          <form onSubmit={handleEditSubmit}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={editedUserDetails ? editedUserDetails.name : ""}
                onChange={(e) => handleEditFieldChange("name", e.target.value)}
              />
            </label>
            <label>
              Mobile:
              <input
                type="text"
                name="mobile"
                value={editedUserDetails ? editedUserDetails.mobile : ""}
                onChange={(e) =>
                  handleEditFieldChange("mobile", e.target.value)
                }
              />
            </label>
            {/* Add similar input fields for jobTitle, address, email, dob */}
            <label>
              Job Title:
              <input
                type="text"
                name="jobTitle"
                value={editedUserDetails ? editedUserDetails.jobTitle : ""}
                onChange={(e) =>
                  handleEditFieldChange("jobTitle", e.target.value)
                }
              />
            </label>
            <label>
              Address:
              <input
                type="text"
                name="address"
                value={editedUserDetails ? editedUserDetails.address : ""}
                onChange={(e) =>
                  handleEditFieldChange("address", e.target.value)
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={editedUserDetails ? editedUserDetails.email : ""}
                onChange={(e) => handleEditFieldChange("email", e.target.value)}
              />
            </label>
            <label>
              Date of Birth:
              <input
                type="date"
                name="dob"
                value={editedUserDetails ? editedUserDetails.dob : ""}
                onChange={(e) => handleEditFieldChange("dob", e.target.value)}
              />
            </label>
            <button type="submit">Save Changes</button>
          </form>
        </div>
      )}

      <div className="team-heads-table">
        <h2>Team Heads</h2>
        <table>
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
            {teamHeads.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.mobile}</td>
                <td>{user.email}</td>
                <td>{user.dob}</td>
                <td>{user.jobTitle}</td>
                <td>{user.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="staff-members-table">
        <h2>Staff Members</h2>
        <table>
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
            {staffMembers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.mobile}</td>
                <td>{user.email}</td>
                <td>{user.dob}</td>
                <td>{user.jobTitle}</td>
                <td>{user.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="create-users-table">
        <h2>Create Users</h2>
        <table>
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
      </div>
      {/* Team Head creation form */}
      <div className="create-team-head-form">
        <h2>Create Team Head</h2>
        <form onSubmit={handleCreateTeamHead}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={teamHeadForm.name}
              onChange={handleTeamHeadFormChange}
              required
            />
          </label>
          <label>
            Mobile:
            <input
              type="text"
              name="mobile"
              value={teamHeadForm.mobile}
              onChange={handleTeamHeadFormChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={teamHeadForm.email}
              onChange={handleTeamHeadFormChange}
              required
            />
          </label>
          <label>
            Date of Birth:
            <input
              type="date"
              name="dob"
              value={teamHeadForm.dob}
              onChange={handleTeamHeadFormChange}
              required
            />
          </label>
          <label>
            Job Title:
            <input
              type="text"
              name="jobTitle"
              value={teamHeadForm.jobTitle}
              onChange={handleTeamHeadFormChange}
              required
            />
          </label>
          <label>
            Address:
            <input
              type="text"
              name="address"
              value={teamHeadForm.address}
              onChange={handleTeamHeadFormChange}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={teamHeadForm.password}
              onChange={handleTeamHeadFormChange}
              required
            />
          </label>
          <button type="submit">Create Team Head</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
