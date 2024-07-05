import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import Bg from "../Img/bg-01.jpg";
import "../Login/Login.css";

function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        mobile,
        password,
      });

      const { token, user } = response.data;

      if (user && user.userId && user.role) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("role", user.role);
        navigate("/Profile");
      } else {
        setError("Invalid user data. Please try again.");
      }
    } catch (error) {
      setError(`Login failed: ${error.message}`);
      console.error("Login error:", error);
    }
  };

  const handleSignUp = () => {
    // Redirect to the sign-up page
    navigate("/Signup"); // Use navigate instead of history.push
  };

  const handleForgotPassword = () => {
    // Redirect to the forgot password page
    navigate("/forgot"); // Use navigate instead of history.push
  };

  return (
    <div>
      <div className="login-container">
        <img src={Bg} alt="background" className="bg-image" />
        <div className="login-form">
          <h1>Login</h1>

          <label className="input-container">
            <i className="input-icon fas fa-mobile-alt">Mobile</i>

            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </label>

          <label className="input-container">
            <i className="input-icon fas fa-lock">Password</i>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button onClick={handleLogin}>Login</button>

          <p className="forgot-password" onClick={handleForgotPassword}>
            Forgot password?
          </p>

          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
