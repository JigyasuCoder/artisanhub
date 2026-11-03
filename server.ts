import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
// @ts-ignore
import schemas from './backend/models/Schemas.js';
const { User, Artwork, CustomRequest, Auction } = schemas;

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_artisanhub_key_123!';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://aprameyapnk1_db_user:vMnImo2531T7fJbX@cluster0.foxp3dd.mongodb.net/artisanhub?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json());

// Complete starter collection for MongoDB Atlas
const SEED_ARTWORKS = [
  {
    title: 'Sunset over Western Ghats',
    artist: 'Rohan Verma',
    category: 'Oil Painting',
    price: 12500,
    medium: 'Canvas & Oil',
    dimensions: '24x36 in',
    location: 'Indiranagar, Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    description: 'Hand-painted serene sunset depiction of the Western Ghats range using thick palette knife technique with high-grade European pigments.',
    likes: 42,
    featured: true
  },
  {
    title: 'Terracotta Sculpted Mask',
    artist: 'Priya Nair',
    category: 'Sculpture',
    price: 4500,
    medium: 'Natural Clay & Mineral Glaze',
    dimensions: '12x8 in',
    location: 'Koramangala, Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional eco-friendly terracotta artwork handcrafted locally by master heritage sculptors using kiln-fired riverbed clay.',
    likes: 29,
    featured: false
  },
  {
    title: 'Monochromes of Old Market',
    artist: 'Arjun Das',
    category: 'Sketch',
    price: 3200,
    medium: 'Charcoal on Archival Paper',
    dimensions: '18x24 in',
    location: 'Jayanagar, Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=800&q=80',
    description: 'Detailed charcoal sketch capturing early morning bustle in historic South Bengaluru bazaar with raw chiaroscuro lighting.',
    likes: 67,
    featured: false
  },
  {
    title: 'Cyberpunk Bengaluru Skyline',
    artist: 'Kavya Rao',
    category: 'Digital Art',
    price: 8500,
    medium: 'Giclée Print Edition 1/10',
    dimensions: '20x30 in',
    location: 'Whitefield, Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Futuristic neon digital rendering of tech hubs blended with iconic heritage banyan roots, printed on museum-grade rag paper.',
    likes: 88,
    featured: true
  },
  {
    title: 'Handmade Glazed Ceramic Urn',
    artist: 'Suresh Hegde',
    category: 'Ceramics',
    price: 6000,
    medium: 'Stoneware Clay & Indigo Ash',
    dimensions: '14x10 in',
    location: 'HSR Layout, Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    description: 'High-fired stoneware ceramic urn glazed with organic indigo mineral dyes and wood ash reduction firing.',
    likes: 35,
    featured: false
  },
  {
    title: 'Brocade Lotus Tapestry',
    artist: 'Ananya Deshpande',
    category: 'Textile Art',
    price: 11000,
    medium: 'Hand-loomed Tussar Silk',
    dimensions: '30x40 in',
    location: 'Sadashivanagar, Bengaluru',
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
    description: 'Intricately woven floral motifs using natural botanical madder and indigo dyes on pure heritage silk weave.',
    likes: 54,
    featured: false
  }
];

const SEED_REQUESTS = [
  {
    buyerName: 'Aditya Rao',
    title: 'Custom Abstract Canvas for Living Room',
    category: 'Modern Art',
    budgetMin: 8000,
    budgetMax: 15000,
    deadline: '2026-11-15',
    location: 'HSR Layout, Bengaluru',
    description: 'Looking for a blue-gold themed modern abstract art piece (48x36 in) to complement warm indoor ambient lighting.',
    status: 'open',
    bids: [
      {
        id: 'bid-1',
        artistName: 'Rohan Verma',
        amount: 12000,
        daysEst: 8,
        proposal: 'I can use metallic gold leaf accents over rich deep ultramarine acrylics on premium cotton canvas with a protective matte varnish.',
        status: 'Pending',
        timestamp: '1 day ago'
      }
    ]
  }
];

const SEED_AUCTIONS = [
  {
    title: 'Heritage Brass Sculpted Idol - Edition 1/5',
    artist: 'Master Craft Guild',
    category: 'Limited Edition',
    currentBid: 28000,
    startingBid: 15000,
    endTime: new Date(Date.now() + 86400000),
    imageUrl: 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?auto=format&fit=crop&w=800&q=80',
    bidsCount: 12
  },
  {
    title: 'Gold-Foil Tanjore Painting - Royal Durbar',
    artist: 'Venkatesh S.',
    category: 'Heritage Craft',
    currentBid: 45000,
    startingBid: 25000,
    endTime: new Date(Date.now() + 172800000),
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
    bidsCount: 19
  }
];

// Helper to check live MongoDB Atlas connection readyState (1 = connected)
const isMongoReady = () => mongoose.connection.readyState === 1;

// Normalization helpers for reliable cross-device lookup
const cleanDigits = (val: string) => (val || '').replace(/\D/g, '');
const normalizeEmail = (val: string) => (val || '').trim().toLowerCase();

// Connect to MongoDB Atlas
console.log('🔄 Initiating connection to MongoDB Atlas...');
const DB_NAME = process.env.MONGO_DB_NAME || 'artisanhub';
mongoose.connect(MONGO_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    console.log(`✅ Connected to MongoDB Atlas (Database: ${mongoose.connection.name})`);

    // Auto-seed collection if empty
    try {
      const artCount = await Artwork.countDocuments();
      if (artCount === 0) {
        await Artwork.insertMany(SEED_ARTWORKS);
        console.log('🎨 Seeded 6 initial artworks to MongoDB Atlas');
      }
      const reqCount = await CustomRequest.countDocuments();
      if (reqCount === 0) {
        await CustomRequest.insertMany(SEED_REQUESTS);
        console.log('📋 Seeded initial custom demands to MongoDB Atlas');
      }
      const aucCount = await Auction.countDocuments();
      if (aucCount === 0) {
        await Auction.insertMany(SEED_AUCTIONS);
        console.log('🔨 Seeded initial auctions to MongoDB Atlas');
      }
    } catch (e) {
      console.warn('Seed check error:', e);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  });

mongoose.connection.on('connected', () => console.log('📡 MongoDB connection is LIVE'));
mongoose.connection.on('error', (e) => console.error('⚠️ MongoDB connection warning:', e.message));
mongoose.connection.on('disconnected', () => console.warn('🔌 MongoDB connection disconnected'));

// Database health check route
app.get('/api/db-status', async (_req: Request, res: Response) => {
  const ready = isMongoReady();
  let userCount = 0;
  let artCount = 0;
  let requestCount = 0;

  if (ready) {
    try {
      userCount = await User.countDocuments();
      artCount = await Artwork.countDocuments();
      requestCount = await CustomRequest.countDocuments();
    } catch {
      // ignore
    }
  }

  res.json({
    connected: ready,
    database: mongoose.connection.name || 'artisanhub',
    host: mongoose.connection.host || 'MongoDB Atlas',
    userCount,
    artCount,
    requestCount,
    serverTime: new Date().toISOString()
  });
});


// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { phone, email, password, role, name, location, bio } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!phone && !email) {
      return res.status(400).json({ message: 'Phone or Email is required' });
    }

    const normEmail = email ? normalizeEmail(email) : null;
    const cleanPh = phone ? phone.trim() : null;

    // Check existing in MongoDB Atlas or memory
    if (isMongoReady()) {
      let existingQuery: any = { role };
      if (cleanPh) {
        const digits = cleanDigits(cleanPh);
        const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
        const flexibleRegex = last10.split('').join('[\\s-]*');
        existingQuery.$or = [
          { phone: cleanPh },
          { phone: { $regex: flexibleRegex + '$', $options: 'i' } }
        ];
      } else if (normEmail) {
        existingQuery.email = normEmail;
      }

      const existingUser = await User.findOne(existingQuery);
      if (existingUser) {
        return res.status(400).json({ 
          message: `An account with this ${cleanPh ? 'phone number' : 'email'} is already registered as a ${role}. Please Sign In instead.` 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        phone: cleanPh,
        email: normEmail,
        password: hashedPassword,
        role: role || 'buyer',
        name: name || (role === 'artist' ? 'Master Artisan' : 'Art Connoisseur'),
        location: location || 'Bengaluru Local',
        bio: bio || '',
        isVerified: true
      });

      console.log(`✅ Registered new ${role} in MongoDB Atlas (${mongoose.connection.name}):`, user._id, user.name);

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          role: user.role,
          phone: user.phone,
          email: user.email,
          location: user.location,
          bio: user.bio,
          isVerified: user.isVerified
        }
      });
    } else {
      // Memory fallback if MongoDB down
      const digits = cleanDigits(cleanPh || '');
      const existing = memoryUsers.find(u => {
        const phMatch = cleanPh && cleanDigits(u.phone).slice(-10) === digits.slice(-10);
        const emMatch = normEmail && normalizeEmail(u.email) === normEmail;
        return (phMatch || emMatch) && u.role === role;
      });
      if (existing) {
        return res.status(400).json({ message: 'User already registered. Please Sign In.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        _id: `usr-${Date.now()}`,
        phone: cleanPh,
        email: normEmail,
        password: hashedPassword,
        role: role || 'buyer',
        name: name || (role === 'artist' ? 'Master Artisan' : 'Art Connoisseur'),
        location: location || 'Bengaluru Local',
        bio: bio || '',
        isVerified: true
      };
      memoryUsers.push(user);
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          phone: user.phone,
          email: user.email,
          location: user.location,
          bio: user.bio,
          isVerified: user.isVerified
        }
      });
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

// Login - Checks credentials accurately across devices
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { phone, email, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!phone && !email) {
      return res.status(400).json({ message: 'Phone or Email is required' });
    }

    const normEmail = email ? normalizeEmail(email) : '';
    const cleanPh = phone ? phone.trim() : '';

    // Support standard test accounts
    const isDemoBuyer = (cleanDigits(cleanPh) === '9876543210' || normEmail === 'ananya.buyer@artisanhub.in') && (password === 'buyer123' || password === 'demo123');
    const isDemoArtist = (cleanDigits(cleanPh) === '9845011223' || normEmail === 'rohan.artist@artisanhub.in') && (password === 'artist123' || password === 'demo123');

    if (isDemoBuyer || isDemoArtist) {
      const demoRole = isDemoArtist ? 'artist' : 'buyer';
      const demoUser = {
        id: demoRole === 'artist' ? 'usr-art-1' : 'usr-101',
        name: demoRole === 'artist' ? 'Rohan Verma' : 'Ananya Sharma',
        role: demoRole,
        phone: demoRole === 'artist' ? '+91 98450 11223' : '+91 98765 43210',
        email: demoRole === 'artist' ? 'rohan.artist@artisanhub.in' : 'ananya.buyer@artisanhub.in',
        location: demoRole === 'artist' ? 'Indiranagar, Bengaluru' : 'Koramangala, Bengaluru',
        isVerified: true
      };
      const token = jwt.sign({ id: demoUser.id, role: demoUser.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: demoUser });
    }

    let user: any = null;

    if (isMongoReady()) {
      let query: any = {};
      if (role) query.role = role;

      if (cleanPh) {
        const digits = cleanDigits(cleanPh);
        const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
        const flexibleRegex = last10.split('').join('[\\s-]*');
        query.$or = [
          { phone: cleanPh },
          { phone: { $regex: flexibleRegex + '$', $options: 'i' } }
        ];
      } else if (normEmail) {
        query.email = normEmail;
      }

      user = await User.findOne(query);
    } else {
      const digits = cleanDigits(cleanPh);
      user = memoryUsers.find(u => {
        const phMatch = cleanPh && cleanDigits(u.phone).slice(-10) === digits.slice(-10);
        const emMatch = normEmail && normalizeEmail(u.email) === normEmail;
        const roleMatch = !role || u.role === role;
        return (phMatch || emMatch) && roleMatch;
      });
    }

    if (!user) {
      return res.status(404).json({ 
        message: `Account not found for this ${cleanPh ? 'phone' : 'email'} with role "${role || 'selected'}". Please check credentials or Create Account.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please verify and try again.' });
    }

    const token = jwt.sign({ id: user._id || user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: (user._id || user.id).toString(),
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email,
        location: user.location,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
});

// ==================== ARTWORKS ROUTES (MONGODB) ====================

// Get all artworks from MongoDB Atlas
app.get('/api/artworks', async (_req: Request, res: Response) => {
  try {
    if (isMongoReady()) {
      let artworks = await Artwork.find().sort({ createdAt: -1 });
      
      // Auto-seed if collection is empty
      if (artworks.length === 0) {
        await Artwork.insertMany(SEED_ARTWORKS);
        artworks = await Artwork.find().sort({ createdAt: -1 });
      }

      const mapped = artworks.map(art => ({
        id: art._id.toString(),
        _id: art._id.toString(),
        title: art.title,
        artist: art.artist,
        category: art.category,
        price: art.price,
        medium: art.medium || 'Canvas & Mixed Medium',
        dimensions: art.dimensions || 'Custom Size',
        description: art.description,
        imageUrl: art.imageUrl,
        location: art.location,
        likes: art.likes || 0,
        featured: art.featured || false,
        createdAt: art.createdAt
      }));
      return res.json(mapped);
    } else {
      return res.json(memoryArtworks);
    }
  } catch (err: any) {
    console.error('Fetch artworks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve artworks from database' });
  }
});

// Enlist new artwork (Artist) -> Persists directly to MongoDB Atlas
app.post('/api/artworks', async (req: Request, res: Response) => {
  try {
    const { title, artist, category, price, medium, dimensions, description, imageUrl, location } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Title, category, and price are required' });
    }

    const artworkPayload = {
      title: title.trim(),
      artist: (artist || 'Local Artisan').trim(),
      category: category.trim(),
      price: Number(price),
      medium: medium ? medium.trim() : 'Canvas & Acrylic',
      dimensions: dimensions ? dimensions.trim() : 'Standard',
      description: description ? description.trim() : '',
      imageUrl: imageUrl && imageUrl.trim().length > 5 
        ? imageUrl.trim() 
        : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      location: location ? location.trim() : 'Bengaluru Local',
      likes: 1,
      featured: false
    };

    if (isMongoReady()) {
      const newArtwork = await Artwork.create(artworkPayload);
      console.log(`✅ Saved artwork to MongoDB Atlas (${mongoose.connection.name}):`, newArtwork._id, newArtwork.title);
      return res.status(201).json({
        id: newArtwork._id.toString(),
        _id: newArtwork._id.toString(),
        ...artworkPayload,
        createdAt: newArtwork.createdAt
      });
    } else {
      console.warn('⚠️ MongoDB not connected at enlistment time; adding to memory fallback');
      const item = {
        id: `art-${Date.now()}`,
        _id: `art-${Date.now()}`,
        ...artworkPayload,
        createdAt: new Date().toISOString()
      };
      memoryArtworks.unshift(item);
      return res.status(201).json(item);
    }
  } catch (err: any) {
    console.error('Add artwork error:', err);
    return res.status(400).json({ message: err.message || 'Failed to list artwork' });
  }
});

// ==================== CUSTOM DEMANDS & BIDS ====================

app.get('/api/custom-requests', async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected) {
      const requests = await CustomRequest.find().sort({ createdAt: -1 });
      const mapped = requests.map(r => ({
        id: r._id.toString(),
        _id: r._id.toString(),
        buyerName: r.buyerName,
        title: r.title,
        category: r.category,
        budgetMin: r.budgetMin,
        budgetMax: r.budgetMax,
        deadline: r.deadline,
        description: r.description,
        location: r.location,
        status: r.status,
        bids: r.bids || [],
        createdAt: r.createdAt
      }));
      return res.json(mapped);
    }
    return res.json(memoryRequests);
  } catch {
    return res.json(memoryRequests);
  }
});

app.post('/api/custom-requests', async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      status: 'open',
      bids: []
    };
    if (isMongoConnected) {
      const created = await CustomRequest.create(payload);
      return res.status(201).json({
        id: created._id.toString(),
        _id: created._id.toString(),
        ...payload,
        createdAt: created.createdAt
      });
    }
    const memReq = { id: `req-${Date.now()}`, _id: `req-${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
    memoryRequests.unshift(memReq);
    return res.status(201).json(memReq);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

app.post('/api/bids', async (req: Request, res: Response) => {
  try {
    const { requestId, artistName, amount, daysEst, proposal } = req.body;
    const bidObj = {
      id: `bid-${Date.now()}`,
      artistName: artistName || 'Local Artisan',
      amount: Number(amount),
      daysEst: Number(daysEst),
      proposal: proposal || '',
      status: 'Pending',
      timestamp: 'Just now'
    };

    if (isMongoConnected && requestId) {
      await CustomRequest.findByIdAndUpdate(requestId, {
        $push: { bids: bidObj }
      });
      return res.status(201).json(bidObj);
    }
    return res.status(201).json(bidObj);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// ==================== AUCTIONS ====================

app.get('/api/auctions', async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected) {
      const auctions = await Auction.find();
      return res.json(auctions.map(a => ({
        id: a._id.toString(),
        _id: a._id.toString(),
        title: a.title,
        artist: a.artist,
        category: a.category,
        startingBid: a.startingBid,
        currentBid: a.currentBid,
        endTime: a.endTime,
        imageUrl: a.imageUrl,
        bidsCount: a.bidsCount
      })));
    }
    return res.json(SEED_AUCTIONS);
  } catch {
    return res.json(SEED_AUCTIONS);
  }
});

// ==================== VITE SPA SETUP ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ ArtisanHub Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
