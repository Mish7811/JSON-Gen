const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Your Google Apps Script URL (kept secret here)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuBR4EVXxjXoOTCuGcmKNrZhWQiirs9NdW09jiO-_sLdAWrJscSHVq7JwBvGXl6O5i/exec';

// Proxy endpoint
app.post('/api/submit', async (req, res) => {
  try {
    const response = await axios.post(SCRIPT_URL, req.body);
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
