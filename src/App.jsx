import React, { useState, useEffect } from 'react';
import { 
  Shield, MapPin, Plus, Phone, User, Gavel, 
  CheckCircle2, Sparkles, Clock, Briefcase,
  Eye, Check, Calendar, LogOut, Database, RefreshCw,
  ShoppingCart, Trash2, Minus, Zap, Pencil, X
} from 'lucide-react';
import SearchFilterBar from './components/SearchFilterBar';
import AuthPage from './components/AuthPage';
import ArtGalleryGrid from './components/ArtGalleryGrid';
import CheckoutPage from './components/CheckoutPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';

// Full-Stack API Endpoint (routes through unified Express server)
const API_BASE_URL = "/api";

// Verified fallback artwork/auction images + Google imgres URL normalizer
const DEFAULT_ARTWORK_IMAGE =
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80';
const DEFAULT_AUCTION_IMAGE =
  'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80';

const normalizeImageUrl = (rawUrl, fallback = DEFAULT_ARTWORK_IMAGE) => {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return fallback;
  if (/google\.[^/]+\/imgres/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const inner = parsed.searchParams.get('imgurl');
      if (inner && /^https?:\/\//i.test(inner)) return inner;
    } catch {
      // fall through
    }
  }
  if (trimmed.includes('photo-1579783902614-a3fb3927b675')) return DEFAULT_ARTWORK_IMAGE;
  if (trimmed.includes('photo-1561839561-b13bcfe95249')) return DEFAULT_AUCTION_IMAGE;
  return /^(https?:\/\/|\/|data:image\/)/i.test(trimmed) ? trimmed : fallback;
};

// INITIAL MOCK DATA SETS
const INITIAL_ARTWORKS = [
  { 
    id: 'art-1', 
    title: 'Sunset over Western Ghats', 
    artist: 'Rohan Verma', 
    category: 'Oil Painting', 
    price: 12500, 
    medium: 'Canvas & Oil', 
    dimensions: '24x36 in', 
    location: 'Indiranagar, Bengaluru', 
    imageUrl: DEFAULT_ARTWORK_IMAGE, 
    description: 'Hand-painted serene sunset depiction of the Western Ghats range using thick palette knife technique with high-grade European pigments.',
    likes: 42,
    featured: true
  },
  { 
    id: 'art-2', 
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
    id: 'art-3', 
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
    id: 'art-4', 
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
    id: 'art-5', 
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
    id: 'art-6', 
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

const INITIAL_BUYER_REQUESTS = [
  { 
    id: 'req-1', 
    buyerId: 'usr-aditya-rao',
    buyerName: 'Aditya Rao', 
    title: 'Custom Abstract Canvas for Living Room', 
    category: 'Modern Art', 
    budgetMin: 8000, 
    budgetMax: 15000, 
    deadline: '2026-11-15', 
    location: 'HSR Layout, Bengaluru', 
    description: 'Looking for a blue-gold themed modern abstract art piece (48x36 in) to complement warm indoor ambient lighting.',
    status: 'open',
    createdAt: 'Yesterday at 4:30 PM',
    bids: [
      { 
        id: 'bid-1', 
        artistName: 'Rohan Verma', 
        amount: 12000, 
        daysEst: 8, 
        proposal: 'I can use metallic gold leaf accents over rich deep ultramarine acrylics on premium cotton canvas with a protective matte varnish.',
        status: 'Pending',
        timestamp: '1 day ago'
      },
      { 
        id: 'bid-2', 
        artistName: 'Kavya Rao', 
        amount: 9500, 
        daysEst: 5, 
        proposal: 'I will create a high-resolution mixed media texture with geometric fluid dynamics and subtle golden highlights.',
        status: 'Pending',
        timestamp: '6 hours ago'
      }
    ]
  },
  { 
    id: 'req-2', 
    buyerId: 'usr-meera-deshmukh',
    buyerName: 'Meera Deshmukh', 
    title: 'Hand-Carved Wooden Temple Arch', 
    category: 'Sculpture', 
    budgetMin: 20000, 
    budgetMax: 35000, 
    deadline: '2026-12-01', 
    location: 'Malleshwaram, Bengaluru', 
    description: 'Need a traditional teakwood carved miniature temple frame with intricate floral border details and natural wood polish finish.',
    status: 'in-progress',
    createdAt: '3 days ago',
    bids: [
      { 
        id: 'bid-3', 
        artistName: 'Priya Nair', 
        amount: 28000, 
        daysEst: 14, 
        proposal: 'Crafted using seasoned Rosewood with hand-rubbed natural beeswax polish finish and authentic temple lattice work.',
        status: 'Accepted',
        timestamp: '2 days ago'
      }
    ]
  }
];

const INITIAL_AUCTIONS = [
  { 
    id: 'auc-1', 
    title: 'Heritage Brass Sculpted Idol - Edition 1/5', 
    artist: 'Master Craft Guild', 
    category: 'Limited Edition', 
    currentBid: 28000, 
    startingBid: 15000, 
    endTime: new Date(Date.now() + 86400000).toISOString(), 
    imageUrl: DEFAULT_AUCTION_IMAGE, 
    bidsCount: 12,
    description: 'Lost-wax casting method heritage sculpture with custom serial engraving and physical certificate of authenticity signed by artisan guild.'
  },
  { 
    id: 'auc-2', 
    title: 'Gold-Foil Tanjore Painting - Royal Durbar', 
    artist: 'Venkatesh S.', 
    category: 'Heritage Craft', 
    currentBid: 45000, 
    startingBid: 25000, 
    endTime: new Date(Date.now() + 172800000).toISOString(), 
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80', 
    bidsCount: 19,
    description: '22-carat gold foil studded with unpolished semi-precious Jaipur rubies mounted in a reclaimed teakwood ornate frame.'
  }
];

export default function App() {
  // Current user persona and authentication state with persistent storage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('artisanhub_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved user:', e);
    }
    return {
      id: 'usr-101',
      name: 'Ananya Sharma',
      role: 'buyer', // 'buyer' or 'artist'
      phone: '+91 98765 43210',
      email: 'ananya.buyer@artisanhub.in',
      isVerified: true,
      location: 'Koramangala, Bengaluru',
      bio: 'Passionate local art collector focusing on contemporary Indian acrylics and traditional handmade pottery.',
      joinedDate: 'March 2024'
    };
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'demands' | 'auctions' | 'profile' | 'future'
  
  // App Data States with persistent cache
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('artisanhub_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((art) => ({ ...art, imageUrl: normalizeImageUrl(art.imageUrl) }));
        }
      }
    } catch (e) {
      console.warn('Error reading cached artworks:', e);
    }
    return INITIAL_ARTWORKS;
  });

  const [buyerRequests, setBuyerRequests] = useState(() => {
    try {
      const cached = localStorage.getItem('artisanhub_requests_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading cached requests:', e);
    }
    return INITIAL_BUYER_REQUESTS;
  });

  const [auctions, setAuctions] = useState(INITIAL_AUCTIONS);
  const [likedArtworks, setLikedArtworks] = useState(() => {
    try {
      const saved = localStorage.getItem('artisanhub_liked_artworks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState(100000);
  const [sortBy, setSortBy] = useState('default');
  const [demandsFilter, setDemandsFilter] = useState('all'); // 'all' | 'open' | 'in-progress'

  // Authentication Gate State - Persistent UI flag, session verified via HttpOnly cookie / in-memory JWT
  const [authToken, setAuthToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('artisanhub_is_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  // Modal & View Control States
  const [isAuthViewOpen, setIsAuthViewOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddArtOpen, setIsAddArtOpen] = useState(false);
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [activeBidModalItem, setActiveBidModalItem] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Cart, Checkout & Payment Gateway States
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('artisanhub_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutFromCart, setCheckoutFromCart] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState(null);
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('artisanhub_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form Input States
  const [newArtForm, setNewArtForm] = useState({
    title: '', category: 'Oil Painting', price: '', medium: '', dimensions: '', description: '', imageUrl: ''
  });
  const [newReqForm, setNewReqForm] = useState({
    title: '', category: 'Modern Art', budgetMin: '', budgetMax: '', deadline: '', description: ''
  });
  const [bidForm, setBidForm] = useState({
    amount: '', daysEst: '', proposal: ''
  });
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSubmittingArt, setIsSubmittingArt] = useState(false);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(() => currentUser?.name || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(() => currentUser?.bio || '');

  // Database Connection Info
  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'connecting', database: 'artisanhub', checked: false });

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper function to format prices in INR (₹)
  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;
  const formatPostedDate = (val) => {
    if (!val) return 'Recent';
    const d = new Date(val);
    if (!Number.isNaN(d.getTime()) && String(val).includes('T')) {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return String(val);
  };

  // Fetch latest catalog, requests, and auctions directly from MongoDB Atlas
  const fetchMarketplaceData = () => {
    fetch(`${API_BASE_URL}/artworks`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((art) => ({
            ...art,
            imageUrl: normalizeImageUrl(art.imageUrl)
          }));
          setProducts(normalized);
          const highest = Math.max(100000, ...normalized.map((art) => Number(art.price || 0)));
          setMaxPriceFilter((prev) => (prev === 100000 ? highest : prev));
          try {
            localStorage.setItem('artisanhub_products_cache', JSON.stringify(normalized));
          } catch (e) {
            console.warn(e);
          }
        }
      })
      .catch((err) => console.log("Using cached artworks:", err.message));

    fetch(`${API_BASE_URL}/custom-requests`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBuyerRequests(data);
          try {
            localStorage.setItem('artisanhub_requests_cache', JSON.stringify(data));
          } catch (e) {
            console.warn(e);
          }
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/auctions`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAuctions(
            data.map((auc) => ({
              ...auc,
              imageUrl: normalizeImageUrl(auc.imageUrl, DEFAULT_AUCTION_IMAGE)
            }))
          );
        }
      })
      .catch(() => {});
  };

  // Check live MongoDB Atlas status
  const checkDbStatus = (refreshData = false) => {
    fetch(`${API_BASE_URL}/db-status`)
      .then(res => res.json())
      .then(data => {
        const isConnected = !!data.connected;
        setDbStatus({
          connected: isConnected,
          mode: data.mode || (isConnected ? 'mongodb' : 'in-memory'),
          database: data.database || 'artisanhub',
          checked: true
        });
        if (refreshData && isConnected) {
          fetchMarketplaceData();
        }
      })
      .catch(() => setDbStatus({ connected: false, mode: 'offline', database: 'offline', checked: true }));
  };

  // Fetch initial data and poll db-status until MongoDB Atlas or in-memory store is ready
  useEffect(() => {
    let isMounted = true;
    let timerId;

    const pollStatus = () => {
      fetch(`${API_BASE_URL}/db-status`)
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return;
          const isConnected = !!data.connected;
          const isInMemory = data.mode === 'in-memory';
          setDbStatus({
            connected: isConnected,
            mode: data.mode || (isConnected ? 'mongodb' : 'in-memory'),
            database: data.database || 'artisanhub',
            checked: true
          });
          if (isConnected) {
            fetchMarketplaceData();
          } else if (!isInMemory) {
            timerId = setTimeout(pollStatus, 3000);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setDbStatus({ connected: false, mode: 'offline', database: 'offline', checked: true });
          timerId = setTimeout(pollStatus, 3000);
        });
    };

    fetchMarketplaceData();
    pollStatus();

    let savedAuth = false;
    try {
      savedAuth = localStorage.getItem('artisanhub_is_authenticated') === 'true';
    } catch {}

    if (savedAuth) {
      fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
        .then(async (res) => {
          if (!isMounted) return;
          if (res.status === 401) {
            setIsAuthenticated(false);
            try {
              localStorage.removeItem('artisanhub_is_authenticated');
              localStorage.removeItem('artisanhub_current_user');
            } catch {}
            showNotification('Session expired. Please sign in to continue.');
            return;
          }
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.user) {
            setCurrentUser((prev) => {
              const merged = { ...prev, id: data.user.id, name: data.user.name || prev.name };
              try {
                localStorage.setItem('artisanhub_current_user', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // Extract distinct artists & categories for filter bar
  const artistsList = Array.from(new Set(products.map(p => p.artist))).filter(Boolean);
  const categoriesList = ['All', 'Oil Painting', 'Sculpture', 'Sketch', 'Digital Art', 'Ceramics', 'Textile Art'];
  const maxAvailablePrice = Math.max(100000, ...products.map(p => Number(p.price || 0)));

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedArtist('All');
    setMaxPriceFilter(maxAvailablePrice);
    setSortBy('default');
  };

  // Filter & Sort artworks catalog
  const filteredProducts = products.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(q) || 
      (item.artist || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.medium && item.medium.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesArtist = selectedArtist === 'All' || item.artist === selectedArtist;
    const matchesPrice = Number(item.price || 0) <= maxPriceFilter;
    return matchesSearch && matchesCategory && matchesArtist && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
    if (sortBy === 'likes-desc') return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  const getAuthHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    'X-Requested-With': 'ArtisanHub',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extra
  });

  // Successful auth callback from AuthPage - Saves session persistently & syncs live DB
  const handleAuthSuccess = (userData, token = '') => {
    setAuthToken(token || '');
    setCurrentUser(userData);
    setNameDraft(userData?.name || '');
    setBioDraft(userData?.bio || '');
    setIsEditingName(false);
    setIsEditingBio(false);
    setIsAuthenticated(true);
    setIsAuthViewOpen(false);
    try {
      localStorage.setItem('artisanhub_is_authenticated', 'true');
      localStorage.setItem('artisanhub_current_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e);
    }
    checkDbStatus();
    fetchMarketplaceData();
    showNotification(`Welcome, ${userData.name}! Authenticated as ${userData.role === 'artist' ? 'Artisan' : 'Buyer'}.`);
  };

  // Sign out back to login screen - Clears persistent session
  const handleSignOut = () => {
    setAuthToken('');
    setIsAuthenticated(false);
    setIsAuthViewOpen(false);
    setIsEditingName(false);
    setIsEditingBio(false);
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Requested-With': 'ArtisanHub' }
    }).catch(() => {});
    try {
      localStorage.removeItem('artisanhub_is_authenticated');
      localStorage.removeItem('artisanhub_current_user');
    } catch (e) {
      console.warn('Failed to clear auth from localStorage:', e);
    }
    showNotification("Signed out of ArtisanHub successfully.");
  };

  // Filter custom requests
  const filteredRequests = buyerRequests.filter(req => {
    if (demandsFilter === 'open') return req.status === 'open';
    if (demandsFilter === 'in-progress') return req.status === 'in-progress' || req.status === 'accepted';
    return true;
  });

  // Switch persona to explicit target role
  const switchRole = (targetRole) => {
    if (currentUser.role === targetRole) return;
    const updated = { ...currentUser, role: targetRole };
    setCurrentUser(updated);
    try {
      localStorage.setItem('artisanhub_current_user', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    showNotification(`Switched to ${targetRole === 'buyer' ? 'Buyer Gallery' : 'Artist Studio'} Mode`);
  };

  // Switch persona toggle
  const toggleRole = () => {
    const newRole = currentUser.role === 'buyer' ? 'artist' : 'buyer';
    switchRole(newRole);
  };

  // Toggle Artwork Like
  const handleToggleLike = (artId) => {
    setLikedArtworks(prev => {
      const isLiked = !prev[artId];
      const updatedLikes = { ...prev, [artId]: isLiked };
      try {
        localStorage.setItem('artisanhub_liked_artworks', JSON.stringify(updatedLikes));
      } catch (e) {
        console.warn(e);
      }
      fetch(`${API_BASE_URL}/artworks/${artId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: isLiked })
      }).catch(() => {});
      setProducts(cur => {
        const nextProducts = cur.map(p => {
          if (p.id === artId || p._id === artId) {
            return { ...p, likes: Math.max(0, (p.likes || 0) + (isLiked ? 1 : -1)) };
          }
          return p;
        });
        try {
          localStorage.setItem('artisanhub_products_cache', JSON.stringify(nextProducts));
        } catch (e) {
          console.warn(e);
        }
        return nextProducts;
      });
      return updatedLikes;
    });
  };

  // Submit new artwork listing - Persists directly to backend
  const handleAddArtworkSubmit = async (e) => {
    e.preventDefault();
    if (!Number(newArtForm.price) || Number(newArtForm.price) <= 0) {
      showNotification('Please enter a valid positive price in ₹ INR.');
      return;
    }
    setIsSubmittingArt(true);

    const artPayload = {
      title: newArtForm.title.trim(),
      artist: (currentUser.name || 'Local Artisan').trim(),
      category: newArtForm.category,
      price: Number(newArtForm.price),
      medium: newArtForm.medium ? newArtForm.medium.trim() : 'Canvas & Oil',
      dimensions: newArtForm.dimensions ? newArtForm.dimensions.trim() : 'Custom Size',
      description: newArtForm.description ? newArtForm.description.trim() : '',
      imageUrl: normalizeImageUrl(newArtForm.imageUrl),
      location: (currentUser.location || 'Bengaluru Local').trim(),
      likes: 1,
      featured: false
    };

    try {
      const res = await fetch(`${API_BASE_URL}/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artPayload)
      });
      
      const data = await res.json().catch(() => ({}));

      if (res.ok && data && (data.id || data._id)) {
        const savedArt = { ...data, imageUrl: normalizeImageUrl(data.imageUrl) };
        setProducts(prev => {
          const next = [savedArt, ...prev.filter(p => (p.id || p._id) !== (savedArt.id || savedArt._id))];
          try {
            localStorage.setItem('artisanhub_products_cache', JSON.stringify(next));
          } catch (err) {
            console.warn('Failed to cache new artwork:', err);
          }
          return next;
        });

        // Ensure active gallery filters or tab don't hide the newly published piece
        if (searchQuery) setSearchQuery('');
        if (selectedCategory !== 'All' && selectedCategory !== savedArt.category) {
          setSelectedCategory('All');
        }
        if (selectedArtist !== 'All' && selectedArtist !== savedArt.artist) {
          setSelectedArtist('All');
        }
        if (Number(savedArt.price || 0) > maxPriceFilter) {
          setMaxPriceFilter(Number(savedArt.price));
        }

        setIsAddArtOpen(false);
        setActiveTab('marketplace');
        setIsAuthViewOpen(false);
        setNewArtForm({ title: '', category: 'Oil Painting', price: '', medium: '', dimensions: '', description: '', imageUrl: '' });
        showNotification("Artwork published & saved to MongoDB Atlas!");
        checkDbStatus(false);
      } else {
        showNotification(`Could not save artwork to database: ${data.message || 'Server error'}`);
      }
    } catch (err) {
      showNotification(`Database network error: ${err.message || 'Failed to reach server'}`);
    } finally {
      setIsSubmittingArt(false);
    }
  };

  const isDemandOwner = (req) => {
    if (!currentUser || !req) return false;
    if (req.buyerId && String(req.buyerId).trim()) {
      return String(req.buyerId).trim() === String(currentUser.id || '').trim();
    }
    return (
      Boolean(req.buyerName && currentUser.name) &&
      req.buyerName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
    );
  };

  // Submit custom demand request -> Persists to backend
  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    const minBudget = Number(newReqForm.budgetMin);
    const maxBudget = Number(newReqForm.budgetMax);
    if (!Number.isFinite(minBudget) || minBudget <= 0 || !Number.isFinite(maxBudget) || maxBudget < minBudget) {
      showNotification('Please enter positive budgets where Max budget >= Min budget.');
      return;
    }

    setIsSubmittingReq(true);
    const reqData = {
      buyerId: currentUser.id,
      buyerName: (currentUser.name || 'Art Patron').trim(),
      title: newReqForm.title.trim(),
      category: newReqForm.category,
      budgetMin: minBudget,
      budgetMax: maxBudget,
      deadline: newReqForm.deadline,
      description: newReqForm.description ? newReqForm.description.trim() : '',
      location: (currentUser.location || 'Bengaluru Local').trim()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/custom-requests`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(reqData)
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setIsAuthenticated(false);
        showNotification(data.message || 'Please sign in again to post a custom demand.');
        return;
      }

      if (!res.ok) {
        showNotification(`Could not save request to MongoDB: ${data.message || 'Server error'}`);
        return;
      }

      setBuyerRequests(prev => {
        const updated = [data, ...prev.filter(r => (r.id || r._id) !== (data.id || data._id))];
        try {
          localStorage.setItem('artisanhub_requests_cache', JSON.stringify(updated));
        } catch (err) {
          console.warn(err);
        }
        return updated;
      });

      setIsCreateRequestOpen(false);
      setActiveTab('demands');
      setIsAuthViewOpen(false);
      setNewReqForm({ title: '', category: 'Modern Art', budgetMin: '', budgetMax: '', deadline: '', description: '' });
      showNotification("Custom demand posted to MongoDB Atlas! Local artists notified.");
    } catch (err) {
      showNotification(`Database network error: ${err.message || 'Failed to reach server'}`);
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // Artist Bids on Custom Demand -> Persists to MongoDB Atlas
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!activeBidModalItem) return;

    const targetReqId = activeBidModalItem.id || activeBidModalItem._id;
    const bidPayload = {
      requestId: targetReqId,
      artistName: currentUser.name,
      amount: Number(bidForm.amount),
      daysEst: Number(bidForm.daysEst),
      proposal: bidForm.proposal
    };

    try {
      const res = await fetch(`${API_BASE_URL}/bids`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(bidPayload)
      });
      const savedBid = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setIsAuthenticated(false);
        showNotification(savedBid.message || 'Please sign in again to submit a proposal.');
        return;
      }

      if (!res.ok) {
        showNotification(`Could not submit proposal to MongoDB: ${savedBid.message || 'Server error'}`);
        return;
      }

      setBuyerRequests(prev => {
        const updated = prev.map(req => {
          const targetId = req.id || req._id;
          if (targetId === targetReqId) {
            return { ...req, bids: req.bids ? [savedBid, ...req.bids] : [savedBid] };
          }
          return req;
        });
        try {
          localStorage.setItem('artisanhub_requests_cache', JSON.stringify(updated));
        } catch (err) {
          console.warn(err);
        }
        return updated;
      });

      setActiveBidModalItem(null);
      setBidForm({ amount: '', daysEst: '', proposal: '' });
      showNotification("Proposal quote saved to MongoDB & submitted to buyer!");
    } catch (err) {
      showNotification(`Database network error: ${err.message || 'Failed to reach server'}`);
    }
  };

  // Demand owner accepts an artist's proposal bid
  const handleAcceptBid = async (reqId, bidId, artistName) => {
    const targetReq = buyerRequests.find((r) => (r.id || r._id) === reqId);
    if (!targetReq || !isDemandOwner(targetReq)) {
      showNotification(
        `Only ${targetReq?.buyerName || 'the user who posted this demand'} can accept price proposals for it.`
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/custom-requests/${reqId}/bids/${bidId}/accept`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        const errData = await res.json().catch(() => ({}));
        setIsAuthenticated(false);
        showNotification(errData.message || 'Please sign in again to accept a proposal.');
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showNotification(errData.message || 'Could not accept proposal. Please try again.');
        return;
      }
    } catch (err) {
      showNotification(`Network error accepting proposal: ${err.message || 'Try again'}`);
      return;
    }

    setBuyerRequests(prev => {
      const updated = prev.map(req => {
        const targetId = req.id || req._id;
        if (targetId === reqId) {
          const updatedBids = (req.bids || []).map(b => {
            if (b.id === bidId) {
              return { ...b, status: 'Accepted' };
            }
            return { ...b, status: b.status === 'Accepted' ? 'Accepted' : 'Pending' };
          });
          return { ...req, status: 'in-progress', bids: updatedBids };
        }
        return req;
      });
      try {
        localStorage.setItem('artisanhub_requests_cache', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    showNotification(`Proposal from ${artistName} accepted! Collaboration initiated.`);
  };

  // Handle Auction Bidding -> Persists to MongoDB Atlas
  const handleAuctionBid = async (aucId, numericBid) => {
    const target = auctions.find(a => (a.id || a._id) === aucId);
    if (target && numericBid <= target.currentBid) {
      showNotification(`Bid must be higher than current price (${formatPrice(target.currentBid)})`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auctions/${aucId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericBid })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showNotification(data.message || 'Could not place auction bid.');
        return;
      }

      setAuctions(prev => prev.map(auc => {
        const targetId = auc.id || auc._id;
        if (targetId === aucId) {
          return { ...auc, currentBid: data.currentBid ?? numericBid, bidsCount: data.bidsCount ?? ((auc.bidsCount || 0) + 1) };
        }
        return auc;
      }));
      showNotification(`Bid placed successfully for ${formatPrice(numericBid)}!`);
    } catch (err) {
      showNotification(`Could not place bid: ${err.message || 'Network error'}`);
    }
  };

  // ==================== CART & DUMMY PAYMENT GATEWAY HANDLERS ====================

  const persistCart = (nextCart) => {
    try {
      localStorage.setItem('artisanhub_cart_items', JSON.stringify(nextCart));
    } catch (e) {
      console.warn('Failed to persist cart:', e);
    }
  };

  const handleAddToCart = (art) => {
    const artId = art.id || art._id;
    setCartItems((prev) => {
      const existing = prev.find((item) => (item.id || item._id) === artId);
      const next = existing
        ? prev.map((item) =>
            (item.id || item._id) === artId
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [{ ...art, quantity: 1 }, ...prev];
      persistCart(next);
      return next;
    });
    showNotification(`Added "${art.title}" to your cart!`);
  };

  const handleUpdateCartQty = (artId, nextQty) => {
    const safeQty = Math.max(1, nextQty);
    setCartItems((prev) => {
      const next = prev.map((item) =>
        (item.id || item._id) === artId ? { ...item, quantity: safeQty } : item
      );
      persistCart(next);
      return next;
    });
    setCheckoutItems((prev) =>
      prev.map((item) =>
        (item.id || item._id) === artId ? { ...item, quantity: safeQty } : item
      )
    );
  };

  const handleRemoveFromCart = (artId) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => (item.id || item._id) !== artId);
      persistCart(next);
      return next;
    });
    setCheckoutItems((prev) => prev.filter((item) => (item.id || item._id) !== artId));
  };

  const handleBuyNow = (art) => {
    setCheckoutItems([{ ...art, quantity: 1 }]);
    setCheckoutFromCart(false);
    setQuickViewProduct(null);
    setIsCartOpen(false);
    setIsAuthViewOpen(false);
    setActiveTab('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCartCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutItems([...cartItems]);
    setCheckoutFromCart(true);
    setIsCartOpen(false);
    setIsAuthViewOpen(false);
    setActiveTab('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (receipt) => {
    setLatestReceipt(receipt);
    setOrders((prev) => {
      const next = [receipt, ...prev];
      try {
        localStorage.setItem('artisanhub_orders', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist orders:', e);
      }
      return next;
    });

    if (receipt.isCartCheckout) {
      setCartItems([]);
      persistCart([]);
    }

    if (receipt.paymentMethod === 'upi') {
      setActiveTab('payment-success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showNotification(`UPI payment of ${formatPrice(receipt.totalAmount)} verified!`);
    } else {
      setActiveTab('payment-success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showNotification(`Order ${receipt.orderId} confirmed!`);
    }
  };

  const handleSaveProfileField = async (fields, successMsg) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(fields)
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setIsAuthenticated(false);
        showNotification(data.message || 'Session expired. Please sign in again.');
        return false;
      }
      if (!res.ok) {
        showNotification(data.message || 'Could not update profile.');
        return false;
      }

      const nextUser = {
        ...currentUser,
        ...(data.user || {}),
        ...fields
      };
      setCurrentUser(nextUser);
      setNameDraft(nextUser.name || '');
      setBioDraft(nextUser.bio || '');
      try {
        localStorage.setItem('artisanhub_current_user', JSON.stringify(nextUser));
      } catch {}
      showNotification(successMsg);
      return true;
    } catch {
      const nextUser = { ...currentUser, ...fields };
      setCurrentUser(nextUser);
      setNameDraft(nextUser.name || '');
      setBioDraft(nextUser.bio || '');
      try {
        localStorage.setItem('artisanhub_current_user', JSON.stringify(nextUser));
      } catch {}
      showNotification(successMsg);
      return true;
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  // Gate Dashboard behind authentication - Login page displayed first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">
        {toastMessage && (
          <div className="fixed top-5 right-5 z-[100] bg-amber-400 text-slate-950 px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2.5 animate-bounce border border-amber-300">
            <Sparkles className="w-4 h-4 shrink-0 text-slate-950" />
            <span className="text-xs sm:text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Minimal Auth Header */}
        <header className="border-b border-slate-800/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-amber-500 to-amber-300 w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-amber-500/20">
                AH
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-100">
                  Artisan<span className="text-amber-400">Hub</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2 border-l border-slate-800 pl-2">
                  Hyper-Local Marketplace
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Identity-Verified Community</span>
            </div>
          </div>
        </header>

        {/* Full-Page Login & Role Verification Screen */}
        <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            currentRole="buyer"
            apiBaseUrl={API_BASE_URL}
          />
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
          ArtisanHub · Empowering Local Creators & Discerning Art Patrons
        </footer>
      </div>
    );
  }

  const isArtist = currentUser?.role === 'artist';
  const theme = isArtist
    ? {
        page: 'bg-[#f4efe6] text-stone-900 selection:bg-emerald-700 selection:text-white',
        toast: 'bg-emerald-700 text-white border-emerald-600',
        toastIcon: 'text-white',
        header: 'bg-[#fbf8f3]/95 border-stone-200 shadow-sm shadow-stone-900/5',
        brandBox: 'bg-gradient-to-tr from-emerald-700 to-teal-600 text-white shadow-emerald-700/20',
        brandHighlight: 'text-emerald-700',
        brandSubDivider: 'border-stone-300',
        dbBadge: 'bg-[#faf6f0] border-stone-300 text-stone-700',
        dbConnectedText: 'text-emerald-700 font-semibold',
        dbPendingText: 'text-amber-700 font-semibold',
        navShell: 'bg-[#efe8dc] border-stone-300',
        navActive: 'bg-emerald-700 text-white shadow-sm',
        navIdle: 'text-stone-600 hover:text-stone-900',
        mobileNavBorder: 'border-stone-200',
        mobileNavIdle: 'bg-[#efe8dc] text-stone-700',
        card: 'bg-white border-stone-200 shadow-stone-900/5',
        cardHover: 'hover:border-emerald-700/40',
        innerBox: 'bg-[#faf6f0] border-stone-200',
        pillBadge: 'bg-[#faf6f0] border-stone-300 text-stone-700',
        heading: 'text-stone-900',
        bodyText: 'text-stone-700',
        mutedText: 'text-stone-500',
        subtleText: 'text-stone-600',
        divider: 'border-stone-200',
        accentText: 'text-emerald-700',
        accentTag: 'bg-emerald-700/10 text-emerald-800 border-emerald-700/25',
        accentBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20',
        secondaryBtn: 'bg-[#faf6f0] hover:bg-stone-200/70 text-stone-800 border-stone-300',
        input: 'bg-[#faf6f0] border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-emerald-700',
        heroSection: 'border-stone-200 bg-gradient-to-b from-[#fbf8f3] via-[#f4efe6] to-[#f4efe6]',
        heroGlowOne: 'bg-emerald-500/10',
        heroGlowTwo: 'bg-amber-500/10',
        heroGradientText: 'from-emerald-700 via-teal-700 to-emerald-600',
        heroMetricAccent: 'text-emerald-700',
        roleSwitchShell: 'bg-[#efe8dc] border-stone-300',
        buyerRoleActive: 'bg-slate-900 text-amber-300 shadow-sm',
        artistRoleActive: 'bg-emerald-700 text-white shadow-sm',
        roleIdle: 'text-stone-600 hover:text-stone-900',
        verifiedBadge: 'bg-emerald-700/10 text-emerald-800 border-emerald-700/25',
        signOutBtn: 'bg-[#faf6f0] hover:bg-rose-50 text-stone-600 hover:text-rose-700 border-stone-300 hover:border-rose-300',
        timelineLine: 'border-stone-300',
        timelineDotBorder: 'border-[#f4efe6]',
        acceptedCard: 'border-emerald-600/40 bg-emerald-50/70',
        modalBackdrop: 'bg-stone-950/60',
        modalShell: 'bg-white border-stone-200 text-stone-900',
        closeBtn: 'text-stone-500 hover:text-stone-900',
        footer: 'border-stone-200 bg-[#fbf8f3] text-stone-600'
      }
    : {
        page: 'bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950',
        toast: 'bg-amber-400 text-slate-950 border-amber-300',
        toastIcon: 'text-slate-950',
        header: 'bg-slate-950/85 border-slate-800/80',
        brandBox: 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-amber-500/20',
        brandHighlight: 'text-amber-400',
        brandSubDivider: 'border-slate-800',
        dbBadge: 'bg-slate-900 border-slate-800 text-slate-300',
        dbConnectedText: 'text-emerald-300 font-semibold',
        dbPendingText: 'text-amber-300',
        navShell: 'bg-slate-900/90 border-slate-800',
        navActive: 'bg-amber-400 text-slate-950 shadow-sm',
        navIdle: 'text-slate-400 hover:text-slate-200',
        mobileNavBorder: 'border-slate-900',
        mobileNavIdle: 'bg-slate-900 text-slate-400',
        card: 'bg-slate-900/90 border-slate-800',
        cardHover: 'hover:border-slate-700',
        innerBox: 'bg-slate-950 border-slate-800',
        pillBadge: 'bg-slate-900/90 border-slate-800 text-slate-300',
        heading: 'text-slate-100',
        bodyText: 'text-slate-300',
        mutedText: 'text-slate-400',
        subtleText: 'text-slate-400',
        divider: 'border-slate-800/80',
        accentText: 'text-amber-400',
        accentTag: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
        accentBtn: 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20',
        secondaryBtn: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
        input: 'bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-amber-400',
        heroSection: 'border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950',
        heroGlowOne: 'bg-amber-500/10',
        heroGlowTwo: 'bg-emerald-500/5',
        heroGradientText: 'from-amber-400 via-amber-300 to-amber-500',
        heroMetricAccent: 'text-amber-400',
        roleSwitchShell: 'bg-slate-900 border-slate-800',
        buyerRoleActive: 'bg-amber-400 text-slate-950 shadow-sm',
        artistRoleActive: 'bg-emerald-600 text-white shadow-sm',
        roleIdle: 'text-slate-400 hover:text-slate-200',
        verifiedBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        signOutBtn: 'bg-slate-900 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-500/30',
        timelineLine: 'border-slate-800',
        timelineDotBorder: 'border-slate-950',
        acceptedCard: 'border-emerald-500/40 bg-emerald-950/10',
        modalBackdrop: 'bg-slate-950/80',
        modalShell: 'bg-slate-900 border-slate-800 text-slate-100',
        closeBtn: 'text-slate-400 hover:text-white',
        footer: 'border-slate-800/80 bg-slate-950 text-slate-500'
      };

  return (
    <div className={`min-h-screen font-sans antialiased pb-20 transition-colors duration-300 ${theme.page}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2.5 animate-bounce border ${theme.toast}`}>
          <Sparkles className={`w-4 h-4 shrink-0 ${theme.toastIcon}`} />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR / HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-3.5 transition-colors duration-300 ${theme.header}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shadow-md ${theme.brandBox}`}>
              {isArtist ? 'AS' : 'AH'}
            </div>
            <div>
              <span className={`text-lg font-bold tracking-tight ${theme.heading}`}>
                {isArtist ? 'Artisan' : 'Artisan'}
                <span className={theme.brandHighlight}>{isArtist ? 'Studio' : 'Hub'}</span>
              </span>
              <span className={`hidden sm:inline-block text-[11px] ml-2 border-l pl-2 ${theme.mutedText} ${theme.brandSubDivider}`}>
                {isArtist ? 'Creator Atelier' : 'Collectors Gallery'}
              </span>
            </div>

            {/* Live Database Status Indicator */}
            <div className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] ${theme.dbBadge}`}>
              <Database className={`w-3 h-3 ${theme.mutedText}`} />
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className={dbStatus.connected ? theme.dbConnectedText : theme.dbPendingText}>
                {dbStatus.connected
                  ? `MongoDB Atlas: ${dbStatus.database}`
                  : dbStatus.mode === 'in-memory'
                    ? 'In-Memory Mode'
                    : 'Connecting DB...'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border text-xs font-semibold ${theme.navShell}`}>
            <button
              onClick={() => {
                setActiveTab('marketplace');
                setIsAuthViewOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'marketplace' && !isAuthViewOpen ? theme.navActive : theme.navIdle
              }`}
            >
              Art Gallery
            </button>
            <button
              onClick={() => {
                setActiveTab('demands');
                setIsAuthViewOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'demands' && !isAuthViewOpen ? theme.navActive : theme.navIdle
              }`}
            >
              Custom Demands & Bids
            </button>
            <button
              onClick={() => {
                setActiveTab('auctions');
                setIsAuthViewOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'auctions' && !isAuthViewOpen ? theme.navActive : theme.navIdle
              }`}
            >
              Live Auctions
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsAuthViewOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'profile' && !isAuthViewOpen ? theme.navActive : theme.navIdle
              }`}
            >
              {isArtist ? 'Studio Profile' : 'Collector Profile'}
            </button>
            <button
              onClick={() => {
                setActiveTab('future');
                setIsAuthViewOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'future' && !isAuthViewOpen ? theme.navActive : theme.navIdle
              }`}
            >
              Roadmap
            </button>
          </nav>

          {/* Zone 3: Cart, Persona Toggle, User Info & Sign Out */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${theme.secondaryBtn}`}
              title="View Shopping Cart"
            >
              <ShoppingCart className={`w-4 h-4 ${theme.accentText}`} />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none tabular-nums ${isArtist ? 'bg-emerald-700 text-white' : 'bg-amber-400 text-slate-950'}`}>
                  {totalCartCount}
                </span>
              )}
            </button>

            <div className={`flex items-center p-1 rounded-xl border ${theme.roleSwitchShell}`}>
              <button
                type="button"
                onClick={() => switchRole('buyer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !isArtist ? theme.buyerRoleActive : theme.roleIdle
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => switchRole('artist')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isArtist ? theme.artistRoleActive : theme.roleIdle
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Artist</span>
              </button>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${theme.secondaryBtn}`}
              title="Click to manage 2FA OTP verification"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className={`text-[11px] font-semibold truncate max-w-[110px] ${theme.heading}`}>{currentUser.name}</span>
              <span className={`border px-1.5 py-0.5 rounded text-[10px] font-semibold ${theme.verifiedBadge}`}>
                Verified
              </span>
            </button>

            <button
              onClick={handleSignOut}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-sm ${theme.signOutBtn}`}
              title="Sign out to return to login screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className={`flex lg:hidden gap-1.5 overflow-x-auto scrollbar-none pt-2.5 mt-2 border-t ${theme.mobileNavBorder}`}>
          <button
            onClick={() => {
              setActiveTab('marketplace');
              setIsAuthViewOpen(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'marketplace' && !isAuthViewOpen ? theme.navActive : theme.mobileNavIdle
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => {
              setActiveTab('demands');
              setIsAuthViewOpen(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'demands' && !isAuthViewOpen ? theme.navActive : theme.mobileNavIdle
            }`}
          >
            Demands & Bids
          </button>
          <button
            onClick={() => {
              setActiveTab('auctions');
              setIsAuthViewOpen(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'auctions' && !isAuthViewOpen ? theme.navActive : theme.mobileNavIdle
            }`}
          >
            Auctions
          </button>
          <button
            onClick={() => {
              setActiveTab('profile');
              setIsAuthViewOpen(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'profile' && !isAuthViewOpen ? theme.navActive : theme.mobileNavIdle
            }`}
          >
            Profile
          </button>
          <button
            onClick={handleSignOut}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${isArtist ? 'text-rose-700 bg-[#efe8dc]' : 'text-rose-400 hover:text-rose-300 bg-slate-900'}`}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* HERO BANNER SECTION (Only shown on Art Gallery & Custom Demands and Bids tabs) */}
      {!isAuthViewOpen && (activeTab === 'marketplace' || activeTab === 'demands') && (() => {
        const featuredArt = products.find((p) => p.featured) || products[0] || INITIAL_ARTWORKS[0];
        return (
      <section className={`relative overflow-hidden border-b transition-colors duration-300 ${theme.heroSection}`}>
        {/* Subtle decorative background ambient glow */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme.heroGlowOne}`} />
        <div className={`absolute top-1/3 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none ${theme.heroGlowTwo}`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Column: Value Prop & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className={`inline-flex items-center gap-2 border px-3.5 py-1.5 rounded-full text-xs ${theme.pillBadge}`}>
                <span className={`w-2 h-2 rounded-full ${isArtist ? 'bg-emerald-600' : 'bg-amber-400'}`}></span>
                <span>{isArtist ? 'Artist Atelier · Direct Commissions in Bengaluru' : 'Hyper-Local Artisan Discovery in Bengaluru'}</span>
                <span className={theme.mutedText}>·</span>
                <span className={`${theme.accentText} font-semibold`}>Zero Commission</span>
              </div>

              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] ${theme.heading}`}>
                {isArtist ? (
                  <>
                    Showcase Original Craft & Win Local Commissions in{' '}
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.heroGradientText}`}>Your Studio</span>
                  </>
                ) : (
                  <>
                    Discover & Commission Handcrafted Art in{' '}
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.heroGradientText}`}>Your Neighborhood</span>
                  </>
                )}
              </h1>

              <p className={`text-sm sm:text-base leading-relaxed max-w-xl ${theme.mutedText}`}>
                {isArtist
                  ? 'Publish authenticated works directly to neighborhood collectors, bid on custom art briefs with fair pricing, and retain 100% of every sale.'
                  : 'Directly connect with master painters, sculptors, and ceramists living near you. Post bespoke art demands, receive competitive bids from local creators, or acquire authenticated original pieces.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isArtist ? (
                  <>
                    <button
                      onClick={() => setIsAddArtOpen(true)}
                      className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${theme.accentBtn}`}
                    >
                      <Plus className="w-4 h-4" /> List Your Artwork
                    </button>

                    <button
                      onClick={() => setActiveTab('demands')}
                      className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-2 transition-all hover:scale-[1.02] ${theme.secondaryBtn}`}
                    >
                      <Gavel className={`w-4 h-4 ${theme.accentText}`} /> Browse Patron Demands
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsCreateRequestOpen(true)}
                      className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${theme.accentBtn}`}
                    >
                      <Plus className="w-4 h-4" /> Post Custom Demand
                    </button>

                    <button
                      onClick={() => {
                        switchRole('artist');
                        setIsAddArtOpen(true);
                      }}
                      className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-2 transition-all hover:scale-[1.02] ${theme.secondaryBtn}`}
                    >
                      <Briefcase className={`w-4 h-4 ${theme.accentText}`} /> List Your Artwork
                    </button>
                  </>
                )}
              </div>

              {/* Trust Metrics Bar */}
              <div className={`grid grid-cols-3 gap-4 pt-6 border-t max-w-lg ${theme.divider}`}>
                <div>
                  <div className={`text-lg sm:text-xl font-black tabular-nums ${theme.heading}`}>180+</div>
                  <div className={`text-[11px] font-medium ${theme.mutedText}`}>Local Artisans</div>
                </div>
                <div>
                  <div className={`text-lg sm:text-xl font-black tabular-nums ${theme.heroMetricAccent}`}>₹12.4L+</div>
                  <div className={`text-[11px] font-medium ${theme.mutedText}`}>Direct Commissions</div>
                </div>
                <div>
                  <div className={`text-lg sm:text-xl font-black tabular-nums ${isArtist ? 'text-teal-700' : 'text-emerald-400'}`}>100%</div>
                  <div className={`text-[11px] font-medium ${theme.mutedText}`}>Phone-Verified</div>
                </div>
              </div>
            </div>

            {/* Right Column: Curated Artwork Spotlight Card */}
            <div className="lg:col-span-5">
              <div className={`relative group border rounded-3xl overflow-hidden p-3 shadow-2xl transition-all ${theme.card} ${theme.cardHover}`}>
                <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-950">
                  <img
                    src={featuredArt.imageUrl || '/art-fallback.svg'}
                    alt={featuredArt.title || 'Curated Artwork of the Week'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/art-fallback.svg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Top Glassmorphic Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`backdrop-blur-md bg-slate-950/70 border border-white/10 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${isArtist ? 'text-emerald-300' : 'text-amber-400'}`}>
                      <Sparkles className="w-3 h-3" /> Featured of the Week
                    </span>
                    <span className="backdrop-blur-md bg-slate-950/70 border border-white/10 text-slate-200 text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <MapPin className={`w-3 h-3 ${isArtist ? 'text-emerald-300' : 'text-amber-400'}`} /> {(featuredArt.location || 'Bengaluru').split(',')[0]}
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <h3 className="text-base font-bold text-slate-100">{featuredArt.title}</h3>
                    <p className="text-xs text-slate-300">By {featuredArt.artist} · {featuredArt.medium}</p>
                  </div>
                </div>

                <div className="p-3 pt-4 flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold block ${theme.mutedText}`}>Artisan Asking Price</span>
                    <span className={`text-xl font-black tabular-nums ${theme.accentText}`}>{formatPrice(featuredArt.price)}</span>
                  </div>

                  <button
                    onClick={() => setQuickViewProduct(featuredArt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${theme.secondaryBtn}`}
                  >
                    <Eye className={`w-3.5 h-3.5 ${theme.accentText}`} /> Quick View
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
        );
      })()}

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {isAuthViewOpen ? (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setIsAuthViewOpen(false)}
            currentRole={currentUser.role}
            apiBaseUrl={API_BASE_URL}
          />
        ) : (
          <>
            {/* ================= TAB 1: LOCAL MARKETPLACE CATALOG ================= */}
        {activeTab === 'marketplace' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.heading}`}>Hyper-Local Art Gallery</h2>
                <p className={`text-xs sm:text-sm mt-1 ${theme.mutedText}`}>Authentic original artworks directly curated from neighborhood creators</p>
              </div>

              {isArtist ? (
                <button
                  onClick={() => setIsAddArtOpen(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${theme.accentBtn}`}
                >
                  <Plus className="w-4 h-4" /> List New Artwork
                </button>
              ) : (
                <button
                  onClick={() => setIsCreateRequestOpen(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition border shrink-0 ${theme.secondaryBtn}`}
                >
                  <Plus className={`w-4 h-4 ${theme.accentText}`} /> Post Custom Request
                </button>
              )}
            </div>

            {/* Search and Filter Bar Component */}
            <SearchFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedArtist={selectedArtist}
              setSelectedArtist={setSelectedArtist}
              artistsList={artistsList}
              categoriesList={categoriesList}
              priceRange={Math.min(maxPriceFilter, maxAvailablePrice)}
              setPriceRange={setMaxPriceFilter}
              maxAvailablePrice={maxAvailablePrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onResetFilters={handleResetFilters}
              totalResults={filteredProducts.length}
              isArtist={isArtist}
            />

            {/* Responsive Gallery Grid */}
            <ArtGalleryGrid
              artworks={filteredProducts}
              likedArtworks={likedArtworks}
              cartItems={cartItems}
              onToggleLike={handleToggleLike}
              onQuickView={(art) => setQuickViewProduct(art)}
              onInquire={(art) => showNotification(`Contact request initiated for artist ${art.artist}!`)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onResetFilters={handleResetFilters}
              isArtist={isArtist}
            />
          </div>
        )}

        {/* ================= TAB 2: CUSTOM DEMANDS & ACTIVE BIDS ================= */}
        {activeTab === 'demands' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.heading}`}>Buyer Art Demands & Bidding Portal</h2>
                <p className={`text-xs sm:text-sm mt-1 ${theme.mutedText}`}>Patrons submit custom commission requirements while verified neighborhood artists submit price quotes</p>
              </div>

              {!isArtist && (
                <button
                  onClick={() => setIsCreateRequestOpen(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${theme.accentBtn}`}
                >
                  <Plus className="w-4 h-4" /> Post Custom Art Need
                </button>
              )}
            </div>

            {/* Demands Filter Strip */}
            <div className={`flex items-center gap-2 p-1.5 rounded-xl border w-fit ${theme.navShell}`}>
              <button
                onClick={() => setDemandsFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  demandsFilter === 'all' ? `${theme.navActive} font-bold` : theme.navIdle
                }`}
              >
                All Demands ({buyerRequests.length})
              </button>
              <button
                onClick={() => setDemandsFilter('open')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  demandsFilter === 'open' ? `${theme.navActive} font-bold` : theme.navIdle
                }`}
              >
                Accepting Bids
              </button>
              <button
                onClick={() => setDemandsFilter('in-progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  demandsFilter === 'in-progress' ? `${theme.navActive} font-bold` : theme.navIdle
                }`}
              >
                In Progress
              </button>
            </div>

            {/* Demands Listing Cards */}
            <div className="space-y-6">
              {filteredRequests.map(req => {
                const isOpen = req.status === 'open';
                const isOwner = isDemandOwner(req);
                return (
                  <div key={req.id || req._id} className={`border rounded-3xl p-6 space-y-6 shadow-xl ${theme.card}`}>

                    {/* Header Row */}
                    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b ${theme.divider}`}>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`border text-[11px] font-bold px-2.5 py-0.5 rounded-md ${theme.accentTag}`}>
                            {req.category}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                            isOpen
                              ? isArtist
                                ? 'bg-emerald-700/10 text-emerald-800 border-emerald-700/25'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isArtist
                                ? 'bg-purple-700/10 text-purple-800 border-purple-700/25'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}>
                            {isOpen ? 'Open for Bidding' : 'Proposal Accepted'}
                          </span>
                          {isOwner && (
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                              isArtist
                                ? 'bg-amber-600/10 text-amber-800 border-amber-600/30'
                                : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                            }`}>
                              Posted by You
                            </span>
                          )}
                          <h3 className={`font-bold text-lg ${theme.heading}`}>{req.title}</h3>
                        </div>
                        <p className={`text-xs flex items-center gap-1.5 ${theme.mutedText}`}>
                          Posted by <span className={`font-medium ${theme.heading}`}>{req.buyerName}</span>
                          <span>·</span>
                          <MapPin className={`w-3.5 h-3.5 ${theme.accentText}`} /> {req.location}
                          <span>·</span>
                          <span>{formatPostedDate(req.createdAt)}</span>
                        </p>
                      </div>

                      <div className={`px-4 py-2.5 rounded-2xl border text-left md:text-right shrink-0 ${theme.innerBox}`}>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider block ${theme.mutedText}`}>Target Budget</span>
                        <span className={`text-base font-extrabold tabular-nums ${theme.accentText}`}>
                          {formatPrice(req.budgetMin)} - {formatPrice(req.budgetMax)}
                        </span>
                      </div>
                    </div>

                    {/* Demand Brief Body */}
                    <div className={`p-4 rounded-2xl border space-y-2 ${theme.innerBox}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.mutedText}`}>Patron&apos;s Brief & Specifications</span>
                      <p className={`text-xs sm:text-sm leading-relaxed ${theme.bodyText}`}>{req.description}</p>
                    </div>

                    {/* Timeline & Actions Footer */}
                    <div className={`flex flex-wrap justify-between items-center gap-4 text-xs pt-1 ${theme.mutedText}`}>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" /> Deadline: <span className={`font-semibold ${theme.heading}`}>{req.deadline}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Gavel className="w-4 h-4" /> Bids Submitted: <span className={`font-bold ${theme.accentText}`}>{req.bids?.length || 0}</span>
                        </span>
                      </div>

                      {isArtist && !isOwner && isOpen && (
                        <button
                          onClick={() => setActiveBidModalItem(req)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${theme.accentBtn}`}
                        >
                          <Gavel className="w-3.5 h-3.5" /> Submit Price Proposal
                        </button>
                      )}
                    </div>

                    {/* BIDDING TIMELINE VIEW */}
                    <div className={`pt-4 border-t space-y-4 ${theme.divider}`}>
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.bodyText}`}>
                          <Clock className={`w-3.5 h-3.5 ${theme.accentText}`} /> Active Artist Bids Timeline
                        </h4>
                        <span className={`text-[11px] ${theme.mutedText}`}>
                          {req.bids?.length ? `${req.bids.length} proposal(s)` : 'No bids yet'}
                        </span>
                      </div>

                      {req.bids && req.bids.length > 0 ? (
                        <div className={`relative pl-6 border-l-2 space-y-5 ${theme.timelineLine}`}>
                          {req.bids.map((bid) => {
                            const isAccepted = bid.status === 'Accepted';
                            return (
                              <div key={bid.id} className="relative group">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 transition-all ${theme.timelineDotBorder} ${
                                  isAccepted
                                    ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                                    : isArtist
                                      ? 'bg-emerald-700 ring-4 ring-emerald-700/20'
                                      : 'bg-amber-400 ring-4 ring-amber-400/20'
                                }`} />

                                {/* Bid Card Content */}
                                <div className={`border rounded-2xl p-4 space-y-3 transition ${
                                  isAccepted ? theme.acceptedCard : `${theme.innerBox} ${theme.cardHover}`
                                }`}>
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isArtist ? 'bg-emerald-700/15 text-emerald-800' : 'bg-amber-400/10 text-amber-400'}`}>
                                        {(bid.artistName || 'A').charAt(0)}
                                      </div>
                                      <div>
                                        <div className={`font-semibold text-xs sm:text-sm ${theme.heading}`}>{bid.artistName}</div>
                                        <div className={`text-[10px] ${theme.mutedText}`}>{bid.timestamp || 'Recent proposal'}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      {/* Status Badge */}
                                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                        isAccepted
                                          ? isArtist
                                            ? 'bg-emerald-700/15 text-emerald-800 border-emerald-700/30'
                                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                          : isArtist
                                            ? 'bg-amber-600/15 text-amber-800 border-amber-600/30'
                                            : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                                      }`}>
                                        {isAccepted ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {bid.status || 'Pending'}
                                      </span>

                                      <div className="text-right">
                                        <div className={`text-sm sm:text-base font-black tabular-nums ${theme.accentText}`}>
                                          {formatPrice(bid.amount)}
                                        </div>
                                        <div className={`text-[10px] ${theme.mutedText}`}>Est. {bid.daysEst} Days</div>
                                      </div>
                                    </div>
                                  </div>

                                  <p className={`text-xs italic p-2.5 rounded-xl border ${isArtist ? 'bg-white border-stone-200 text-stone-700' : 'bg-slate-900/60 border-slate-800/60 text-slate-300'}`}>
                                    &ldquo;{bid.proposal}&rdquo;
                                  </p>

                                  {/* Owner-Only Accept Action */}
                                  {isOpen && !isAccepted && (
                                    <div className="flex justify-end pt-1">
                                      {isOwner ? (
                                        <button
                                          onClick={() => handleAcceptBid(req.id || req._id, bid.id, bid.artistName)}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                                        >
                                          <Check className="w-3.5 h-3.5" /> Accept Proposal
                                        </button>
                                      ) : (
                                        <span className={`text-[11px] font-medium ${theme.mutedText}`}>
                                          Only {req.buyerName} can accept this proposal
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={`text-xs italic p-4 rounded-xl border text-center ${theme.innerBox} ${theme.mutedText}`}>
                          No artist bids received yet. Verified artisans in your neighborhood have been notified.
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: LIMITED EDITION AUCTIONS ================= */}
        {activeTab === 'auctions' && (
          <div className="space-y-8">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.heading}`}>Special Limited Edition Auctions</h2>
              <p className={`text-xs sm:text-sm mt-1 ${theme.mutedText}`}>Exclusive timed bidding portal for rare, numbered, and high-value masterworks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {auctions.map(auc => (
                <div key={auc.id || auc._id} className={`border rounded-3xl overflow-hidden p-5 flex flex-col sm:flex-row gap-5 shadow-xl transition ${theme.card} ${theme.cardHover}`}>
                  <div className="relative w-full sm:w-48 h-52 sm:h-auto rounded-2xl overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={auc.imageUrl || '/art-fallback.svg'}
                      alt={auc.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/art-fallback.svg';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2.5 left-2.5 backdrop-blur-md bg-slate-950/75 border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-md ${isArtist ? 'text-emerald-300' : 'text-amber-400'}`}>
                      LIVE
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.accentText}`}>{auc.category}</span>
                      <h3 className={`font-bold text-base ${theme.heading}`}>{auc.title}</h3>
                      <p className={`text-xs ${theme.mutedText}`}>By <span className={`font-medium ${theme.heading}`}>{auc.artist}</span></p>
                      <p className={`text-xs line-clamp-2 pt-1 ${theme.mutedText}`}>{auc.description}</p>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${theme.innerBox}`}>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme.mutedText}`}>Current High Bid</span>
                        <span className={`text-xl font-black tabular-nums ${theme.accentText}`}>{formatPrice(auc.currentBid)}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme.mutedText}`}>Bids Placed</span>
                        <span className={`text-xs font-bold tabular-nums ${theme.bodyText}`}>{auc.bidsCount} Bids</span>
                      </div>
                    </div>

                    {/* Quick Bid Form */}
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const input = e.target.elements.bidVal;
                        handleAuctionBid(auc.id || auc._id, Number(input.value));
                        input.value = '';
                      }}
                      className="flex gap-2"
                    >
                      <input
                        name="bidVal"
                        type="number"
                        placeholder={`> ${formatPrice(auc.currentBid)}`}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition ${theme.input}`}
                        required
                      />
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${theme.accentBtn}`}
                      >
                        <Gavel className="w-3.5 h-3.5" /> Place Bid
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: ACCOUNT PROFILE & SECURITY ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className={`border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl ${theme.card}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ${theme.brandBox}`}>
                    {(currentUser.name || 'A').charAt(0)}
                  </div>
                  <div className="space-y-1">
                    {isEditingName ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const trimmed = nameDraft.trim();
                          if (!trimmed) {
                            showNotification('Display name cannot be empty.');
                            return;
                          }
                          const ok = await handleSaveProfileField({ name: trimmed }, 'Display name updated!');
                          if (ok) setIsEditingName(false);
                        }}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="text"
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          autoFocus
                          maxLength={60}
                          className={`border rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none transition ${theme.input}`}
                          placeholder="Enter display name"
                        />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${theme.accentBtn}`}
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNameDraft(currentUser.name || '');
                            setIsEditingName(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 ${theme.secondaryBtn}`}
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className={`text-xl font-bold ${theme.heading}`}>{currentUser.name}</h2>
                        <button
                          type="button"
                          onClick={() => {
                            setNameDraft(currentUser.name || '');
                            setIsEditingName(true);
                          }}
                          className={`p-1.5 rounded-lg border transition ${theme.secondaryBtn}`}
                          title="Edit display name"
                          aria-label="Edit display name"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${theme.accentTag}`}>
                          {currentUser.role}
                        </span>
                      </div>
                    )}
                    <p className={`text-xs flex items-center gap-1 ${theme.mutedText}`}>
                      <MapPin className={`w-3.5 h-3.5 ${theme.accentText}`} /> {currentUser.location || 'Bengaluru Local'} · Member since {currentUser.joinedDate || '2026'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleRole}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${theme.secondaryBtn}`}
                >
                  Switch to {isArtist ? 'Buyer Portal' : 'Artist Studio'}
                </button>
              </div>

              <div className={`space-y-3 pt-6 border-t ${theme.divider}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.bodyText}`}>
                  <Shield className="w-4 h-4 text-emerald-500" /> Identity Verification & Authenticity
                </h3>

                <div className={`border p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${theme.innerBox}`}>
                  <div>
                    <p className={`text-xs font-semibold ${theme.heading}`}>
                      {currentUser.phone || currentUser.email || 'Not provided'}
                    </p>
                    <p className={`text-[11px] flex items-center gap-1.5 mt-0.5 font-medium ${isArtist ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated with OTP Verification
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${theme.secondaryBtn}`}
                  >
                    Manage Phone
                  </button>
                </div>
              </div>

              <div className={`space-y-2.5 pt-2 border-t ${theme.divider}`}>
                <div className="flex items-center justify-between pt-3">
                  <label className={`text-xs font-semibold ${theme.mutedText}`}>Artisan & Collector Bio</label>
                  {!isEditingBio && (
                    <button
                      type="button"
                      onClick={() => {
                        setBioDraft(currentUser.bio || '');
                        setIsEditingBio(true);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${theme.secondaryBtn}`}
                      title="Edit bio"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="space-y-2.5">
                    <textarea
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value)}
                      rows={3}
                      autoFocus
                      placeholder="Write a brief note about your artistic style or collecting tastes..."
                      className={`w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none transition ${theme.input}`}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBioDraft(currentUser.bio || '');
                          setIsEditingBio(false);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 ${theme.secondaryBtn}`}
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await handleSaveProfileField({ bio: bioDraft.trim() }, 'Bio updated successfully!');
                          if (ok) setIsEditingBio(false);
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${theme.accentBtn}`}
                      >
                        <Check className="w-3.5 h-3.5" /> Save Bio
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`border rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${theme.innerBox} ${currentUser.bio ? theme.bodyText : `${theme.mutedText} italic`}`}>
                    {currentUser.bio || 'No bio added yet. Click the pencil icon to introduce yourself.'}
                  </p>
                )}
              </div>
            </div>

            {/* Collector Order History */}
            <div className={`border rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl ${theme.card}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-base font-bold flex items-center gap-2 ${theme.heading}`}>
                  <ShoppingCart className={`w-4 h-4 ${theme.accentText}`} /> Acquired Artworks & Orders
                </h3>
                <span className={`text-xs font-semibold ${theme.mutedText}`}>{orders.length} Order(s)</span>
              </div>

              {orders.length === 0 ? (
                <p className={`text-xs border rounded-2xl p-4 text-center ${theme.innerBox} ${theme.mutedText}`}>
                  No purchases yet. Explore the Art Gallery and use Buy Now or Cart to acquire original works.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${theme.innerBox}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-xs font-bold ${theme.heading}`}>{ord.orderId}</span>
                          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${theme.verifiedBadge}`}>
                            {ord.paymentMethodLabel}
                          </span>
                        </div>
                        <p className={`text-xs ${theme.mutedText}`}>
                          {ord.items.map((i) => `${i.title} (×${i.quantity})`).join(', ')}
                        </p>
                        <p className={`text-[11px] ${theme.mutedText}`}>{ord.paidAt} · UTR: {ord.utrNumber}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-base font-black tabular-nums ${theme.accentText}`}>
                          {formatPrice(ord.totalAmount)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLatestReceipt(ord);
                            setActiveTab('payment-success');
                          }}
                          className={`text-[11px] hover:underline font-semibold ${theme.accentText}`}
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: ROADMAP EXTENSIONS ================= */}
        {activeTab === 'future' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.heading}`}>ArtisanHub Platform Roadmap</h2>
              <p className={`text-xs sm:text-sm mt-1 ${theme.mutedText}`}>Upcoming hyper-local modules designed to empower neighborhood creator economies</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className={`border p-6 rounded-3xl space-y-3 shadow-xl ${theme.card}`}>
                <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center font-bold text-xs border border-purple-500/20">
                  AR
                </div>
                <h3 className={`font-bold text-base ${theme.heading}`}>AR Room Visualizer</h3>
                <p className={`text-xs leading-relaxed ${theme.mutedText}`}>
                  Patrons preview canvas dimensions and frame finishes on their living room wall in live scale before confirming commissions.
                </p>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${theme.innerBox} ${theme.mutedText}`}>Phase 2</span>
              </div>

              <div className={`border p-6 rounded-3xl space-y-3 shadow-xl ${theme.card}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${theme.accentTag}`}>
                  WS
                </div>
                <h3 className={`font-bold text-base ${theme.heading}`}>Neighborhood Masterclasses</h3>
                <p className={`text-xs leading-relaxed ${theme.mutedText}`}>
                  Weekend pottery, oil painting, and heritage sculpting workshops hosted directly at the artist&apos;s local studio space.
                </p>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${theme.innerBox} ${theme.mutedText}`}>Phase 3</span>
              </div>

              <div className={`border p-6 rounded-3xl space-y-3 shadow-xl ${theme.card}`}>
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                  NFT
                </div>
                <h3 className={`font-bold text-base ${theme.heading}`}>Digital Authenticity NFC</h3>
                <p className={`text-xs leading-relaxed ${theme.mutedText}`}>
                  Cryptographically signed NFC certificates embedded into physical canvas frames to guarantee provenance and resale royalties.
                </p>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${theme.innerBox} ${theme.mutedText}`}>Phase 4</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= PAGE: ORDER SUMMARY & PAYMENT METHOD ================= */}
        {activeTab === 'checkout' && (
          <div className={isArtist ? 'bg-slate-950 text-slate-100 rounded-3xl p-4 sm:p-8 border border-stone-300 shadow-2xl' : ''}>
            <CheckoutPage
              items={checkoutItems}
              currentUser={currentUser}
              isCartCheckout={checkoutFromCart}
              onUpdateQty={handleUpdateCartQty}
              onRemoveItem={handleRemoveFromCart}
              onBack={() => setActiveTab('marketplace')}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        )}

        {/* ================= PAGE: PAYMENT SUCCESSFUL ================= */}
        {activeTab === 'payment-success' && (
          <div className={isArtist ? 'bg-slate-950 text-slate-100 rounded-3xl p-4 sm:p-8 border border-stone-300 shadow-2xl' : ''}>
            <PaymentSuccessPage
              receipt={latestReceipt}
              onBackToGallery={() => setActiveTab('marketplace')}
              onViewProfile={() => setActiveTab('profile')}
            />
          </div>
        )}
          </>
        )}
      </main>

      {/* ================= MODAL: QUICK-VIEW ARTWORK ================= */}
      {quickViewProduct && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${theme.modalBackdrop}`}>
          <div className={`border rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${theme.modalShell}`}>
            <div className="relative h-72 sm:h-80 bg-slate-950">
              <img
                src={quickViewProduct.imageUrl || '/art-fallback.svg'}
                alt={quickViewProduct.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/art-fallback.svg';
                }}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-sm transition"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className={`backdrop-blur-md bg-slate-950/80 border border-white/10 text-xs font-bold px-3 py-1 rounded-xl ${isArtist ? 'text-emerald-300' : 'text-amber-400'}`}>
                  {quickViewProduct.category}
                </span>
                <span className="backdrop-blur-md bg-slate-950/80 border border-white/10 text-slate-200 text-xs font-medium px-3 py-1 rounded-xl flex items-center gap-1">
                  <MapPin className={`w-3.5 h-3.5 ${isArtist ? 'text-emerald-300' : 'text-amber-400'}`} /> {quickViewProduct.location}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className={`text-xl font-extrabold ${theme.heading}`}>{quickViewProduct.title}</h3>
                  <p className={`text-xs ${theme.mutedText}`}>Created by <span className={`font-semibold ${theme.heading}`}>{quickViewProduct.artist}</span></p>
                </div>
                <div className={`text-2xl font-black tabular-nums ${theme.accentText}`}>
                  {formatPrice(quickViewProduct.price)}
                </div>
              </div>

              <p className={`text-xs sm:text-sm leading-relaxed p-4 rounded-2xl border ${theme.innerBox} ${theme.bodyText}`}>
                {quickViewProduct.description}
              </p>

              <div className={`grid grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl border ${theme.innerBox}`}>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${theme.mutedText}`}>Medium / Materials</span>
                  <span className={`font-medium ${theme.heading}`}>{quickViewProduct.medium}</span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${theme.mutedText}`}>Dimensions</span>
                  <span className={`font-medium tabular-nums ${theme.heading}`}>{quickViewProduct.dimensions}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    const target = quickViewProduct;
                    setQuickViewProduct(null);
                    showNotification(`Inquiry dispatched to artist ${target.artist}! Phone connection opened.`);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${theme.secondaryBtn}`}
                >
                  <Phone className={`w-3.5 h-3.5 ${theme.accentText}`} /> Inquiry
                </button>
                <button
                  onClick={() => handleAddToCart(quickViewProduct)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${theme.secondaryBtn}`}
                >
                  <ShoppingCart className={`w-3.5 h-3.5 ${theme.accentText}`} /> Add to Cart
                </button>
                <button
                  onClick={() => handleBuyNow(quickViewProduct)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${theme.accentBtn}`}
                >
                  <Zap className="w-3.5 h-3.5" /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SHOPPING CART ================= */}
      {isCartOpen && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${theme.modalBackdrop}`}>
          <div className={`border rounded-3xl p-6 sm:p-7 w-full max-w-lg space-y-5 shadow-2xl ${theme.modalShell}`}>
            <div className={`flex justify-between items-center border-b pb-3.5 ${theme.divider}`}>
              <div>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.heading}`}>
                  <ShoppingCart className={`w-5 h-5 ${theme.accentText}`} /> Your Art Cart ({totalCartCount})
                </h3>
                <p className={`text-xs ${theme.mutedText}`}>Review selected artworks before proceeding to checkout</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className={`text-sm ${theme.closeBtn}`}>✕</button>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className={`text-xs sm:text-sm ${theme.mutedText}`}>Your cart is currently empty.</p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${theme.accentBtn}`}
                >
                  Explore Artworks
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const itemId = item.id || item._id;
                    const qty = item.quantity || 1;
                    return (
                      <div
                        key={itemId}
                        className={`flex items-center gap-3.5 border p-3 rounded-2xl ${theme.innerBox}`}
                      >
                        <img
                          src={item.imageUrl || '/art-fallback.svg'}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/art-fallback.svg';
                          }}
                          className="w-16 h-16 object-cover rounded-xl bg-slate-900 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${theme.heading}`}>{item.title}</h4>
                          <p className={`text-[11px] truncate ${theme.mutedText}`}>By {item.artist}</p>
                          <p className={`text-xs font-black tabular-nums mt-0.5 ${theme.accentText}`}>
                            {formatPrice(item.price * qty)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className={`flex items-center border rounded-lg ${theme.card}`}>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(itemId, Math.max(1, qty - 1))}
                              className={`p-1 ${theme.closeBtn}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`px-2 text-xs font-bold tabular-nums ${theme.heading}`}>{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(itemId, qty + 1)}
                              className={`p-1 ${theme.closeBtn}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(itemId)}
                            className={`p-1.5 rounded-lg hover:bg-rose-500/10 transition ${isArtist ? 'text-stone-500 hover:text-rose-700' : 'text-slate-500 hover:text-rose-400'}`}
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`pt-3 border-t flex items-center justify-between ${theme.divider}`}>
                  <span className={`text-xs font-semibold ${theme.mutedText}`}>Cart Subtotal</span>
                  <span className={`text-xl font-black tabular-nums ${theme.accentText}`}>
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${theme.secondaryBtn}`}
                  >
                    Continue Browsing
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToCartCheckout}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 ${theme.accentBtn}`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ARTWORK (ARTIST) ================= */}
      {isAddArtOpen && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${theme.modalBackdrop}`}>
          <div className={`border rounded-3xl p-6 sm:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl ${theme.modalShell}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-lg font-bold ${theme.heading}`}>List New Original Artwork</h3>
                <p className={`text-xs ${theme.mutedText}`}>Share your craft with art enthusiasts in your neighborhood</p>
              </div>
              <button onClick={() => setIsAddArtOpen(false)} className={theme.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleAddArtworkSubmit} className="space-y-4">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Title of Piece *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dawn at Cubbon Park"
                  value={newArtForm.title}
                  onChange={e => setNewArtForm({...newArtForm, title: e.target.value})}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Category *</label>
                  <select
                    value={newArtForm.category}
                    onChange={e => setNewArtForm({...newArtForm, category: e.target.value})}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  >
                    <option>Oil Painting</option>
                    <option>Sculpture</option>
                    <option>Sketch</option>
                    <option>Digital Art</option>
                    <option>Ceramics</option>
                    <option>Textile Art</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Price (₹ INR) *</label>
                  <input
                    required
                    min={1}
                    type="number"
                    placeholder="e.g. 8500"
                    value={newArtForm.price}
                    onChange={e => setNewArtForm({...newArtForm, price: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Medium</label>
                  <input
                    type="text"
                    placeholder="e.g. Acrylic on Canvas"
                    value={newArtForm.medium}
                    onChange={e => setNewArtForm({...newArtForm, medium: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g. 24x36 in"
                    value={newArtForm.dimensions}
                    onChange={e => setNewArtForm({...newArtForm, dimensions: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newArtForm.imageUrl}
                  onChange={e => setNewArtForm({...newArtForm, imageUrl: e.target.value})}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Description & Artisan Backstory</label>
                <textarea
                  rows="3"
                  placeholder="Describe your artistic inspiration, technique, and framing notes..."
                  value={newArtForm.description}
                  onChange={e => setNewArtForm({...newArtForm, description: e.target.value})}
                  className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${theme.input}`}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddArtOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${theme.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingArt}
                  className={`flex-1 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${theme.accentBtn}`}
                >
                  {isSubmittingArt ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving to MongoDB Atlas...
                    </>
                  ) : (
                    'Publish Artwork'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST CUSTOM DEMAND (BUYER) ================= */}
      {isCreateRequestOpen && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${theme.modalBackdrop}`}>
          <div className={`border rounded-3xl p-6 sm:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl ${theme.modalShell}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-lg font-bold ${theme.heading}`}>Post Custom Art Demand</h3>
                <p className={`text-xs ${theme.mutedText}`}>Describe what you need and receive price quotes from local artists</p>
              </div>
              <button type="button" onClick={() => setIsCreateRequestOpen(false)} className={theme.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCreateRequestSubmit} className="space-y-4">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Requirement Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Modern Minimalist Acrylic on Canvas for Dining Space"
                  value={newReqForm.title}
                  onChange={e => setNewReqForm({...newReqForm, title: e.target.value})}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Min Budget (₹) *</label>
                  <input
                    required
                    min={1}
                    type="number"
                    placeholder="e.g. 5000"
                    value={newReqForm.budgetMin}
                    onChange={e => setNewReqForm({...newReqForm, budgetMin: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Max Budget (₹) *</label>
                  <input
                    required
                    min={1}
                    type="number"
                    placeholder="e.g. 15000"
                    value={newReqForm.budgetMax}
                    onChange={e => setNewReqForm({...newReqForm, budgetMax: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Category</label>
                  <select
                    value={newReqForm.category}
                    onChange={e => setNewReqForm({...newReqForm, category: e.target.value})}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  >
                    <option>Modern Art</option>
                    <option>Oil Painting</option>
                    <option>Sculpture</option>
                    <option>Sketch</option>
                    <option>Ceramics</option>
                    <option>Textile Art</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Target Delivery Date *</label>
                  <input
                    required
                    type="date"
                    value={newReqForm.deadline}
                    onChange={e => setNewReqForm({...newReqForm, deadline: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Detailed Specifications</label>
                <textarea
                  rows="3"
                  placeholder="Describe desired dimensions, palette, wall ambient lighting, subject matter..."
                  value={newReqForm.description}
                  onChange={e => setNewReqForm({...newReqForm, description: e.target.value})}
                  className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${theme.input}`}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRequestOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${theme.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReq}
                  className={`flex-1 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${theme.accentBtn}`}
                >
                  {isSubmittingReq ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving to MongoDB...
                    </>
                  ) : (
                    'Broadcast Requirement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ARTIST SUBMIT BID ================= */}
      {activeBidModalItem && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${theme.modalBackdrop}`}>
          <div className={`border rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-4 shadow-2xl ${theme.modalShell}`}>
            <div>
              <h3 className={`text-lg font-bold ${theme.heading}`}>Submit Proposal Quote</h3>
              <p className={`text-xs mt-1 ${theme.mutedText}`}>
                Bidding for: <span className={`font-semibold ${theme.accentText}`}>{activeBidModalItem.title}</span>
              </p>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Your Price (₹) *</label>
                  <input
                    required
                    min={1}
                    type="number"
                    placeholder="e.g. 11000"
                    value={bidForm.amount}
                    onChange={e => setBidForm({...bidForm, amount: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Estimated Days *</label>
                  <input
                    required
                    min={1}
                    type="number"
                    placeholder="e.g. 7"
                    value={bidForm.daysEst}
                    onChange={e => setBidForm({...bidForm, daysEst: e.target.value})}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Proposal & Craftsmanship Concept</label>
                <textarea
                  rows="3"
                  placeholder="Explain your approach, techniques, pigment grade, and milestones..."
                  value={bidForm.proposal}
                  onChange={e => setBidForm({...bidForm, proposal: e.target.value})}
                  className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${theme.input}`}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveBidModalItem(null)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${theme.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${theme.accentBtn}`}
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: 2FA PHONE OTP AUTH ================= */}
      {isAuthModalOpen && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${theme.modalBackdrop}`}>
          <div className={`border rounded-3xl p-6 sm:p-7 w-full max-w-sm space-y-5 shadow-2xl ${theme.modalShell}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-bold flex items-center gap-2 ${theme.heading}`}>
                <Shield className="w-4 h-4 text-emerald-500" /> Account Security & OTP
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className={`text-xs ${theme.closeBtn}`}>✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Mobile Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={loginPhone || currentUser.phone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`}
                  />
                  <button
                    type="button"
                    onClick={() => { setOtpSent(true); showNotification("Verification code sent to mobile!"); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${theme.secondaryBtn} ${theme.accentText}`}
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="animate-in fade-in">
                  <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Enter 4-Digit OTP Code</label>
                  <input
                    type="text"
                    placeholder="• • • •"
                    maxLength={4}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs tracking-widest text-center font-mono focus:outline-none ${theme.input}`}
                  />
                </div>
              )}

              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme.mutedText}`}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (loginPhone) {
                    const updated = { ...currentUser, phone: loginPhone.trim() };
                    setCurrentUser(updated);
                    try {
                      localStorage.setItem('artisanhub_current_user', JSON.stringify(updated));
                    } catch {}
                  }
                  setIsAuthModalOpen(false);
                  showNotification("Phone Number Verified & 2FA Confirmed!");
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
              >
                Verify & Save Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`mt-16 border-t py-8 px-4 sm:px-8 text-center text-xs space-y-2 transition-colors duration-300 ${theme.footer}`}>
        <p className={`flex items-center justify-center gap-1.5 font-medium ${theme.bodyText}`}>
          {isArtist ? 'ArtisanStudio' : 'ArtisanHub'} <span className={theme.mutedText}>·</span> Empowering Hyper-Local Creators & Discerning Art Patrons
        </p>
        <p className={`text-[11px] ${theme.mutedText}`}>
          Built with React 19 & Tailwind CSS v4 · All rights reserved.
        </p>
      </footer>
    </div>
  );
}