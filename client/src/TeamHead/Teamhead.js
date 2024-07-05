import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import "./Teamhead.css";

const TeamHeadStaffTable = () => {
  const [users, setUsers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    jobTitle: "",
    address: "",
    password: "",
  });

  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getstaffmembers");
      setStaffMembers(response.data);
    } catch (error) {
      console.error("Error fetching staff members:", error.message);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch the list of all staff members
      await fetchStaffMembers();

      // Fetch the list of all users
      axios
        .get("http://localhost:5000/getallusers")
        .then((response) => {
          setUsers(response.data.users);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
        });
    };

    fetchInitialData();
  }, []); // Empty dependency array to ensure this effect runs only once on mount

  const handleRequestAccess = async (mobile) => {
    try {
      await axios.post(`http://localhost:5000/requestaccess/${mobile}`);
      fetchStaffMembers();
    } catch (error) {
      console.error("Error sending access request:", error.message);
    }
  };

  const handleCreateStaff = async () => {
    try {
      await axios.post("http://localhost:5000/createstaff", newStaff);
      fetchStaffMembers();
      setNewStaff({
        name: "",
        mobile: "",
        email: "",
        dob: "",
        jobTitle: "",
        address: "",
        password: "",
      });
    } catch (error) {
      console.error("Error creating staff member:", error.message);
    }
  };

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

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const styles = StyleSheet.create({
    page: { flexDirection: "row" },
    table: { display: "table", width: "100%", pageBreakInside: "auto" },
    tableRow: { margin: "auto", flexDirection: "row" },
    tableCell: { margin: "auto", padding: 5, border: "1px solid #000" },
  });

  return (
    <div className="container">
      <h2 className="heading">Staff Members</h2>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Job Title</th>
            <th>Address</th>
            <th>Action</th>
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
            </tr>
          ))}
        </tbody>
      </table>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Date of Birth</th>
            <th>Job Title</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {staffMembers.map((staffMember) => (
            <tr key={staffMember.mobile}>
              <td>{staffMember.name}</td>
              <td>{staffMember.mobile}</td>
              <td>{staffMember.email}</td>
              <td>{staffMember.dob}</td>
              <td>{staffMember.jobTitle}</td>
              <td>{staffMember.address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CSV download link */}
      <CSVLink
        data={staffMembers}
        headers={[
          "Name",
          "Mobile",
          "Email",
          "Date of Birth",
          "Job Title",
          "Address",
        ]}
        filename={"staff_members.csv"}
      >
        Download CSV
      </CSVLink>

      {/* PDF download link */}
      {/* <PDFDownloadLink
        document={
          <Document>
            <Page size="A4" style={styles.page}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  {[
                    "Name",
                    "Mobile",
                    "Email",
                    "Date of Birth",
                    "Job Title",
                    "Address",
                  ].map((header, index) => (
                    <View style={styles.tableCell} key={index}>
                      <Text>{header}</Text>
                    </View>
                  ))}
                </View>
                {staffMembers.map((staffMember, index) => (
                  <View style={styles.tableRow} key={index}>
                    {Object.values(staffMember).map((value, index) => (
                      <View style={styles.tableCell} key={index}>
                        <Text>{value}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </Page>
          </Document>
        }
        fileName="staff_members.pdf"
      >
        {({ blob, url, loading, error }) =>
          loading ? "Loading document..." : "Download PDF"
        }
      </PDFDownloadLink> */}

      <h2 className="create-staff-heading">Create Staff Member</h2>
      <form className="create-staff-form">
        <label>Name:</label>
        <input
          type="text"
          value={newStaff.name}
          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
        />

        <label>Mobile:</label>
        <input
          type="text"
          value={newStaff.mobile}
          onChange={(e) => setNewStaff({ ...newStaff, mobile: e.target.value })}
        />

        <label>Email:</label>
        <input
          type="email"
          value={newStaff.email}
          onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
        />

        <label>Date of Birth:</label>
        <input
          type="date"
          value={newStaff.dob}
          onChange={(e) => setNewStaff({ ...newStaff, dob: e.target.value })}
        />

        <label>Job Title:</label>
        <input
          type="text"
          value={newStaff.jobTitle}
          onChange={(e) =>
            setNewStaff({ ...newStaff, jobTitle: e.target.value })
          }
        />

        <label>Address:</label>
        <input
          type="text"
          value={newStaff.address}
          onChange={(e) =>
            setNewStaff({ ...newStaff, address: e.target.value })
          }
        />

        <label>Password:</label>
        <input
          type="password"
          value={newStaff.password}
          onChange={(e) =>
            setNewStaff({ ...newStaff, password: e.target.value })
          }
        />
      </form>
      <button type="button" onClick={handleCreateStaff}>
        Create Staff
      </button>
    </div>
  );
};

export default TeamHeadStaffTable;
