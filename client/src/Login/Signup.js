import React, { useState } from "react";
import Bg from "../Img/bg-01.jpg";
import axios from "axios";
import "./Signup.css";

const Admin = ({ onCreateUser }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    // Check if any of the required fields are empty
    if (
      !name ||
      !mobile ||
      !email ||
      !dob ||
      !jobTitle ||
      !address ||
      !password
    ) {
      window.alert("Please fill in all the fields.");
      return;
    }

    const userData = {
      name,
      mobile,
      email,
      dob,
      jobTitle,
      address,
      password,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/createrequest",
        userData
      );
      console.log(response.data);

      window.alert("User registration request sent for admin approval");

      window.location.href = "/";

      // Reset the form fields
      setName("");
      setMobile("");
      setEmail("");
      setDob("");
      setJobTitle("");
      setAddress("");
      setPassword("");
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle errors
    }
  };

  return (
    <div>
      <img src={Bg} alt="background" className="bg-image" />
      <div className="user-form-container">
        <h2 className="form-title">Create User</h2>
        <form className="user-form">
          <label className="form-label">
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            Mobile:
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            E-Mail:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            Date of Birth:
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            Job Title:
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            Address:
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-textarea"
            />
          </label>

          <label className="form-label">
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </label>

          <button type="button" onClick={handleSubmit} className="form-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
