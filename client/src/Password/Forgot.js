// PasswordResetForm.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Bg from "../Img/bg-01.jpg";
import "./Forgot.css";

const PasswordResetForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to the forgotpassword route with the entered email
      const response = await axios.post(
        "http://localhost:5000/forgotpassword",
        { email }
      );

      setMessage(response.data.message);
      setError("");
      navigate("/");
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
    <div className="custom-password-reset-container">
      <img src={Bg} alt="background" className="bg-image" />
      <h2>Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="text" value={email} onChange={handleEmailChange} />
        </label>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default PasswordResetForm;
