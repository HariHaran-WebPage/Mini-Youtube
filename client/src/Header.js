import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink, Route } from "react-router-dom";
import Logo from "./Img/logo.png";
import "./Header.css";

const Header = () => {
  const [showUserData, setShowUserData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({}); // Initialize with an empty object
  const isAdmin = userData.role === "admin";
  const isTeamHead = userData.role === "team_head";
  const isStaff = userData.role === "staff"; // Added isStaff

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserData(userId);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/user/${userId}`);

      if (response.status === 200) {
        const user = response.data;
        setUserData(user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserData = () => {
    setShowUserData(!showUserData);

    if (!userData && showUserData) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        fetchUserData(userId);
      }
    }
  };

  const getInitials = (name) => {
    if (name) {
      const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();

      return initials;
    }

    return "P"; // Default to "P" if name is undefined
  };

  return (
    <div className="header">
      <div className="logo">
        <img src={Logo} alt="Company Logo" />
      </div>

      {/* Center - Company Name */}
      <div className="company-name">
        <h1>SOCIAL MEDIA WEBSITE</h1>
      </div>

      {/* Right side - User Profile */}
      <div className="user-profile">
        <div className="profile-trigger" onClick={toggleUserData}>
          <div className="profile-image">{getInitials(userData?.name)}</div>
          User Profile
        </div>

        {/* User data content with profile image */}
        {showUserData && (
          <div className="user-data">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <p>Name: {userData?.name}</p>
                <p>Email: {userData?.email}</p>
                <p>Mobile: {userData?.mobile}</p>
                <p>DOB: {userData?.dob}</p>
                <p>Job Title: {userData?.jobTitle}</p>
                <p>Address: {userData?.address}</p>
                <nav>
                  <ul>
                    <li>
                      <NavLink to="/Upload">Upload</NavLink>
                    </li>
                    <li>
                      <NavLink to="/Profile">Profile</NavLink>
                    </li>
                    {isAdmin && (
                      <li>
                        <NavLink to="/AdminDashboard">Admin Dashboard</NavLink>
                      </li>
                    )}
                    {isTeamHead && (
                      <li>
                        <NavLink to="/TeamHeadDashbord">
                          Team Head Dashboard
                        </NavLink>
                      </li>
                    )}
                    {isStaff && (
                      <li>
                        <NavLink to="/StaffDashbord">Staff Dashboard</NavLink>
                      </li>
                    )}
                    <li>
                      <NavLink to="/">Logout</NavLink>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
