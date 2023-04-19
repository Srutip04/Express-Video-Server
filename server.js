const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Handling video upload
app.post("/upload", (req, res) => {
  const file = req.files.video;

  // Save the uploaded video file to disk
  file.mv(path.join(__dirname, "videos", file.name), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading file");
    }
    return res.send("File uploaded successfully");
  });
});

//Video Streaming
