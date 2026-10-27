const mongoose = require('mongoose');

// User Schema (Phone Verification + Password)
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['artist', 'buyer'], required: true },
  name: { type: String, required: true },
  location: { type: String, default: 'Local Area' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Artwork Schema
const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  artistId: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  medium: String,
  dimensions: String,
  description: String,
  imageUrl: { type: String, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

// Custom Demand Request Schema
const customRequestSchema = new mongoose.Schema({
  buyerName: { type: String, required: true },
  title: { type: String, required: true },
  category: String,
  budgetMin: Number,
  budgetMax: Number,
  deadline: String,
  description: String,
  location: String,
  status: { type: String, default: 'open' }
}, { timestamps: true });

// Artist Bids Schema
const bidSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomRequest', required: true },
  artistName: String,
  amount: { type: Number, required: true },
  daysEst: Number,
  proposal: String
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
  User: mongoose.model('User', userSchema),
  Artwork: mongoose.model('Artwork', artworkSchema),
  CustomRequest: mongoose.model('CustomRequest', customRequestSchema),
  Bid: mongoose.model('Bid', bidSchema),
  Auction: mongoose.model('Auction', auctionSchema)
};