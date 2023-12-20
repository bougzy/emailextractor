// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

// MongoDB connection
try {
  mongoose.connect('mongodb+srv://emailextractor:emailextractor@emailextractor.ar6lq8i.mongodb.net/emailextractor', {
  });
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('Error connecting to MongoDB:', error);
}

const emailSchema = new mongoose.Schema({
  email: String,
});

const Email = mongoose.model('Email', emailSchema);

app.post('/extract-emails', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const emails = [];

    // Extract emails (This is a simple regex, you may need a more robust one)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const text = $('body').text();
    const extractedEmails = text.match(emailRegex);

    if (extractedEmails) {
      extractedEmails.forEach((email) => {
        emails.push({ email });
      });

      // Save emails to MongoDB
      await Email.insertMany(emails);
      res.json({ success: true, message: 'Emails extracted and saved successfully.' });
    } else {
      res.json({ success: false, message: 'No emails found on the given URL.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.get('/emails', async (req, res) => {
  try {
    const emails = await Email.find({}, { _id: 0, __v: 0 });
    res.json(emails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
