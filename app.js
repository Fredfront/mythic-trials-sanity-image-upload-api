const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = 8080;


app.use(express.json());

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

const baseUrl = `https://${projectId}.api.sanity.io/v${new Date().toISOString().slice(0, 10)}/assets/images/${dataset}`;

// Set up multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,  // 2MB file size limit
  },
}).single('image');

// Route to handle image upload
app.post('/uploadImage', upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const response = await fetch(`${baseUrl}?filename=${req.file.originalname}`, {
      method: 'POST',
      body: req.file.buffer, // Access file buffer directly from multer
      headers: {
        'Content-Type': req.file.mimetype,
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ message: 'Image uploaded', data });
    } else {
      res.status(response.status).json({ error: 'Failed to upload image', data });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
