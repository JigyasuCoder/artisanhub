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

// Connect to MongoDB Atlas if MONGO_URI is configured
const MONGO_URI = (process.env.MONGO_URI || '').trim();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_artisanhub_key_123!';
const rawDbName = (process.env.MONGO_DB_NAME || '').trim();
const DB_NAME = (!rawDbName || rawDbName.includes('://') || /[/\\.\s"$*<>:|?@]/.test(rawDbName)) ? 'artisanhub' : rawDbName.toLowerCase();

mongoose.set('bufferCommands', false);
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { dbName: DB_NAME })
    .then(() => console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.name))
    .catch(err => console.warn('⚠️ MongoDB not connected:', err.message));
} else {
  console.warn('⚠️ MONGO_URI not set — running without MongoDB');
}

const cleanDigits = (val) => (val || '').replace(/\D/g, '');
const normalizeEmail = (val) => (val || '').trim().toLowerCase();
const cleanEnvVal = (val) => (val || '').trim().replace(/^(['"])(.*)\1$/, '$2').trim();

function phoneMatches(storedPhone, inputPhone) {
  if (!storedPhone || !inputPhone) return false;
  if (storedPhone === inputPhone) return true;
  const d1 = cleanDigits(storedPhone);
  const d2 = cleanDigits(inputPhone);
  if (!d1 || !d2) return false;
  const l1 = d1.length >= 10 ? d1.slice(-10) : d1;
  const l2 = d2.length >= 10 ? d2.slice(-10) : d2;
  return l1 === l2;
}

function getMsg91Config() {
  return {
    widgetId: cleanEnvVal(
      process.env.MSG91_WIDGET_ID ||
        process.env.VITE_MSG91_WIDGET_ID ||
        process.env.OTP_WIDGET_ID ||
        process.env.WIDGET_ID
    ),
    tokenAuth: cleanEnvVal(
      process.env.MSG91_TOKEN_AUTH ||
        process.env.VITE_MSG91_TOKEN_AUTH ||
        process.env.MSG91_AUTH_TOKEN ||
        process.env.TOKEN_AUTH ||
        process.env.MSG91_TOKEN
    ),
    authkey: cleanEnvVal(
      process.env.MSG91_AUTHKEY ||
        process.env.MSG91_AUTH_KEY ||
        process.env.MSG91_API_KEY ||
        process.env.AUTHKEY
    )
  };
}

app.get('/api/db-status', async (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  let userCount = 0;
  let artCount = 0;
  if (ready) {
    try {
      userCount = await User.countDocuments();
      artCount = await Artwork.countDocuments();
    } catch {
      // ignore
    }
  }
  res.json({
    connected: ready,
    database: mongoose.connection.name || 'artisanhub',
    userCount,
    artCount
  });
});

// ==================== OTP & AUTH ROUTES ====================

app.get('/api/otp/config', (_req, res) => {
  const { widgetId, tokenAuth, authkey } = getMsg91Config();
  res.json({
    configured: Boolean(widgetId && tokenAuth),
    widgetId,
    tokenAuth,
    hasAuthKey: Boolean(authkey)
  });
});

app.post('/api/auth/verify-otp-code', async (req, res) => {
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

    const data = await verifyRes.json().catch(() => ({}));
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
    if (rawJwt) {
      const decodedPayload = jwt.decode(rawJwt);
      const claimId = String(
        decodedPayload?.mobile ||
          decodedPayload?.phone ||
          decodedPayload?.mobileNumber ||
          decodedPayload?.email ||
          decodedPayload?.identifier ||
          ''
      ).trim();
      if (claimId) verifiedIdentifier = claimId;
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
      { otpVerified: true, identifier: verifiedIdentifier },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ verified: true, identifier: verifiedIdentifier, otpVerificationToken });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to verify OTP with MSG91.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, email, password, role, name, location, bio, otpVerificationToken } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!phone && !email) return res.status(400).json({ message: 'Phone or Email is required' });

    const normEmail = email ? normalizeEmail(email) : null;
    const cleanPh = phone ? phone.trim() : null;

    if (!otpVerificationToken) {
      return res.status(403).json({ message: 'OTP verification is required before creating an account.' });
    }

    try {
      const decoded = jwt.verify(otpVerificationToken, JWT_SECRET);
      if (!decoded?.otpVerified || !decoded?.identifier) {
        return res.status(403).json({ message: 'Invalid OTP verification proof.' });
      }
      const matchesSubmitted = cleanPh
        ? phoneMatches(decoded.identifier, cleanPh)
        : normEmail
          ? normalizeEmail(decoded.identifier) === normEmail
          : false;
      if (!matchesSubmitted) {
        return res.status(403).json({ message: 'Verified phone/email does not match registration details.' });
      }
    } catch {
      return res.status(403).json({ message: 'OTP verification expired or invalid. Please verify your OTP again.' });
    }

    let existingQuery = { role: role || 'buyer' };
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
      return res.status(400).json({ message: `An account with this ${cleanPh ? 'phone' : 'email'} is already registered as a ${role}.` });
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
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, email, password, role } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!phone && !email) return res.status(400).json({ message: 'Phone or Email is required' });

    const normEmail = email ? normalizeEmail(email) : '';
    const cleanPh = phone ? phone.trim() : '';

    // Demo account matching
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

    let query = {};
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

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ message: `Account not found for this ${cleanPh ? 'phone' : 'email'} with role "${role || 'selected'}". Please check credentials or Create Account.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password. Please verify and try again.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
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
  } catch (err) {
    res.status(500).json({ message: err.message });
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
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend server running on http://0.0.0.0:${PORT}`));