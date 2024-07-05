const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Video = require("./model/ProfileModel");
const Img = require("./model/Imgmodel");
const User = require("./model/Adminmodel");
const fs = require("fs");
const Image = require("./model/Imgmodel");

const app = express();
app.use(bodyParser.json());

const port = 5000;

// Connect to MongoDB
mongoose
  .connect("mongodb://0.0.0.0:27017", {
    dbName: "UserData",
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Allow CORS
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title } = req.body;
    const videoPath = req.file.filename; // Use the generated filename

    // Retrieve uploader profile name from local storage
    const userId = req.headers.authorization; // Assuming you store the userId in the authorization header

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Retrieve user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const uploaderProfileName = user.name; // Assuming the user object has a 'name' property

    const newVideo = new Video({
      uploaderProfileName,
      title,
      videoPath,
    });

    await newVideo.save();

    res.json({ message: "Video uploaded successfully!", videoPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Fetch all videos
app.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find();

    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/videos/:id/like", async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { likes: 1 },
      },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json({ likes: video.likes });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/videos/:id/comment", async (req, res) => {
  try {
    const videoId = req.params.id;
    const { user, text } = req.body;

    // Check if the user object or userId is undefined
    if (!user || !user.userId) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    // Retrieve the video from the database
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Ensure that video.comments is an array of objects; if not, initialize it
    if (!Array.isArray(video.comments) || video.comments.length === 0) {
      video.comments = [];
    }

    // Push the new comment to the comments array
    video.comments.push({
      user: user.userId,
      text: text,
    });

    // Save the video with the new comment
    await video.save();

    // Respond with the updated comments array
    res.json({ comments: video.comments });
  } catch (error) {
    console.error("Error commenting on video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Play a video (increment views)
app.post("/videos/:id/play", async (req, res) => {
  try {
    const videoId = req.params.id;
    console.log("Video ID:", videoId);

    // Retrieve the video from the database
    const video = await Video.findById(videoId);
    console.log("Video:", video);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Increment the views
    video.views += 1;
    console.log("Updated Views:", video.views);

    // Save the video with the updated views
    await video.save();

    // Respond with the updated views count
    res.json({ views: video.views });
  } catch (error) {
    console.error("Error playing video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update views, likes, and comments on a video
app.get("/videos/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    video.views += 1;
    await video.save();

    res.json({
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      uploaderProfileName: video.uploaderProfileName,
      title: video.title,
      videoPath: video.videoPath,
    });
  } catch (error) {
    console.error("Error updating views:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a video by ID
app.delete("/uploads/:id", async (req, res) => {
  try {
    const videoId = req.params.id;

    // Find the video by ID
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Delete the video from the database
    await Video.findByIdAndDelete(videoId);

    // Optionally, you can delete associated files or perform other cleanup

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const storageForImages = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "userProfileImages"));
  },
  filename: function (req, file, cb) {
    // Generate a unique name for the image
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const uploadForImages = multer({ storage: storageForImages });

app.post("/uploadImage", uploadForImages.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const imagePath = req.file.filename; // Use the generated filename

    // You can save the image information to your database if needed
    // For simplicity, this example does not save image details to the database

    res.json({ message: "Image uploaded successfully!", imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use(
  "/userProfileImages",
  express.static(path.join(__dirname, "userProfileImages"))
);

app.get("/getImageList", (req, res) => {
  // Logic to fetch and send the list of image filenames
  const imageDir = path.join(__dirname, "userProfileImages");

  fs.readdir(imageDir, (err, files) => {
    if (err) {
      console.error("Error reading image directory:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const imageList = files.map((file) => file);
      res.json(imageList);
    }
  });
});

// PROFILE IMG

const storageImages = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "ProfileImages"));
  },
  filename: function (req, file, cb) {
    // Generate a unique name for the image
    const Name = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const exit = path.extname(file.originalname);
    cb(null, Name + exit);
  },
});
const uploadImages = multer({ storage: storageImages });

app.post("/upload/image", uploadImages.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { title } = req.body;
    const userId = req.headers.authorization;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const uploaderProfileName = user.name;
    const imagePath = req.file.filename;

    // Save image details to the database if needed
    // For simplicity, this example does not save image details to the database

    res.json({
      message: "Image uploaded successfully!",
      title,
      uploaderProfileName,
      imagePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/images/:id/like", async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findByIdAndUpdate(
      imageId,
      {
        $inc: { likes: 1 },
      },
      { new: true }
    );

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({ likes: image.likes });
  } catch (error) {
    console.error("Error liking image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/images/:id/comment", async (req, res) => {
  try {
    const imageId = req.params.id;
    const { user, text } = req.body;

    // Check if the user object or userId is undefined
    if (!user || !name) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    // Retrieve the image from the database
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Ensure that image.comments is an array of objects; if not, initialize it
    if (!Array.isArray(image.comments) || image.comments.length === 0) {
      image.comments = [];
    }

    // Push the new comment to the comments array
    image.comments.push({
      user: name,
      text: text,
    });

    // Save the image with the new comment
    await image.save();

    // Respond with the updated comments array
    res.json({ comments: image.comments });
  } catch (error) {
    console.error("Error commenting on image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// View an image (increment views)
app.post("/images/:id/view", async (req, res) => {
  try {
    const imageId = req.params.id;
    console.log("Image ID:", imageId);

    // Retrieve the image from the database
    const image = await Image.findById(imageId);
    console.log("Image:", image);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Increment the views
    image.views += 1;
    console.log("Updated Views:", image.views);

    // Save the image with the updated views
    await image.save();

    // Respond with the updated views count
    res.json({ views: image.views });
  } catch (error) {
    console.error("Error viewing image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all images with likes, views, and comments
app.get("/images", async (req, res) => {
  try {
    // Retrieve all images from the database
    const images = await Image.find();

    // If no images found, return empty array
    if (!images || images.length === 0) {
      return res.json([]);
    }

    // Map through each image and retrieve additional details
    const imagesWithDetails = await Promise.all(
      images.map(async (image) => {
        // Retrieve likes count
        const likes = image.likes;

        // Retrieve views count
        const views = image.views;

        // Retrieve comments
        const comments = image.comments;

        // Return image details with additional information
        return {
          _id: image._id,
          title: image.title,
          uploaderProfileName: image.uploaderProfileName,
          imagePath: image.imagePath,
          likes: likes,
          views: views,
          comments: comments,
        };
      })
    );

    // Respond with images along with their details
    res.json(imagesWithDetails);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use(
  "/ProfileImages",
  express.static(path.join(__dirname, "ProfileImages"))
);

app.get("/ImageList", (req, res) => {
  // Logic to fetch and send the list of image filenames
  const imageDir = path.join(__dirname, "ProfileImages");

  fs.readdir(imageDir, (err, files) => {
    if (err) {
      console.error("Error reading image directory:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const imageList = files.map((file) => file);
      res.json(imageList);
    }
  });
});

// Use the router for the '/upload' route
const Admin = require("./route/Adminroute");
const Login = require("./route/Loginroute");
const Forgot = require("./route/Forgotpass");

app.use("/", Admin);
app.use("/", Login);
app.use("/", Forgot);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
