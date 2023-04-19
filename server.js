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

app.get("/stream/:videoName", (req, res) => {
  const videoName = req.params.videoName;
  const videoPath = path.join(__dirname, "videos", videoName);

  // Check if video file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found");
  }

  // Get video stats (file size, etc.)
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // If a range header is present, parse it
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Calculate the chunk size and create the response headers
    const chunksize = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    // Set the response headers and stream the video file
    res.writeHead(206, headers);
    const fileStream = fs.createReadStream(videoPath, { start, end });
    fileStream.pipe(res);
  } else {
    // If no range header is present, set the response headers and stream the entire video file
    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, headers);
    const fileStream = fs.createReadStream(videoPath);
    fileStream.pipe(res);
  }
});


// Handle video download
app.get('/download/:videoName', (req, res) => {
  const videoName = req.params.videoName;
  const videoPath = path.join(__dirname, 'videos', videoName);

  // Check if video file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  // Set the response headers for downloading the video file
  res.setHeader('Content-disposition', `attachment; filename=${videoName}`);
  res.setHeader('Content-Type', 'video/mp4');

  // Stream the video file to the client
  const fileStream = fs.createReadStream(videoPath);
  fileStream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});