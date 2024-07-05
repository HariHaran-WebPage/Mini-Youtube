// PasswordResetFormWithToken.js
import React, { useState } from "react";
import axios from "axios";
import Bg from "../Img/bg-01.jpg";
import "./Password.css";

const PasswordResetFormWithToken = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleTokenChange = (e) => setToken(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/changepassword",
        {
          email,
          token,
          newPassword,
        }
      );

      setMessage(response.data.message);
      setError("");
    } catch (err) {
      console.error(err);

      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("An error occurred. Please try again later.");
      }

      setMessage("");
    }
  };

  return (
    <div className="password-reset-container">
      <img src={Bg} alt="background" className="bg-image" />
      <h2>Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" value={email} onChange={handleEmailChange} />
        </label>
        <label>
          Token:
          <input type="text" value={token} onChange={handleTokenChange} />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default PasswordResetFormWithToken;
