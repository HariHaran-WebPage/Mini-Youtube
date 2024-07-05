const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  uploaderProfileName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  videoPath: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      user: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
    },
  ],
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
