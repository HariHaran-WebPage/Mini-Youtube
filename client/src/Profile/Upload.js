import React, { useState, useEffect } from "react";
import axios from "axios";

const ImageUploadPage = ({ onUploadSuccess }) => {
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [title, setTitle] = useState("");
  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    // Fetch the user role from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleVideoChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleImageUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await axios.post(
        "http://localhost:5000/uploadImage",
        formData
      );

      onUploadSuccess(response.data.imagePath);

      setImageFile(null);
      setUploadError("");
    } catch (error) {
      setUploadError("Error uploading image: " + error.message);
    }
  };

  const handleVideoUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", title);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        // Handle the case where userId is not available
        console.error("User ID not found in local storage");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            Authorization: userId,
          },
        }
      );

      console.log(response.data.message);

      setVideoFile(null);
      setUploadError("");
    } catch (error) {
      setUploadError("Error uploading video: " + error.message);
    }
  };

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

  return (
    <div>
      {userRole === "admin" || userRole === "teamhead" ? (
        <>
          <h2>Upload Image</h2>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button onClick={handleImageUpload}>Upload Image</button>

          {/* Display error messages */}
          {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
        </>
      ) : (
        <p style={{ color: "red" }}>
          You do not have the required role to upload images.
        </p>
      )}

      <div>
        <h2>Upload Video</h2>
        <input type="file" accept="video/*" onChange={handleVideoChange} />
        {/* The uploader profile name is displayed but not editable */}
        <p>Uploader Profile Name: {userData?.name}</p>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={handleVideoUpload}>Upload Video</button>

        {/* Display error messages */}
        {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
      </div>
    </div>
  );
};

export default ImageUploadPage;
