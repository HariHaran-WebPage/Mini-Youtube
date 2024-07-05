import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import LoginForm from "./Login/Login";
import Admin from "./Login/Signup";
import PasswordResetForm from "./Password/Forgot";
import PasswordResetFormWithToken from "./Password/Passwordreset";
import ImageUploadPage from "./Profile/Upload";
import DisplayPage from "./Profile/Profile";
import AdminDashboard from "./Admin/AdminTable";
import TeamHeadStaffTable from "./TeamHead/Teamhead";
import UserCreationForm from "./Staff/Staff";
import Header from "./Header";
import Footer from "./Footer";

const App = () => {
  const [imageFiles, setImageFiles] = useState([]);

  const handleUploadSuccess = (imagePath) => {
    setImageFiles((prevImageFiles) => [
      ...prevImageFiles,
      `http://localhost:5000/userProfileImages/${imagePath}`,
    ]);
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LoginForm />} />

          <Route path="/Signup" element={<Admin />} />
          <Route path="/Forgot" element={<PasswordResetForm />} />
          <Route
            path="/PasswordReset"
            element={<PasswordResetFormWithToken />}
          />
          {/* Include the Header component for specific routes */}
          <Route
            path="/Upload"
            element={
              <>
                <Header />
                <ImageUploadPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/Profile"
            element={
              <>
                <Header />
                <DisplayPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/AdminDashboard"
            element={
              <>
                <Header />
                <AdminDashboard />
                <Footer />
              </>
            }
          />
          <Route
            path="/TeamHeadDashbord"
            element={
              <>
                <Header />
                <TeamHeadStaffTable />
                <Footer />
              </>
            }
          />
          <Route
            path="/StaffDashbord"
            element={
              <>
                <Header />
                <UserCreationForm />
                <Footer />
              </>
            }
          />
          {/* Include the Footer component outside the Routes */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
