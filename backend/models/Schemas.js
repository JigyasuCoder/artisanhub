const mongoose = require('mongoose');

// User Schema (Email or Phone Verification + Password)
const userSchema = new mongoose.Schema({
  phone: { type: String, default: null, sparse: true },
  email: { type: String, default: null, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['artist', 'buyer'], required: true },
  name: { type: String, required: true },
  location: { type: String, default: 'Bengaluru Local' },
  bio: { type: String, default: '' },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

// Artwork Schema
const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  artistId: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  medium: { type: String, default: 'Canvas & Mixed Medium' },
  dimensions: { type: String, default: 'Custom' },
  description: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  location: { type: String, required: true },
  likes: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// Custom Demand Request Schema
const customRequestSchema = new mongoose.Schema({
  buyerName: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Modern Art' },
  budgetMin: { type: Number, default: 5000 },
  budgetMax: { type: Number, default: 20000 },
  deadline: String,
  description: String,
  location: { type: String, default: 'Bengaluru' },
  status: { type: String, default: 'open' },
  bids: [{
    id: String,
    artistName: String,
    amount: Number,
    daysEst: Number,
    proposal: String,
    status: { type: String, default: 'Pending' },
    timestamp: { type: String, default: 'Just now' }
  }]
}, { timestamps: true });

// Artist Bids Schema (for standalone queries if needed)
const bidSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  artistName: String,
  amount: { type: Number, required: true },
  daysEst: Number,
  proposal: String,
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

// Auction Schema
const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  category: String,
  startingBid: Number,
  currentBid: Number,
  endTime: Date,
  imageUrl: String,
  bidsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Artwork: mongoose.models.Artwork || mongoose.model('Artwork', artworkSchema),
  CustomRequest: mongoose.models.CustomRequest || mongoose.model('CustomRequest', customRequestSchema),
  Bid: mongoose.models.Bid || mongoose.model('Bid', bidSchema),
  Auction: mongoose.models.Auction || mongoose.model('Auction', auctionSchema)
};