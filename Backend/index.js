require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SCRIPT_URL = process.env.SCRIPT_URL;

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
