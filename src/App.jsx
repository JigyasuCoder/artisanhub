import React, { useState, useEffect } from 'react';
import { 
  Shield, MapPin, Plus, Phone, User, Gavel, 
  CheckCircle2, Sparkles, Clock, Briefcase,
  Eye, Check, Calendar, LogOut, Database, RefreshCw
} from 'lucide-react';
import SearchFilterBar from './components/SearchFilterBar';
import AuthPage from './components/AuthPage';
import ArtGalleryGrid from './components/ArtGalleryGrid';

// Full-Stack API Endpoint (routes through unified Express server)
const API_BASE_URL = "/api";

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
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80', 
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
    imageUrl: 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?auto=format&fit=crop&w=800&q=80', 
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  // Authentication Gate State - Persistent across reloads
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

  // Database Connection Info
  const [dbStatus, setDbStatus] = useState({ connected: false, database: 'artisanhub', checked: false });

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper function to format prices in INR (₹)
  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  // Check live MongoDB Atlas status
  const checkDbStatus = () => {
    fetch(`${API_BASE_URL}/db-status`)
      .then(res => res.json())
      .then(data => {
        setDbStatus({
          connected: !!data.connected,
          database: data.database || 'artisanhub',
          checked: true
        });
      })
      .catch(() => setDbStatus({ connected: false, database: 'offline', checked: true }));
  };

  // Fetch initial data from full-stack MongoDB Express API
  useEffect(() => {
    checkDbStatus();

    fetch(`${API_BASE_URL}/artworks`)
      .then((res) => {
        if (!res.ok) throw new Error("API not available");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Direct sync with MongoDB Atlas collection
          setProducts(data);
          try {
            localStorage.setItem('artisanhub_products_cache', JSON.stringify(data));
          } catch (e) {
            console.warn(e);
          }
        }
      })
      .catch((err) => console.log("Using cached artworks:", err.message));

    fetch(`${API_BASE_URL}/custom-requests`)
      .then((res) => {
        if (!res.ok) throw new Error("API not available");
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
        if (!res.ok) throw new Error("API not available");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAuctions(data);
      })
      .catch(() => {});
  }, []);

  // Extract distinct artists & categories for filter bar
  const artistsList = Array.from(new Set(products.map(p => p.artist))).filter(Boolean);
  const categoriesList = ['All', 'Oil Painting', 'Sculpture', 'Sketch', 'Digital Art', 'Ceramics', 'Textile Art'];

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedArtist('All');
    setMaxPriceFilter(100000);
    setSortBy('default');
  };

  // Filter & Sort artworks catalog
  const filteredProducts = products.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.medium && item.medium.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesArtist = selectedArtist === 'All' || item.artist === selectedArtist;
    const matchesPrice = item.price <= maxPriceFilter;
    return matchesSearch && matchesCategory && matchesArtist && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'likes-desc') return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  // Successful auth callback from AuthPage - Saves session persistently
  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setIsAuthViewOpen(false);
    try {
      localStorage.setItem('artisanhub_is_authenticated', 'true');
      localStorage.setItem('artisanhub_current_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e);
    }
    showNotification(`Welcome, ${userData.name}! Authenticated as ${userData.role === 'artist' ? 'Artisan' : 'Buyer'}.`);
  };

  // Sign out back to login screen - Clears persistent session
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsAuthViewOpen(false);
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

  // Switch persona toggle
  const toggleRole = () => {
    const newRole = currentUser.role === 'buyer' ? 'artist' : 'buyer';
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    try {
      localStorage.setItem('artisanhub_current_user', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    showNotification(`Switched to ${newRole === 'buyer' ? 'Buyer Portal' : 'Artist Studio'} View`);
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
      setProducts(cur => {
        const nextProducts = cur.map(p => {
          if (p.id === artId || p._id === artId) {
            return { ...p, likes: (p.likes || 0) + (isLiked ? 1 : -1) };
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

  // Submit new artwork listing - Persists directly to MongoDB Atlas
  const handleAddArtworkSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingArt(true);

    const artPayload = {
      title: newArtForm.title.trim(),
      artist: (currentUser.name || 'Local Artisan').trim(),
      category: newArtForm.category,
      price: Number(newArtForm.price),
      medium: newArtForm.medium ? newArtForm.medium.trim() : 'Canvas & Oil',
      dimensions: newArtForm.dimensions ? newArtForm.dimensions.trim() : 'Custom Size',
      description: newArtForm.description ? newArtForm.description.trim() : '',
      imageUrl: newArtForm.imageUrl ? newArtForm.imageUrl.trim() : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
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

      if (res.ok && data) {
        // Saved to MongoDB Atlas successfully
        setProducts(prev => [data, ...prev.filter(p => (p.id || p._id) !== (data.id || data._id))]);
        try {
          const cached = [data, ...products];
          localStorage.setItem('artisanhub_products_cache', JSON.stringify(cached));
        } catch (e) {
          console.warn('Failed to cache new artwork:', e);
        }

        setIsAddArtOpen(false);
        setNewArtForm({ title: '', category: 'Oil Painting', price: '', medium: '', dimensions: '', description: '', imageUrl: '' });
        showNotification("Artwork saved to MongoDB Atlas & now live across all devices!");
        checkDbStatus();
      } else {
        showNotification(`Could not save artwork to database: ${data.message || 'Server error'}`);
      }
    } catch (err) {
      showNotification(`Database network error: ${err.message || 'Failed to reach server'}`);
    } finally {
      setIsSubmittingArt(false);
    }
  };

  // Submit custom demand request
  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    const reqData = {
      buyerName: currentUser.name || 'Art Patron',
      title: newReqForm.title,
      category: newReqForm.category,
      budgetMin: Number(newReqForm.budgetMin),
      budgetMax: Number(newReqForm.budgetMax),
      deadline: newReqForm.deadline,
      description: newReqForm.description,
      location: currentUser.location || 'Bengaluru Local',
      status: 'open',
      createdAt: 'Just now',
      bids: []
    };

    let createdReq = { id: `req-${Date.now()}`, ...reqData };

    try {
      const res = await fetch(`${API_BASE_URL}/custom-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      });
      if (res.ok) {
        createdReq = await res.json();
      }
    } catch {
      console.log("Saved locally to state.");
    }

    setBuyerRequests(prev => {
      const updated = [createdReq, ...prev];
      try {
        localStorage.setItem('artisanhub_requests_cache', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    setIsCreateRequestOpen(false);
    setNewReqForm({ title: '', category: 'Modern Art', budgetMin: '', budgetMax: '', deadline: '', description: '' });
    showNotification("Custom demand posted successfully! Local artists notified.");
  };

  // Artist Bids on Custom Demand
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!activeBidModalItem) return;

    const bidData = {
      id: `bid-${Date.now()}`,
      artistName: currentUser.name,
      amount: Number(bidForm.amount),
      daysEst: Number(bidForm.daysEst),
      proposal: bidForm.proposal,
      status: 'Pending',
      timestamp: 'Just now'
    };

    try {
      await fetch(`${API_BASE_URL}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: activeBidModalItem.id || activeBidModalItem._id,
          ...bidData
        })
      });
    } catch {
      console.log("Bid saved locally.");
    }

    setBuyerRequests(prev => {
      const updated = prev.map(req => {
        const targetId = req.id || req._id;
        const activeId = activeBidModalItem.id || activeBidModalItem._id;
        if (targetId === activeId) {
          return { ...req, bids: req.bids ? [bidData, ...req.bids] : [bidData] };
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

    setActiveBidModalItem(null);
    setBidForm({ amount: '', daysEst: '', proposal: '' });
    showNotification("Proposal quote submitted to buyer!");
  };

  // Buyer accepts an artist's proposal bid
  const handleAcceptBid = (reqId, bidId, artistName) => {
    setBuyerRequests(prev => prev.map(req => {
      const targetId = req.id || req._id;
      if (targetId === reqId) {
        const updatedBids = req.bids.map(b => {
          if (b.id === bidId) {
            return { ...b, status: 'Accepted' };
          }
          return { ...b, status: b.status === 'Accepted' ? 'Accepted' : 'Pending' };
        });
        return { ...req, status: 'in-progress', bids: updatedBids };
      }
      return req;
    }));
    showNotification(`Proposal from ${artistName} accepted! Collaboration initiated.`);
  };

  // Handle Auction Bidding
  const handleAuctionBid = (aucId, numericBid) => {
    setAuctions(prev => prev.map(auc => {
      const targetId = auc.id || auc._id;
      if (targetId === aucId) {
        if (numericBid <= auc.currentBid) {
          alert(`Bid must be higher than current price (${formatPrice(auc.currentBid)})`);
          return auc;
        }
        showNotification(`Bid placed successfully for ${formatPrice(numericBid)}!`);
        return { ...auc, currentBid: numericBid, bidsCount: (auc.bidsCount || 0) + 1 };
      }
      return auc;
    }));
  };

  // Gate Dashboard behind authentication - Login page displayed first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-amber-400 text-slate-950 px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2.5 animate-bounce border border-amber-300">
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-400 selection:text-slate-950 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-amber-400 text-slate-950 px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2.5 animate-bounce border border-amber-300">
          <Sparkles className="w-4 h-4 shrink-0 text-slate-950" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR / HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-amber-300 w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-amber-500/20">
              AH
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-100">
                Artisan<span className="text-amber-400">Hub</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2 border-l border-slate-800 pl-2">
                Hyper-Local Art Network
              </span>
            </div>

            {/* Live Database Status Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px]">
              <Database className="w-3 h-3 text-slate-400" />
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={dbStatus.connected ? 'text-emerald-300 font-semibold' : 'text-amber-300'}>
                {dbStatus.connected ? `MongoDB Atlas: ${dbStatus.database}` : 'Connecting DB...'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'marketplace' 
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Art Gallery
            </button>
            <button
              onClick={() => setActiveTab('demands')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'demands' 
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Demands & Bids
            </button>
            <button
              onClick={() => setActiveTab('auctions')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'auctions' 
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
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
                activeTab === 'profile' && !isAuthViewOpen
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Collector Profile
            </button>
            <button
              onClick={() => {
                setActiveTab('future');
                setIsAuthViewOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'future' && !isAuthViewOpen
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Roadmap
            </button>
          </nav>

          {/* Zone 3: Persona Toggle, User Info & Sign Out */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={toggleRole}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentUser.role === 'buyer' 
                    ? 'bg-amber-400 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buyer</span>
              </button>
              <button
                onClick={toggleRole}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentUser.role === 'artist' 
                    ? 'bg-amber-400 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Artist</span>
              </button>
            </div>

            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-800 text-slate-300 transition"
              title="Click to manage 2FA OTP verification"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[110px]">{currentUser.name}</span>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                Verified
              </span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition bg-slate-900 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 shadow-sm"
              title="Sign out to return to login screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="flex lg:hidden gap-1.5 overflow-x-auto scrollbar-none pt-2.5 mt-2 border-t border-slate-900">
          <button
            onClick={() => {
              setActiveTab('marketplace');
              setIsAuthViewOpen(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'marketplace' && !isAuthViewOpen ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'
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
              activeTab === 'demands' && !isAuthViewOpen ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'
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
              activeTab === 'auctions' && !isAuthViewOpen ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'
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
              activeTab === 'profile' && !isAuthViewOpen ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Profile
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap text-rose-400 hover:text-rose-300 bg-slate-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* HERO BANNER SECTION (High-Converting with Dual CTAs) */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        {/* Subtle decorative background ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Value Prop & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Hyper-Local Artisan Discovery in Bengaluru</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-semibold">Zero Commission</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
                Discover & Commission Handcrafted Art in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Your Neighborhood</span>
              </h1>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                Directly connect with master painters, sculptors, and ceramists living near you. Post bespoke art demands, receive competitive bids from local creators, or acquire authenticated original pieces.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setCurrentUser(prev => ({ ...prev, role: 'buyer' }));
                    setIsCreateRequestOpen(true);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Post Custom Demand
                </button>

                <button
                  onClick={() => {
                    setCurrentUser(prev => ({ ...prev, role: 'artist' }));
                    setIsAddArtOpen(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700/80 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Briefcase className="w-4 h-4 text-amber-400" /> List Your Artwork
                </button>
              </div>

              {/* Trust Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
                <div>
                  <div className="text-lg sm:text-xl font-black text-slate-100 tabular-nums">180+</div>
                  <div className="text-[11px] text-slate-500 font-medium">Local Artisans</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-amber-400 tabular-nums">₹12.4L+</div>
                  <div className="text-[11px] text-slate-500 font-medium">Direct Commissions</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Phone-Verified</div>
                </div>
              </div>
            </div>

            {/* Right Column: Curated Artwork Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="relative group bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden p-3 shadow-2xl shadow-slate-950/80 transition-all hover:border-slate-700">
                <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-950">
                  <img 
                    src={INITIAL_ARTWORKS[0].imageUrl} 
                    alt="Curated Artwork of the Week" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Top Glassmorphic Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="backdrop-blur-md bg-slate-950/70 border border-white/10 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3 h-3" /> Featured of the Week
                    </span>
                    <span className="backdrop-blur-md bg-slate-950/70 border border-white/10 text-slate-200 text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" /> Indiranagar
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <h3 className="text-base font-bold text-slate-100">{INITIAL_ARTWORKS[0].title}</h3>
                    <p className="text-xs text-slate-300">By {INITIAL_ARTWORKS[0].artist} · {INITIAL_ARTWORKS[0].medium}</p>
                  </div>
                </div>

                <div className="p-3 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Artisan Asking Price</span>
                    <span className="text-xl font-black text-amber-400 tabular-nums">{formatPrice(INITIAL_ARTWORKS[0].price)}</span>
                  </div>

                  <button 
                    onClick={() => setQuickViewProduct(INITIAL_ARTWORKS[0])}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> Quick View
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

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
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Hyper-Local Art Gallery</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Authentic original artworks directly curated from neighborhood creators</p>
              </div>

              {currentUser.role === 'artist' ? (
                <button
                  onClick={() => setIsAddArtOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-amber-400/20 shrink-0"
                >
                  <Plus className="w-4 h-4" /> List New Artwork
                </button>
              ) : (
                <button
                  onClick={() => setIsCreateRequestOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition border border-slate-700 shrink-0"
                >
                  <Plus className="w-4 h-4 text-amber-400" /> Post Custom Request
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
              priceRange={maxPriceFilter}
              setPriceRange={setMaxPriceFilter}
              maxAvailablePrice={100000}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onResetFilters={handleResetFilters}
              totalResults={filteredProducts.length}
            />

            {/* Responsive Glassmorphism Art Gallery Grid */}
            <ArtGalleryGrid
              artworks={filteredProducts}
              likedArtworks={likedArtworks}
              onToggleLike={handleToggleLike}
              onQuickView={(art) => setQuickViewProduct(art)}
              onInquire={(art) => showNotification(`Contact request initiated for artist ${art.artist}!`)}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        {/* ================= TAB 2: CUSTOM DEMANDS & ACTIVE BIDS ================= */}
        {activeTab === 'demands' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Buyer Art Demands & Bidding Portal</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Patrons submit custom commission requirements while verified neighborhood artists submit price quotes</p>
              </div>

              {currentUser.role === 'buyer' && (
                <button
                  onClick={() => setIsCreateRequestOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-amber-400/20 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Post Custom Art Need
                </button>
              )}
            </div>

            {/* Demands Filter Strip */}
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-fit">
              <button
                onClick={() => setDemandsFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  demandsFilter === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Demands ({buyerRequests.length})
              </button>
              <button
                onClick={() => setDemandsFilter('open')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  demandsFilter === 'open' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Accepting Bids
              </button>
              <button
                onClick={() => setDemandsFilter('in-progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  demandsFilter === 'in-progress' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                In Progress
              </button>
            </div>

            {/* Demands Listing Cards */}
            <div className="space-y-6">
              {filteredRequests.map(req => {
                const isOpen = req.status === 'open';
                return (
                  <div key={req.id || req._id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                    
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800/80">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                            {req.category}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                            isOpen 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}>
                            {isOpen ? 'Open for Bidding' : 'Proposal Accepted'}
                          </span>
                          <h3 className="font-bold text-lg text-slate-100">{req.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          Posted by <span className="text-slate-200 font-medium">{req.buyerName}</span>
                          <span>·</span>
                          <MapPin className="w-3.5 h-3.5 text-amber-400" /> {req.location}
                          <span>·</span>
                          <span className="text-slate-500">{req.createdAt || 'Recent'}</span>
                        </p>
                      </div>

                      <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-left md:text-right shrink-0">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Target Budget</span>
                        <span className="text-base font-extrabold text-amber-400 tabular-nums">
                          {formatPrice(req.budgetMin)} - {formatPrice(req.budgetMax)}
                        </span>
                      </div>
                    </div>

                    {/* Demand Brief Body */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patron's Brief & Specifications</span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{req.description}</p>
                    </div>

                    {/* Timeline & Actions Footer */}
                    <div className="flex flex-wrap justify-between items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" /> Deadline: <span className="text-slate-200 font-semibold">{req.deadline}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Gavel className="w-4 h-4 text-slate-500" /> Bids Submitted: <span className="text-amber-400 font-bold">{req.bids?.length || 0}</span>
                        </span>
                      </div>

                      {currentUser.role === 'artist' && (
                        <button
                          onClick={() => setActiveBidModalItem(req)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                        >
                          <Gavel className="w-3.5 h-3.5" /> Submit Price Proposal
                        </button>
                      )}
                    </div>

                    {/* BIDDING TIMELINE VIEW */}
                    <div className="pt-4 border-t border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> Active Artist Bids Timeline
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {req.bids?.length ? `${req.bids.length} proposal(s)` : 'No bids yet'}
                        </span>
                      </div>

                      {req.bids && req.bids.length > 0 ? (
                        <div className="relative pl-6 border-l-2 border-slate-800 space-y-5">
                          {req.bids.map((bid) => {
                            const isAccepted = bid.status === 'Accepted';
                            return (
                              <div key={bid.id} className="relative group">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 transition-all ${
                                  isAccepted 
                                    ? 'bg-emerald-400 border-slate-950 ring-4 ring-emerald-500/20' 
                                    : 'bg-amber-400 border-slate-950 ring-4 ring-amber-400/20'
                                }`} />

                                {/* Bid Card Content */}
                                <div className={`bg-slate-950 border rounded-2xl p-4 space-y-3 transition ${
                                  isAccepted ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'
                                }`}>
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 bg-amber-400/10 text-amber-400 rounded-lg flex items-center justify-center font-bold text-xs">
                                        {bid.artistName.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-xs sm:text-sm text-slate-200">{bid.artistName}</div>
                                        <div className="text-[10px] text-slate-500">{bid.timestamp || 'Recent proposal'}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      {/* Status Badge */}
                                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                        isAccepted 
                                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                          : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                                      }`}>
                                        {isAccepted ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {bid.status || 'Pending'}
                                      </span>

                                      <div className="text-right">
                                        <div className="text-sm sm:text-base font-black text-amber-400 tabular-nums">
                                          {formatPrice(bid.amount)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">Est. {bid.daysEst} Days</div>
                                      </div>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                                    "{bid.proposal}"
                                  </p>

                                  {/* Buyer Accept Action */}
                                  {currentUser.role === 'buyer' && !isAccepted && (
                                    <div className="flex justify-end pt-1">
                                      <button
                                        onClick={() => handleAcceptBid(req.id || req._id, bid.id, bid.artistName)}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                                      >
                                        <Check className="w-3.5 h-3.5" /> Accept Proposal
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Special Limited Edition Auctions</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Exclusive timed bidding portal for rare, numbered, and high-value masterworks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {auctions.map(auc => (
                <div key={auc.id || auc._id} className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden p-5 flex flex-col sm:flex-row gap-5 shadow-xl hover:border-slate-700 transition">
                  <div className="relative w-full sm:w-48 h-52 sm:h-auto rounded-2xl overflow-hidden bg-slate-950 shrink-0">
                    <img src={auc.imageUrl} alt={auc.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 backdrop-blur-md bg-slate-950/75 border border-white/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      LIVE
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{auc.category}</span>
                      <h3 className="font-bold text-base text-slate-100">{auc.title}</h3>
                      <p className="text-xs text-slate-400">By <span className="text-slate-200 font-medium">{auc.artist}</span></p>
                      <p className="text-xs text-slate-400 line-clamp-2 pt-1">{auc.description}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Current High Bid</span>
                        <span className="text-xl font-black text-amber-400 tabular-nums">{formatPrice(auc.currentBid)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bids Placed</span>
                        <span className="text-xs font-bold text-slate-300 tabular-nums">{auc.bidsCount} Bids</span>
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                      <button 
                        type="submit" 
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap shadow-md shadow-amber-400/20"
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
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-100">{currentUser.name}</h2>
                      <span className="bg-amber-400/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30 uppercase">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {currentUser.location} · Member since {currentUser.joinedDate}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={toggleRole}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  Switch to {currentUser.role === 'buyer' ? 'Artist Studio' : 'Buyer Portal'}
                </button>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800/80">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> Phone Verification & Authenticity
                </h3>
                
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{currentUser.phone}</p>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mobile Number Authenticated with 2FA OTP
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition"
                  >
                    Manage Phone
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold block">Artisan & Collector Bio</label>
                <textarea 
                  defaultValue={currentUser.bio} 
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 transition"
                ></textarea>
              </div>

              <button 
                onClick={() => showNotification("Profile information updated successfully!")}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-amber-400/20"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ROADMAP EXTENSIONS ================= */}
        {activeTab === 'future' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">ArtisanHub Platform Roadmap</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Upcoming hyper-local modules designed to empower neighborhood creator economies</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center font-bold text-xs border border-purple-500/20">
                  AR
                </div>
                <h3 className="font-bold text-base text-slate-100">AR Room Visualizer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Patrons preview canvas dimensions and frame finishes on their living room wall in live scale before confirming commissions.
                </p>
                <span className="inline-block text-[10px] font-bold bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md">Phase 2</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-bold text-xs border border-amber-500/20">
                  WS
                </div>
                <h3 className="font-bold text-base text-slate-100">Neighborhood Masterclasses</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Weekend pottery, oil painting, and heritage sculpting workshops hosted directly at the artist's local studio space.
                </p>
                <span className="inline-block text-[10px] font-bold bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md">Phase 3</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                  NFT
                </div>
                <h3 className="font-bold text-base text-slate-100">Digital Authenticity NFC</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically signed NFC certificates embedded into physical canvas frames to guarantee provenance and resale royalties.
                </p>
                <span className="inline-block text-[10px] font-bold bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md">Phase 4</span>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* ================= MODAL: QUICK-VIEW ARTWORK ================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-72 sm:h-80 bg-slate-950">
              <img 
                src={quickViewProduct.imageUrl} 
                alt={quickViewProduct.title} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setQuickViewProduct(null)} 
                className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-sm transition"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="backdrop-blur-md bg-slate-950/80 border border-white/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-xl">
                  {quickViewProduct.category}
                </span>
                <span className="backdrop-blur-md bg-slate-950/80 border border-white/10 text-slate-200 text-xs font-medium px-3 py-1 rounded-xl flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {quickViewProduct.location}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-100">{quickViewProduct.title}</h3>
                  <p className="text-xs text-slate-400">Created by <span className="text-slate-200 font-semibold">{quickViewProduct.artist}</span></p>
                </div>
                <div className="text-2xl font-black text-amber-400 tabular-nums">
                  {formatPrice(quickViewProduct.price)}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                {quickViewProduct.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Medium / Materials</span>
                  <span className="text-slate-200 font-medium">{quickViewProduct.medium}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Dimensions</span>
                  <span className="text-slate-200 font-medium tabular-nums">{quickViewProduct.dimensions}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setQuickViewProduct(null)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setQuickViewProduct(null);
                    showNotification(`Inquiry dispatched to artist ${quickViewProduct.artist}! Phone connection opened.`);
                  }}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/20"
                >
                  <Phone className="w-3.5 h-3.5" /> Connect with Artist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ARTWORK (ARTIST) ================= */}
      {isAddArtOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-100">List New Original Artwork</h3>
                <p className="text-xs text-slate-400">Share your craft with art enthusiasts in your neighborhood</p>
              </div>
              <button onClick={() => setIsAddArtOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddArtworkSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Title of Piece *</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Dawn at Cubbon Park"
                  value={newArtForm.title} 
                  onChange={e => setNewArtForm({...newArtForm, title: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Category *</label>
                  <select 
                    value={newArtForm.category} 
                    onChange={e => setNewArtForm({...newArtForm, category: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
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
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Price (₹ INR) *</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 8500" 
                    value={newArtForm.price} 
                    onChange={e => setNewArtForm({...newArtForm, price: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Medium</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acrylic on Canvas" 
                    value={newArtForm.medium} 
                    onChange={e => setNewArtForm({...newArtForm, medium: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Dimensions</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 24x36 in" 
                    value={newArtForm.dimensions} 
                    onChange={e => setNewArtForm({...newArtForm, dimensions: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={newArtForm.imageUrl} 
                  onChange={e => setNewArtForm({...newArtForm, imageUrl: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Description & Artisan Backstory</label>
                <textarea 
                  rows="3" 
                  placeholder="Describe your artistic inspiration, technique, and framing notes..."
                  value={newArtForm.description} 
                  onChange={e => setNewArtForm({...newArtForm, description: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddArtOpen(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingArt}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Post Custom Art Demand</h3>
                <p className="text-xs text-slate-400">Describe what you need and receive price quotes from local artists</p>
              </div>
              <button onClick={() => setIsCreateRequestOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRequestSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Requirement Title *</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Modern Minimalist Acrylic on Canvas for Dining Space" 
                  value={newReqForm.title} 
                  onChange={e => setNewReqForm({...newReqForm, title: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Min Budget (₹) *</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={newReqForm.budgetMin} 
                    onChange={e => setNewReqForm({...newReqForm, budgetMin: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Max Budget (₹) *</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 15000" 
                    value={newReqForm.budgetMax} 
                    onChange={e => setNewReqForm({...newReqForm, budgetMax: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Category</label>
                  <select 
                    value={newReqForm.category} 
                    onChange={e => setNewReqForm({...newReqForm, category: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
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
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Target Delivery Date *</label>
                  <input 
                    required 
                    type="date" 
                    value={newReqForm.deadline} 
                    onChange={e => setNewReqForm({...newReqForm, deadline: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Detailed Specifications</label>
                <textarea 
                  rows="3" 
                  placeholder="Describe desired dimensions, palette, wall ambient lighting, subject matter..."
                  value={newReqForm.description} 
                  onChange={e => setNewReqForm({...newReqForm, description: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateRequestOpen(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-400/20"
                >
                  Broadcast Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ARTIST SUBMIT BID ================= */}
      {activeBidModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-4 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Submit Proposal Quote</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bidding for: <span className="text-amber-400 font-semibold">{activeBidModalItem.title}</span>
              </p>
            </div>
            
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Your Price (₹) *</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 11000" 
                    value={bidForm.amount} 
                    onChange={e => setBidForm({...bidForm, amount: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Estimated Days *</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 7" 
                    value={bidForm.daysEst} 
                    onChange={e => setBidForm({...bidForm, daysEst: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Proposal & Craftsmanship Concept</label>
                <textarea 
                  rows="3" 
                  placeholder="Explain your approach, techniques, pigment grade, and milestones..." 
                  value={bidForm.proposal} 
                  onChange={e => setBidForm({...bidForm, proposal: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveBidModalItem(null)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-400/20"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-sm space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Account Security & OTP
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    value={loginPhone || currentUser.phone} 
                    onChange={e => setLoginPhone(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  <button 
                    type="button"
                    onClick={() => { setOtpSent(true); showNotification("Verification code sent to mobile!"); }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="animate-in fade-in">
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Enter 4-Digit OTP Code</label>
                  <input 
                    type="text" 
                    placeholder="• • • •" 
                    maxLength={4}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 tracking-widest text-center font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button 
                type="button"
                onClick={() => {
                  if (loginPhone) setCurrentUser(prev => ({ ...prev, phone: loginPhone }));
                  setIsAuthModalOpen(false);
                  showNotification("Phone Number Verified & 2FA Confirmed!");
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
              >
                Verify & Save Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <p className="flex items-center justify-center gap-1.5 text-slate-400 font-medium">
          ArtisanHub <span className="text-slate-600">·</span> Empowering Hyper-Local Creators & Discerning Art Patrons
        </p>
        <p className="text-[11px] text-slate-600">
          Built with React 19 & Tailwind CSS v4 · All rights reserved.
        </p>
      </footer>
    </div>
  );
}