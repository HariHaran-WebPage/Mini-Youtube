const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema({
  profileImage: String,
  // Add other fields if necessary
});

const Img = mongoose.model("Img", imgSchema);

module.exports = Img;
