import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DisplayPage.css"; // Import the CSS file

const DisplayPage = ({ videoFiles }) => {
  const [videos, setVideos] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [currentUser, setCurrentUser] = useState({ userId: "username" });
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/videos");
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getImageList");
        setImageFiles(response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchVideos();
    fetchImages();
  }, []);

  const handleLike = async (videoId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/videos/${videoId}/like`
      );
      // Handle the response as needed
    } catch (error) {
      console.error("Error liking video:", error);
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

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/${userId}`
        );
        const fetchedUsername = response.data.name; // Adjust based on your response structure
        setUsername(fetchedUsername);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    const userId = localStorage.getItem("userId");

    if (userId) {
      // Fetch username only if userId is available
      fetchUsername();
    }
  }, []); // Run once when the component mounts

  const handleComment = async (videoId, commentText) => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId || !username) {
        console.error("Invalid user data");
        return;
      }

      const requestData = {
        user: {
          userId: username,
          name: username,
          // Include other user properties if needed
        },
        text: commentText,
      };

      const response = await axios.post(
        `http://localhost:5000/videos/${videoId}/comment`,
        requestData
      );

      // Assuming the response includes the updated comment data
      const { text, _id } = response.data;

      // Use the updated data as needed
      console.log(`Comment by ${username} (${userId}): ${text}`);

      // Handle the response if needed
    } catch (error) {
      console.error("Error commenting on video:", error);
      // Handle errors
    }
  };

  const handlePlay = async (videoId) => {
    try {
      console.log("Video is being played. Video ID:", videoId);

      const response = await axios.post(
        `http://localhost:5000/videos/${videoId}/play`
      );

      console.log("Play Response:", response.data);

      // Handle the response as needed
    } catch (error) {
      console.error("Error playing video:", error);
    }
  };

  useEffect(() => {
    // Fetch the user role from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const handleDelete = async (videoId) => {
    try {
      // Fetch the user role from localStorage
      const userRole = localStorage.getItem("role");

      // Check if the user is an admin or teamhead
      if (userRole === "admin" || userRole === "teamhead") {
        const response = await axios.delete(
          `http://localhost:5000/uploads/${videoId}`
        );

        console.log(response.data.message);

        // Optionally, you can update the state or perform other actions after deletion
      } else {
        console.log("You do not have the required role to delete the video.");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div>
      <div className="horizontal-scroll-container">
        {imageFiles && imageFiles.length > 0 ? (
          imageFiles.map((imageName, index) => (
            <div key={index} className="image-container">
              <img
                src={`http://localhost:5000/userProfileImages/${imageName}`}
                alt={`Uploaded ${index + 1}`}
                className="image"
              />
            </div>
          ))
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
      <div className="videos-container">
        {videos.map((video) => (
          <div key={video._id} className="media-container">
            <video
              width="500px"
              height="auto"
              controls
              onClick={() => handlePlay(video._id)}
              className="media"
            >
              <source
                src={`http://localhost:5000/uploads/${video.videoPath}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <p> Profile Name: {video.uploaderProfileName}</p>
            <p>{video.title}</p>
            <p>Likes: {video.likes}</p>
            <button onClick={() => handleLike(video._id)}>Like</button>
            <p>Views: {video.views}</p>
            <p>Comments:</p>
            {Array.isArray(video.comments) ? (
              <ul>
                {video.comments.map((comment, index) => (
                  <li key={index}>
                    <p>
                      {comment.user}: {comment.text}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments available.</p>
            )}
            <input
              type="text"
              placeholder="Your comment"
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={() => handleComment(video._id, commentText)}>
              Comment
            </button>

            {userRole === "admin" || userRole === "teamhead" ? (
              <button onClick={() => handleDelete(video._id)}>Delete</button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayPage;
