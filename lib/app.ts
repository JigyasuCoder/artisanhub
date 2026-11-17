import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User, Artwork, CustomRequest, Auction } from './models.js';

dotenv.config();

// Fail fast if MongoDB is offline instead of buffering queries indefinitely
mongoose.set('bufferCommands', false);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_artisanhub_key_123!';
const MONGO_URI = (process.env.MONGO_URI || '').trim();

app.use(cors());
app.use(express.json());

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
    description:
      'Hand-painted serene sunset depiction of the Western Ghats range using thick palette knife technique with high-grade European pigments.',
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
    description:
      'Traditional eco-friendly terracotta artwork handcrafted locally by master heritage sculptors using kiln-fired riverbed clay.',
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
    description:
      'Detailed charcoal sketch capturing early morning bustle in historic South Bengaluru bazaar with raw chiaroscuro lighting.',
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
    description:
      'Futuristic neon digital rendering of tech hubs blended with iconic heritage banyan roots, printed on museum-grade rag paper.',
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
    description:
      'High-fired stoneware ceramic urn glazed with organic indigo mineral dyes and wood ash reduction firing.',
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
    description:
      'Intricately woven floral motifs using natural botanical madder and indigo dyes on pure heritage silk weave.',
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
    description:
      'Looking for a blue-gold themed modern abstract art piece (48x36 in) to complement warm indoor ambient lighting.',
    status: 'open',
    bids: [
      {
        id: 'bid-1',
        artistName: 'Rohan Verma',
        amount: 12000,
        daysEst: 8,
        proposal:
          'I can use metallic gold leaf accents over rich deep ultramarine acrylics on premium cotton canvas with a protective matte varnish.',
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

// In-memory store fallback when MongoDB is unavailable or unconfigured
interface MemUser {
  id: string;
  phone: string | null;
  email: string | null;
  password: string;
  role: string;
  name: string;
  location: string;
  bio: string;
  isVerified: boolean;
}

const memStore = {
  users: [] as MemUser[],
  artworks: SEED_ARTWORKS.map((art, i) => ({
    id: `art-${i + 1}`,
    _id: `art-${i + 1}`,
    ...art,
    createdAt: new Date(Date.now() - i * 60000).toISOString()
  })),
  requests: SEED_REQUESTS.map((req, i) => ({
    id: `req-${i + 1}`,
    _id: `req-${i + 1}`,
    ...req,
    createdAt: new Date(Date.now() - i * 60000).toISOString()
  })),
  auctions: SEED_AUCTIONS.map((auc, i) => ({
    id: `auc-${i + 1}`,
    _id: `auc-${i + 1}`,
    ...auc,
    endTime: auc.endTime.toISOString()
  }))
};

const cleanDigits = (val: string) => (val || '').replace(/\D/g, '');
const normalizeEmail = (val: string) => (val || '').trim().toLowerCase();

function phoneMatches(storedPhone: string | null, inputPhone: string): boolean {
  if (!storedPhone || !inputPhone) return false;
  if (storedPhone === inputPhone) return true;
  const d1 = cleanDigits(storedPhone);
  const d2 = cleanDigits(inputPhone);
  if (!d1 || !d2) return false;
  const l1 = d1.length >= 10 ? d1.slice(-10) : d1;
  const l2 = d2.length >= 10 ? d2.slice(-10) : d2;
  return l1 === l2;
}

function resolveDatabaseName(): string {
  const raw = (process.env.MONGO_DB_NAME || '').trim();
  if (!raw || raw.includes('://') || /[/\\.\s"$*<>:|?@]/.test(raw)) {
    return 'artisanhub';
  }
  return raw;
}

const DB_NAME = resolveDatabaseName();

const globalForMongo = globalThis as typeof globalThis & {
  __mongoConnectPromise?: Promise<typeof mongoose> | null;
  __mongoSeeded?: boolean;
  __mongoDisabled?: boolean;
};

async function seedIfEmpty() {
  if (globalForMongo.__mongoSeeded || mongoose.connection.readyState !== 1) return;
  try {
    const artCount = await Artwork.countDocuments();
    if (artCount === 0) {
      await Artwork.insertMany(SEED_ARTWORKS);
    }
    const reqCount = await CustomRequest.countDocuments();
    if (reqCount === 0) {
      await CustomRequest.insertMany(SEED_REQUESTS);
    }
    const aucCount = await Auction.countDocuments();
    if (aucCount === 0) {
      await Auction.insertMany(SEED_AUCTIONS);
    }
    globalForMongo.__mongoSeeded = true;
  } catch {
    // ignore seed errors
  }
}

export async function ensureMongoReady(): Promise<boolean> {
  if (!MONGO_URI || globalForMongo.__mongoDisabled) {
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!globalForMongo.__mongoConnectPromise) {
    globalForMongo.__mongoConnectPromise = mongoose
      .connect(MONGO_URI, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500
      })
      .then(async (conn) => {
        console.log(`Connected to MongoDB (Database: ${mongoose.connection.name})`);
        await seedIfEmpty();
        return conn;
      })
      .catch(() => {
        globalForMongo.__mongoDisabled = true;
        globalForMongo.__mongoConnectPromise = null;
        console.log('ArtisanHub running with in-memory data store.');
        throw new Error('MongoDB disabled');
      });
  }

  try {
    await globalForMongo.__mongoConnectPromise;
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  globalForMongo.__mongoConnectPromise = null;
});

// Database health check route
app.get('/api/db-status', async (_req: Request, res: Response) => {
  const mongoReady = await ensureMongoReady();
  let userCount = memStore.users.length;
  let artCount = memStore.artworks.length;
  let requestCount = memStore.requests.length;

  if (mongoReady) {
    try {
      [userCount, artCount, requestCount] = await Promise.all([
        User.countDocuments(),
        Artwork.countDocuments(),
        CustomRequest.countDocuments()
      ]);
    } catch {
      // ignore transient count error
    }
  }

  res.json({
    connected: true,
    mode: mongoReady ? 'mongodb' : 'in-memory',
    database: mongoReady
      ? mongoose.connection.name && !mongoose.connection.name.includes('://')
        ? mongoose.connection.name
        : DB_NAME
      : `${DB_NAME} (in-memory)`,
    host: mongoReady ? mongoose.connection.host || 'MongoDB' : 'local-memory',
    userCount,
    artCount,
    requestCount,
    serverTime: new Date().toISOString()
  });
});

// ==================== AUTH ROUTES ====================

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
    const targetRole = role || 'buyer';

    const ready = await ensureMongoReady();
    if (!ready) {
      const existing = memStore.users.find(
        (u) =>
          u.role === targetRole &&
          ((cleanPh && phoneMatches(u.phone, cleanPh)) || (normEmail && u.email === normEmail))
      );
      if (existing) {
        return res.status(400).json({
          message: `An account with this ${cleanPh ? 'phone number' : 'email'} is already registered as a ${targetRole}. Please Sign In instead.`
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: MemUser = {
        id: `usr-${Date.now()}`,
        phone: cleanPh,
        email: normEmail,
        password: hashedPassword,
        role: targetRole,
        name: (name && name.trim()) || (targetRole === 'artist' ? 'Master Artisan' : 'Art Connoisseur'),
        location: (location && location.trim()) || 'Bengaluru Local',
        bio: bio || '',
        isVerified: true
      };
      memStore.users.push(newUser);

      const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone,
          email: newUser.email,
          location: newUser.location,
          bio: newUser.bio,
          isVerified: newUser.isVerified
        }
      });
    }

    const existingQuery: any = { role: targetRole };
    if (cleanPh) {
      const digits = cleanDigits(cleanPh);
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      if (last10.length > 0) {
        const flexibleRegex = last10.split('').join('[\\s-]*');
        existingQuery.$or = [
          { phone: cleanPh },
          { phone: { $regex: flexibleRegex + '$', $options: 'i' } }
        ];
      } else {
        existingQuery.phone = cleanPh;
      }
    } else if (normEmail) {
      existingQuery.email = normEmail;
    }

    const existingUser = await User.findOne(existingQuery);
    if (existingUser) {
      return res.status(400).json({
        message: `An account with this ${cleanPh ? 'phone number' : 'email'} is already registered as a ${targetRole}. Please Sign In instead.`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      phone: cleanPh,
      email: normEmail,
      password: hashedPassword,
      role: targetRole,
      name: (name && name.trim()) || (targetRole === 'artist' ? 'Master Artisan' : 'Art Connoisseur'),
      location: (location && location.trim()) || 'Bengaluru Local',
      bio: bio || '',
      isVerified: true
    });

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
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

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

    const isDemoBuyer =
      (cleanDigits(cleanPh) === '9876543210' || normEmail === 'ananya.buyer@artisanhub.in') &&
      (password === 'buyer123' || password === 'demo123');
    const isDemoArtist =
      (cleanDigits(cleanPh) === '9845011223' || normEmail === 'rohan.artist@artisanhub.in') &&
      (password === 'artist123' || password === 'demo123');

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

    const ready = await ensureMongoReady();
    if (!ready) {
      const user = memStore.users.find(
        (u) =>
          (!role || u.role === role) &&
          ((cleanPh && phoneMatches(u.phone, cleanPh)) || (normEmail && u.email === normEmail))
      );

      if (!user) {
        return res.status(404).json({
          message: `Account not found for this ${cleanPh ? 'phone' : 'email'} with role "${role || 'selected'}". Please check credentials or Create Account.`
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password. Please verify and try again.' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          id: user.id,
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

    const query: any = {};
    if (role) query.role = role;

    if (cleanPh) {
      const digits = cleanDigits(cleanPh);
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      if (last10.length > 0) {
        const flexibleRegex = last10.split('').join('[\\s-]*');
        query.$or = [
          { phone: cleanPh },
          { phone: { $regex: flexibleRegex + '$', $options: 'i' } }
        ];
      } else {
        query.phone = cleanPh;
      }
    } else if (normEmail) {
      query.email = normEmail;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        message: `Account not found for this ${cleanPh ? 'phone' : 'email'} with role "${role || 'selected'}". Please check credentials or Create Account.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please verify and try again.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
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
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
});

// ==================== ARTWORKS ROUTES ====================

app.get('/api/artworks', async (_req: Request, res: Response) => {
  try {
    const ready = await ensureMongoReady();
    if (!ready) {
      return res.json(memStore.artworks);
    }

    let artworks = await Artwork.find().sort({ createdAt: -1 });
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
  } catch (err: any) {
    console.error('Fetch artworks error:', err);
    return res.status(500).json({ message: 'Failed to retrieve artworks from database' });
  }
});

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
      imageUrl:
        imageUrl && imageUrl.trim().length > 5
          ? imageUrl.trim()
          : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      location: location ? location.trim() : 'Bengaluru Local',
      likes: 1,
      featured: false
    };

    const ready = await ensureMongoReady();
    if (!ready) {
      const id = `art-${Date.now()}`;
      const newArt = {
        id,
        _id: id,
        ...artworkPayload,
        createdAt: new Date().toISOString()
      };
      memStore.artworks.unshift(newArt);
      return res.status(201).json(newArt);
    }

    const newArtwork = await Artwork.create(artworkPayload);
    return res.status(201).json({
      id: newArtwork._id.toString(),
      _id: newArtwork._id.toString(),
      ...artworkPayload,
      createdAt: newArtwork.createdAt
    });
  } catch (err: any) {
    console.error('Add artwork error:', err);
    return res.status(400).json({ message: err.message || 'Failed to list artwork' });
  }
});

app.patch('/api/artworks/:id/like', async (req: Request, res: Response) => {
  try {
    const delta = req.body?.liked ? 1 : -1;
    const ready = await ensureMongoReady();
    if (!ready) {
      const art = memStore.artworks.find((a) => a.id === req.params.id || a._id === req.params.id);
      if (!art) return res.status(404).json({ message: 'Artwork not found' });
      art.likes = Math.max(0, (art.likes || 0) + delta);
      return res.json({ id: art.id, likes: art.likes });
    }

    const updated = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: delta } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Artwork not found' });
    return res.json({ id: updated._id.toString(), likes: Math.max(0, updated.likes || 0) });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Failed to update likes' });
  }
});

// ==================== CUSTOM DEMANDS & BIDS ====================

app.get('/api/custom-requests', async (_req: Request, res: Response) => {
  try {
    const ready = await ensureMongoReady();
    if (!ready) {
      return res.json(memStore.requests);
    }

    let requests = await CustomRequest.find().sort({ createdAt: -1 });
    if (requests.length === 0) {
      await CustomRequest.insertMany(SEED_REQUESTS);
      requests = await CustomRequest.find().sort({ createdAt: -1 });
    }

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
  } catch (err: any) {
    console.error('Fetch custom requests error:', err);
    return res.status(500).json({ message: 'Failed to retrieve custom requests' });
  }
});

app.post('/api/custom-requests', async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      status: 'open',
      bids: []
    };

    const ready = await ensureMongoReady();
    if (!ready) {
      const id = `req-${Date.now()}`;
      const created = {
        id,
        _id: id,
        ...payload,
        createdAt: new Date().toISOString()
      };
      memStore.requests.unshift(created);
      return res.status(201).json(created);
    }

    const created = await CustomRequest.create(payload);
    return res.status(201).json({
      id: created._id.toString(),
      _id: created._id.toString(),
      ...payload,
      createdAt: created.createdAt
    });
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

    const ready = await ensureMongoReady();
    if (!ready) {
      const target = memStore.requests.find((r) => r.id === requestId || r._id === requestId);
      if (target) {
        target.bids = [bidObj, ...(target.bids || [])];
      }
      return res.status(201).json(bidObj);
    }

    if (requestId && mongoose.Types.ObjectId.isValid(requestId)) {
      await CustomRequest.findByIdAndUpdate(requestId, {
        $push: { bids: bidObj }
      });
    }
    return res.status(201).json(bidObj);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

app.patch('/api/custom-requests/:reqId/bids/:bidId/accept', async (req: Request, res: Response) => {
  try {
    const { reqId, bidId } = req.params;
    const ready = await ensureMongoReady();
    if (!ready) {
      const customReq = memStore.requests.find((r) => r.id === reqId || r._id === reqId);
      if (!customReq) return res.status(404).json({ message: 'Request not found' });
      customReq.status = 'in-progress';
      customReq.bids = (customReq.bids || []).map((b: any) => ({
        ...b,
        status: b.id === bidId ? 'Accepted' : b.status === 'Accepted' ? 'Accepted' : 'Pending'
      }));
      return res.json({ status: customReq.status, bids: customReq.bids });
    }

    if (!mongoose.Types.ObjectId.isValid(reqId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const customReq = await CustomRequest.findById(reqId);
    if (!customReq) return res.status(404).json({ message: 'Request not found' });

    customReq.status = 'in-progress';
    customReq.bids = (customReq.bids || []).map((b: any) => ({
      ...(b.toObject?.() || b),
      status: b.id === bidId ? 'Accepted' : b.status === 'Accepted' ? 'Accepted' : 'Pending'
    }));
    await customReq.save();

    return res.json({ status: customReq.status, bids: customReq.bids });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// ==================== AUCTIONS ====================

app.get('/api/auctions', async (_req: Request, res: Response) => {
  try {
    const ready = await ensureMongoReady();
    if (!ready) {
      return res.json(memStore.auctions);
    }

    let auctions = await Auction.find();
    if (auctions.length === 0) {
      await Auction.insertMany(SEED_AUCTIONS);
      auctions = await Auction.find();
    }

    return res.json(
      auctions.map(a => ({
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
      }))
    );
  } catch (err: any) {
    console.error('Fetch auctions error:', err);
    return res.status(500).json({ message: 'Failed to retrieve auctions' });
  }
});

app.post('/api/auctions/:id/bid', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const ready = await ensureMongoReady();
    if (!ready) {
      const auction = memStore.auctions.find((a) => a.id === req.params.id || a._id === req.params.id);
      if (!auction) return res.status(404).json({ message: 'Auction not found' });
      if (Number(amount) <= (auction.currentBid || 0)) {
        return res.status(400).json({ message: `Bid must be higher than current price (${auction.currentBid})` });
      }
      auction.currentBid = Number(amount);
      auction.bidsCount = (auction.bidsCount || 0) + 1;
      return res.json({
        id: auction.id,
        currentBid: auction.currentBid,
        bidsCount: auction.bidsCount
      });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    if (Number(amount) <= (auction.currentBid || 0)) {
      return res.status(400).json({ message: `Bid must be higher than current price (${auction.currentBid})` });
    }

    auction.currentBid = Number(amount);
    auction.bidsCount = (auction.bidsCount || 0) + 1;
    await auction.save();

    return res.json({
      id: auction._id.toString(),
      currentBid: auction.currentBid,
      bidsCount: auction.bidsCount
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// Express error-handling fallback for Mongoose / database errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (
    err?.name === 'MongooseError' ||
    err?.name === 'MongoNetworkError' ||
    err?.message?.includes('buffering timed out')
  ) {
    console.warn('[AI Studio] Database offline — returning mock empty response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  next(err);
});

export default app;
