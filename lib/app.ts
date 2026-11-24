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

function cleanEnvVal(val?: string): string {
  return (val || '').trim().replace(/^(['"])(.*)\1$/, '$2').trim();
}

function getMsg91Config() {
  const widgetId = cleanEnvVal(
    process.env.MSG91_WIDGET_ID ||
      process.env.VITE_MSG91_WIDGET_ID ||
      process.env.OTP_WIDGET_ID ||
      process.env.WIDGET_ID
  );
  const tokenAuth = cleanEnvVal(
    process.env.MSG91_TOKEN_AUTH ||
      process.env.VITE_MSG91_TOKEN_AUTH ||
      process.env.MSG91_AUTH_TOKEN ||
      process.env.TOKEN_AUTH ||
      process.env.MSG91_TOKEN
  );
  const authkey = cleanEnvVal(
    process.env.MSG91_AUTHKEY ||
      process.env.MSG91_AUTH_KEY ||
      process.env.MSG91_API_KEY ||
      process.env.AUTHKEY
  );
  return { widgetId, tokenAuth, authkey };
}

app.use(cors());
app.use(express.json());

const DEFAULT_ARTWORK_IMAGE =
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80';
const DEFAULT_AUCTION_IMAGE =
  'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80';

function normalizeArtworkImageUrl(rawUrl?: string, fallback = DEFAULT_ARTWORK_IMAGE): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return fallback;

  // Unwrap Google Images search result links (?imgurl=...) to the actual image URL
  if (/google\.[^/]+\/imgres/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const inner = parsed.searchParams.get('imgurl');
      if (inner && /^https?:\/\//i.test(inner)) {
        return inner;
      }
    } catch {
      // fall through
    }
  }

  // Replace known 404 Unsplash URLs from earlier seed templates
  if (trimmed.includes('photo-1579783902614-a3fb3927b675')) {
    return DEFAULT_ARTWORK_IMAGE;
  }
  if (trimmed.includes('photo-1561839561-b13bcfe95249')) {
    return DEFAULT_AUCTION_IMAGE;
  }

  if (/^(https?:\/\/|\/|data:image\/)/i.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

const SEED_ARTWORKS = [
  {
    title: 'Sunset over Western Ghats',
    artist: 'Rohan Verma',
    category: 'Oil Painting',
    price: 12500,
    medium: 'Canvas & Oil',
    dimensions: '24x36 in',
    location: 'Indiranagar, Bengaluru',
    imageUrl: DEFAULT_ARTWORK_IMAGE,
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
    imageUrl: DEFAULT_AUCTION_IMAGE,
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
  return raw.toLowerCase();
}

let activeDbName = resolveDatabaseName();

const globalForMongo = globalThis as typeof globalThis & {
  __mongoConnectPromise?: Promise<typeof mongoose> | null;
  __mongoSeeded?: boolean;
};

function extractExistingDbCase(err: any): string | null {
  const msg = String(err?.message || err?.errmsg || '');
  const match = msg.match(/already have:\s*\[([^\]]+)\]/i);
  return match?.[1]?.trim() || null;
}

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
  } catch (e: any) {
    const existingDb = extractExistingDbCase(e);
    if (existingDb && existingDb !== activeDbName) {
      console.warn(`Switching MongoDB database casing from "${activeDbName}" to "${existingDb}"`);
      activeDbName = existingDb;
      globalForMongo.__mongoConnectPromise = null;
      await mongoose.disconnect().catch(() => {});
      await ensureMongoReady();
      return;
    }
    console.warn('Seed check error:', e?.message || e);
  }
}

export async function ensureMongoReady(): Promise<boolean> {
  if (!MONGO_URI) {
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // If connection dropped, closed, or is disconnecting, clear any stale cached promise
  if (mongoose.connection.readyState !== 2) {
    globalForMongo.__mongoConnectPromise = null;
    if (mongoose.connection.readyState === 3) {
      await mongoose.disconnect().catch(() => {});
    }
  }

  const connectOnce = async (): Promise<boolean> => {
    if (mongoose.connection.readyState === 1) return true;

    if (!globalForMongo.__mongoConnectPromise) {
      globalForMongo.__mongoConnectPromise = mongoose
        .connect(MONGO_URI, {
          dbName: activeDbName,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10
        })
        .then(async (conn) => {
          console.log(`✅ Connected to MongoDB Atlas (Database: ${mongoose.connection.name})`);
          await seedIfEmpty();
          return conn;
        })
        .catch((err) => {
          globalForMongo.__mongoConnectPromise = null;
          console.error('❌ MongoDB Atlas connection error:', err?.message || err);
          throw err;
        });
    }

    try {
      await globalForMongo.__mongoConnectPromise;
      const connected = mongoose.connection.readyState === 1;
      if (!connected) {
        globalForMongo.__mongoConnectPromise = null;
      }
      return connected;
    } catch {
      globalForMongo.__mongoConnectPromise = null;
      return false;
    }
  };

  if (await connectOnce()) {
    return true;
  }

  // Retry once on transient serverless cold-start or Atlas handshake failure
  return connectOnce();
}

mongoose.connection.on('disconnected', () => {
  globalForMongo.__mongoConnectPromise = null;
});
mongoose.connection.on('close', () => {
  globalForMongo.__mongoConnectPromise = null;
});
mongoose.connection.on('error', () => {
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
    connected: mongoReady,
    mode: mongoReady ? 'mongodb' : 'in-memory',
    database: mongoReady
      ? mongoose.connection.name && !mongoose.connection.name.includes('://')
        ? mongoose.connection.name
        : activeDbName
      : `${activeDbName} (in-memory)`,
    host: mongoReady ? mongoose.connection.host || 'MongoDB Atlas' : 'local-memory',
    userCount,
    artCount,
    requestCount,
    serverTime: new Date().toISOString()
  });
});

// ==================== OTP & AUTH ROUTES ====================

app.get('/api/otp/config', (_req: Request, res: Response) => {
  const { widgetId, tokenAuth, authkey } = getMsg91Config();
  return res.json({
    configured: Boolean(widgetId && tokenAuth),
    widgetId,
    tokenAuth,
    hasAuthKey: Boolean(authkey)
  });
});

function extractVerifiedIdentifier(data: any): string {
  const rawMsg = data?.message;
  const nestedId =
    data?.data?.mobile ||
    data?.data?.email ||
    data?.data?.identifier ||
    data?.mobile ||
    data?.email ||
    data?.identifier ||
    (typeof rawMsg === 'object' && rawMsg !== null
      ? rawMsg.mobile || rawMsg.email || rawMsg.identifier
      : '');
  const msgString =
    typeof rawMsg === 'string' && !/^(otp|access token)?\s*verified(\s+successfully)?$/i.test(rawMsg.trim())
      ? rawMsg.trim()
      : '';
  return String(nestedId || msgString || '').trim();
}

async function verifyAccessTokenWithMsg91(
  accessToken: string,
  config: { widgetId: string; tokenAuth: string; authkey: string }
): Promise<
  | { ok: true; verifiedIdentifier: string }
  | { ok: false; status: number; message: string; code: string }
> {
  const { widgetId, tokenAuth, authkey } = config;
  const attempts: Array<{ url: string; headers: Record<string, string>; body: Record<string, string> }> = authkey
    ? [
        {
          url: 'https://api.msg91.com/api/v5/widget/verifyAccessToken',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json', authkey },
          body: { 'access-token': accessToken }
        },
        {
          url: 'https://control.msg91.com/api/v5/widget/verifyAccessToken',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json', authkey },
          body: { authkey, 'access-token': accessToken }
        }
      ]
    : [
        {
          url: 'https://api.msg91.com/api/v5/widget/verifyAccessToken',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: { widgetId, tokenAuth, 'access-token': accessToken }
        }
      ];

  let lastStatus = 401;
  let lastData: any = {};

  for (const attempt of attempts) {
    const res = await fetch(attempt.url, {
      method: 'POST',
      headers: attempt.headers,
      body: JSON.stringify(attempt.body)
    });
    const data: any = await res.json().catch(() => ({}));
    lastStatus = res.status;
    lastData = data;
    if (res.ok && data?.type === 'success' && data?.message) {
      const verifiedIdentifier = extractVerifiedIdentifier(data);
      if (verifiedIdentifier) {
        return { ok: true, verifiedIdentifier };
      }
    }
  }

  console.warn('MSG91 verifyAccessToken failed:', lastStatus, lastData);
  const rawErr =
    (typeof lastData?.message === 'string' && lastData.message) ||
    lastData?.error ||
    `MSG91 OTP token verification failed (HTTP ${lastStatus}).`;
  return {
    ok: false,
    status: lastStatus,
    message: rawErr,
    code: String(lastData?.code || '').trim()
  };
}

app.post('/api/auth/verify-otp-code', async (req: Request, res: Response) => {
  try {
    const otp = String(req.body?.otp || '').trim();
    const reqId = String(req.body?.reqId || '').trim();
    const expectedIdentifier = String(req.body?.identifier || '').trim();

    if (!otp || !reqId) {
      return res.status(400).json({ message: 'OTP code and MSG91 request ID are required.' });
    }
    if (!expectedIdentifier) {
      return res.status(400).json({ message: 'Phone number or email identifier is required.' });
    }

    const config = getMsg91Config();
    if (!config.widgetId || !config.tokenAuth) {
      return res.status(503).json({
        message: 'MSG91_WIDGET_ID and MSG91_TOKEN_AUTH are not configured on the server.'
      });
    }

    // Verify the OTP directly from backend against MSG91 Widget API using widgetId + tokenAuth
    const verifyRes = await fetch('https://api.msg91.com/api/v5/widget/verifyOtp', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        tokenAuth: config.tokenAuth
      },
      body: JSON.stringify({
        tokenAuth: config.tokenAuth,
        widgetId: config.widgetId,
        otp,
        reqId
      })
    });

    const data: any = await verifyRes.json().catch(() => ({}));
    const isSuccess =
      verifyRes.ok &&
      (data?.type === 'success' || /otp verified successfully/i.test(String(data?.message || '')));

    if (!isSuccess) {
      const errMsg =
        (typeof data?.message === 'string' && data.message) ||
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors[0]?.message || data.errors[0] : '') ||
        'Invalid or expired OTP. Please check the code and try again.';
      return res.status(401).json({ message: errMsg });
    }

    const rawJwt =
      data?.['access-token'] ||
      data?.accessToken ||
      data?.token ||
      (typeof data?.message === 'string' && data.message.trim().split('.').length === 3
        ? data.message.trim()
        : '');

    let verifiedIdentifier = '';

    // If authkey is also configured and passes, use MSG91 verifyAccessToken as an extra check
    if (rawJwt && config.authkey) {
      const tokenCheck = await verifyAccessTokenWithMsg91(rawJwt, config);
      if (tokenCheck.ok) {
        verifiedIdentifier = tokenCheck.verifiedIdentifier;
      }
    }

    // Check any identifier claims inside the JWT returned directly from api.msg91.com over TLS
    if (!verifiedIdentifier && rawJwt) {
      const decodedPayload = jwt.decode(rawJwt) as Record<string, any> | null;
      const claimId = String(
        decodedPayload?.mobile ||
          decodedPayload?.phone ||
          decodedPayload?.mobileNumber ||
          decodedPayload?.email ||
          decodedPayload?.identifier ||
          ''
      ).trim();
      if (claimId) {
        verifiedIdentifier = claimId;
      }
    }

    if (verifiedIdentifier) {
      const isEmail = expectedIdentifier.includes('@');
      const matches = isEmail
        ? normalizeEmail(verifiedIdentifier) === normalizeEmail(expectedIdentifier)
        : phoneMatches(verifiedIdentifier, expectedIdentifier);
      if (!matches) {
        return res.status(403).json({
          message: 'Verified OTP identifier does not match the submitted phone number or email.'
        });
      }
    } else {
      verifiedIdentifier = expectedIdentifier;
    }

    const otpVerificationToken = jwt.sign(
      {
        otpVerified: true,
        identifier: verifiedIdentifier
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({
      verified: true,
      identifier: verifiedIdentifier,
      otpVerificationToken
    });
  } catch (err: any) {
    console.error('MSG91 verifyOtp error:', err);
    return res.status(500).json({ message: err?.message || 'Failed to verify OTP with MSG91.' });
  }
});

app.post('/api/auth/verify-otp-token', async (req: Request, res: Response) => {
  try {
    const accessToken = (req.body?.accessToken || req.body?.['access-token'] || '').trim();
    const expectedIdentifier = (req.body?.identifier || '').trim();

    if (!accessToken) {
      return res.status(400).json({ message: 'MSG91 access token is required.' });
    }

    const config = getMsg91Config();
    if (!config.authkey && (!config.widgetId || !config.tokenAuth)) {
      return res.status(503).json({
        message: 'MSG91 credentials (MSG91_AUTHKEY or MSG91_WIDGET_ID/MSG91_TOKEN_AUTH) are not configured on the server.'
      });
    }

    const result = await verifyAccessTokenWithMsg91(accessToken, config);
    if (!result.ok) {
      if (!config.authkey && /auth|201|401/i.test(`${result.message} ${result.code}`)) {
        return res.status(503).json({
          message:
            'Server is missing MSG91_AUTHKEY in Secrets. MSG91 requires your account Authkey (MSG91 Dashboard → Authkey) to verify OTP tokens on the backend.'
        });
      }

      if (config.authkey && config.tokenAuth && config.authkey === config.tokenAuth) {
        return res.status(401).json({
          message:
            'MSG91_AUTHKEY in Secrets is set to the same value as MSG91_TOKEN_AUTH. Replace MSG91_AUTHKEY with your account Authkey from MSG91 Dashboard → Authkey.'
        });
      }

      if (result.code === '207') {
        return res.status(401).json({
          message:
            'MSG91 error 207 (Invalid authentication key): verify MSG91_AUTHKEY in Secrets matches an active Authkey from MSG91 Dashboard → Authkey (not your widget tokenAuth), with Admin/Owner rule and IP Security off.'
        });
      }

      if (config.authkey && /auth|ip|whitelist|201|401|418/i.test(`${result.message} ${result.code}`)) {
        return res.status(401).json({
          message: `MSG91 verification failed (${result.message}). Verify MSG91_AUTHKEY in Secrets and disable IP Security/Whitelisting in MSG91 Dashboard → Authkey.`
        });
      }

      return res.status(401).json({ message: result.message });
    }

    const verifiedIdentifier = result.verifiedIdentifier;

    if (expectedIdentifier) {
      const isEmail = expectedIdentifier.includes('@');
      const matches = isEmail
        ? normalizeEmail(verifiedIdentifier) === normalizeEmail(expectedIdentifier)
        : phoneMatches(verifiedIdentifier, expectedIdentifier);
      if (!matches) {
        return res.status(403).json({
          message: 'Verified OTP identifier does not match the submitted phone number or email.'
        });
      }
    }

    const otpVerificationToken = jwt.sign(
      {
        otpVerified: true,
        identifier: verifiedIdentifier
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({
      verified: true,
      identifier: verifiedIdentifier,
      otpVerificationToken
    });
  } catch (err: any) {
    console.error('MSG91 verifyAccessToken error:', err);
    return res.status(500).json({ message: err?.message || 'Failed to verify OTP with MSG91.' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { phone, email, password, role, name, location, bio, otpVerificationToken } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!phone && !email) {
      return res.status(400).json({ message: 'Phone or Email is required' });
    }

    const normEmail = email ? normalizeEmail(email) : null;
    const cleanPh = phone ? phone.trim() : null;
    const targetRole = role || 'buyer';

    if (!otpVerificationToken) {
      return res.status(403).json({
        message: 'OTP verification is required before creating an account.'
      });
    }

    try {
      const decoded = jwt.verify(otpVerificationToken, JWT_SECRET) as {
        otpVerified?: boolean;
        identifier?: string;
      };
      if (!decoded?.otpVerified || !decoded?.identifier) {
        return res.status(403).json({ message: 'Invalid OTP verification proof.' });
      }
      const matchesSubmitted = cleanPh
        ? phoneMatches(decoded.identifier, cleanPh)
        : normEmail
          ? normalizeEmail(decoded.identifier) === normEmail
          : false;
      if (!matchesSubmitted) {
        return res.status(403).json({
          message: 'Verified phone/email does not match registration details. Please re-verify OTP.'
        });
      }
    } catch {
      return res.status(403).json({
        message: 'OTP verification expired or invalid. Please verify your OTP again.'
      });
    }

    const ready = await ensureMongoReady();
    if (!ready) {
      if (MONGO_URI) {
        return res.status(503).json({
          message: 'MongoDB Atlas is temporarily unavailable. Please retry in a moment.'
        });
      }
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
      if (MONGO_URI) {
        return res.status(503).json({
          message: 'MongoDB Atlas is temporarily unavailable. Please retry in a moment.'
        });
      }
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
      if (MONGO_URI) {
        return res.status(503).json({
          message: 'MongoDB Atlas is temporarily unavailable. Please try again.'
        });
      }
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
      imageUrl: normalizeArtworkImageUrl(art.imageUrl),
      location: art.location,
      likes: art.likes || 0,
      featured: art.featured || false,
      createdAt: art.createdAt
    }));
    return res.json(mapped);
  } catch (err: any) {
    if (MONGO_URI) {
      console.error('Fetch artworks MongoDB error:', err?.message || err);
      return res.status(503).json({
        message: 'Failed to load artworks from MongoDB Atlas. Please retry.'
      });
    }
    console.warn('Fetch artworks fallback to in-memory:', err?.message || err);
    return res.json(memStore.artworks);
  }
});

app.post('/api/artworks', async (req: Request, res: Response) => {
  try {
    const { title, artist, category, price, medium, dimensions, description, imageUrl, location } = req.body;

    if (!title || !price || !category || Number(price) <= 0) {
      return res.status(400).json({ message: 'Valid title, category, and positive price are required' });
    }

    const artworkPayload = {
      title: title.trim(),
      artist: (artist || 'Local Artisan').trim(),
      category: category.trim(),
      price: Number(price),
      medium: medium ? medium.trim() : 'Canvas & Acrylic',
      dimensions: dimensions ? dimensions.trim() : 'Standard',
      description: description ? description.trim() : '',
      imageUrl: normalizeArtworkImageUrl(imageUrl),
      location: location ? location.trim() : 'Bengaluru Local',
      likes: 1,
      featured: false
    };

    const ready = await ensureMongoReady();
    if (!ready) {
      if (MONGO_URI) {
        return res.status(503).json({
          message: 'MongoDB Atlas is temporarily unavailable. Your artwork was not saved—please try publishing again.'
        });
      }
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
      if (MONGO_URI) {
        return res.status(503).json({ message: 'MongoDB Atlas is temporarily unavailable.' });
      }
      const art = memStore.artworks.find((a) => a.id === req.params.id || a._id === req.params.id);
      if (!art) return res.status(404).json({ message: 'Artwork not found' });
      art.likes = Math.max(0, (art.likes || 0) + delta);
      return res.json({ id: art.id, likes: art.likes });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid artwork ID' });
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
      if (MONGO_URI) {
        return res.status(503).json({ message: 'MongoDB Atlas is temporarily unavailable.' });
      }
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
    if (MONGO_URI) {
      console.error('Fetch custom requests MongoDB error:', err?.message || err);
      return res.status(503).json({ message: 'Failed to load custom requests from MongoDB Atlas.' });
    }
    console.warn('Fetch custom requests fallback to in-memory:', err?.message || err);
    return res.json(memStore.requests);
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
      if (MONGO_URI) {
        return res.status(503).json({ message: 'MongoDB Atlas is temporarily unavailable.' });
      }
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
    if (!Number(amount) || Number(amount) <= 0 || !Number(daysEst) || Number(daysEst) <= 0) {
      return res.status(400).json({ message: 'Valid bid amount and estimated days are required' });
    }
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
      if (MONGO_URI) {
        return res.status(503).json({ message: 'MongoDB Atlas is temporarily unavailable.' });
      }
      const target = memStore.requests.find((r) => r.id === requestId || r._id === requestId);
      if (!target) return res.status(404).json({ message: 'Custom request not found' });
      target.bids = [bidObj, ...(target.bids || [])];
      return res.status(201).json(bidObj);
    }

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Valid request ID is required' });
    }

    const updatedReq = await CustomRequest.findByIdAndUpdate(
      requestId,
      { $push: { bids: bidObj } },
      { new: true }
    );
    if (!updatedReq) return res.status(404).json({ message: 'Custom request not found' });
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
      if (MONGO_URI) {
        return res.status(503).json({ message: 'MongoDB Atlas is temporarily unavailable.' });
      }
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
      if (MONGO_URI) {
        return res.status(503).json({ message: 'MongoDB Atlas is temporarily unavailable.' });
      }
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
        imageUrl: normalizeArtworkImageUrl(a.imageUrl, DEFAULT_AUCTION_IMAGE),
        bidsCount: a.bidsCount
      }))
    );
  } catch (err: any) {
    if (MONGO_URI) {
      console.error('Fetch auctions MongoDB error:', err?.message || err);
      return res.status(503).json({ message: 'Failed to load auctions from MongoDB Atlas.' });
    }
    console.warn('Fetch auctions fallback to in-memory:', err?.message || err);
    return res.json(memStore.auctions);
  }
});

app.post('/api/auctions/:id/bid', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const ready = await ensureMongoReady();
    if (!ready) {
      if (MONGO_URI) {
        return res.status(503).json({ message: 'MongoDB Atlas is temporarily unavailable.' });
      }
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

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid auction ID' });
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
