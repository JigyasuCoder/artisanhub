require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Artwork, CustomRequest, Bid, Auction } = require('./models/Schemas');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, role, name, location } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: 'Phone already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ phone, password: hashedPassword, role, name, location, isVerified: true });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role, phone: user.phone, location: user.location } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password, role } = req.body;
    const user = await User.findOne({ phone, role });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, phone: user.phone, location: user.location } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MARKETPLACE ROUTES ====================

// Get all products
app.get('/api/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add artwork (Artist)
app.post('/api/artworks', async (req, res) => {
  try {
    const artwork = await Artwork.create(req.body);
    res.status(201).json(artwork);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get buyer custom requests
app.get('/api/custom-requests', async (req, res) => {
  try {
    const requests = await CustomRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a new buyer request
app.post('/api/custom-requests', async (req, res) => {
  try {
    const newReq = await CustomRequest.create(req.body);
    res.status(201).json(newReq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submit a bid (Artist)
app.post('/api/bids', async (req, res) => {
  try {
    const newBid = await Bid.create(req.body);
    res.status(201).json(newBid);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get auctions
app.get('/api/auctions', async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend server running on http://localhost:${PORT}`));