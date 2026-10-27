import React, { useState, useEffect } from 'react';
import { 
  Search, Shield, MapPin, Plus, Lock, Phone, User, Gavel, 
  MessageSquare, Sliders, CheckCircle2, ChevronRight, Award, 
  ArrowUpRight, Sparkles, Filter, Clock, Tag, Briefcase, Eye,
  AlertCircle, ChevronDown, DollarSign, Heart, Share2, Zap,
  Settings, Check, X, RefreshCw, Calendar, FileText
} from 'lucide-react';

// Optional Express + MongoDB API Endpoint (Falls back seamlessly to local mock data)
const API_BASE_URL = "http://localhost:5000/api";

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
    description: 'Hand-painted serene sunset depiction of the Western Ghats range using thick palette knife technique.',
    likes: 42
  },
  { 
    id: 'art-2', 
    title: 'Terracotta Sculpted Mask', 
    artist: 'Priya Nair', 
    category: 'Sculpture', 
    price: 4500, 
    medium: 'Natural Clay', 
    dimensions: '12x8 in', 
    location: 'Koramangala, Bengaluru', 
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', 
    description: 'Traditional eco-friendly terracotta artwork handcrafted locally by master heritage sculptors.',
    likes: 29
  },
  { 
    id: 'art-3', 
    title: 'Monochromes of Old Market', 
    artist: 'Arjun Das', 
    category: 'Sketch', 
    price: 3200, 
    medium: 'Charcoal on Paper', 
    dimensions: '18x24 in', 
    location: 'Jayanagar, Bengaluru', 
    imageUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=800&q=80', 
    description: 'Detailed charcoal sketch capturing early morning bustle in historic South Bengaluru bazaar.',
    likes: 67
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
    description: 'Futuristic neon digital rendering of tech parks blended with ancient banyan trees.',
    likes: 88
  },
  { 
    id: 'art-5', 
    title: 'Handmade Glazed Ceramic Urn', 
    artist: 'Suresh Hegde', 
    category: 'Ceramics', 
    price: 6000, 
    medium: 'Stoneware Clay', 
    dimensions: '14x10 in', 
    location: 'HSR Layout, Bengaluru', 
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80', 
    description: 'High-fired stoneware ceramic urn glazed with organic indigo mineral dyes.',
    likes: 15
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
    bids: [
      { id: 'bid-1', artistName: 'Rohan Verma', amount: 12000, daysEst: 8, proposal: 'I can use metallic gold leaf accents over rich deep ultramarine acrylics on premium cotton canvas.' },
      { id: 'bid-2', artistName: 'Kavya Rao', amount: 9500, daysEst: 5, proposal: 'I will create a high-resolution mixed media texture with geometric fluid dynamics.' }
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
    description: 'Need a traditional teakwood carved miniature temple frame with intricate floral border details.',
    status: 'open',
    bids: [
      { id: 'bid-3', artistName: 'Priya Nair', amount: 28000, daysEst: 14, proposal: 'Crafted using seasoned Rosewood with hand-rubbed natural beeswax polish finish.' }
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
    description: 'Lost-wax casting method heritage sculpture with custom serial engraving and physical certificate of authenticity.'
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
    description: '22-carat gold foil studded with unpolished semi-precious Jaipur rubies on teakwood frame.'
  }
];

export default function App() {
  // Current user persona and authentication state
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-101',
    name: 'Ananya Sharma',
    role: 'buyer', // 'buyer' or 'artist'
    phone: '+91 98765 43210',
    isVerified: true,
    location: 'Koramangala, Bengaluru',
    bio: 'Passionate local art collector focusing on contemporary Indian acrylics and traditional handmade pottery.',
    joinedDate: 'March 2024'
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'demands' | 'auctions' | 'profile' | 'future'
  
  // App Data States
  const [products, setProducts] = useState(INITIAL_ARTWORKS);
  const [buyerRequests, setBuyerRequests] = useState(INITIAL_BUYER_REQUESTS);
  const [auctions, setAuctions] = useState(INITIAL_AUCTIONS);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState(100000);

  // Modal Control States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddArtOpen, setIsAddArtOpen] = useState(false);
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [activeBidModalItem, setActiveBidModalItem] = useState(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);

  // Form Input States
  const [newArtForm, setNewArtForm] = useState({
    title: '', category: 'Oil Painting', price: '', medium: '', dimensions: '', description: '', imageUrl: ''
  });
  const [newReqForm, setNewReqForm] = useState({
    title: '', category: 'Oil Painting', budgetMin: '', budgetMax: '', deadline: '', description: ''
  });
  const [bidForm, setBidForm] = useState({
    amount: '', daysEst: '', proposal: ''
  });
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper function to format prices in INR (₹)
  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  // Fetch initial data from Express API if backend server is online
  useEffect(() => {
    fetch(`${API_BASE_URL}/artworks`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data);
      })
      .catch(() => console.log("Backend offline: Operating with rich local sample dataset."));

    fetch(`${API_BASE_URL}/custom-requests`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBuyerRequests(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/auctions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAuctions(data);
      })
      .catch(() => {});
  }, []);

  // Filter artworks catalog
  const filteredProducts = products.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPrice = item.price <= maxPriceFilter;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Switch persona toggle
  const toggleRole = () => {
    const newRole = currentUser.role === 'buyer' ? 'artist' : 'buyer';
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    showNotification(`Switched to ${newRole.toUpperCase()} View`);
  };

  // Submit new artwork listing
  const handleAddArtworkSubmit = async (e) => {
    e.preventDefault();
    const artData = {
      id: `art-${Date.now()}`,
      title: newArtForm.title,
      artist: currentUser.name,
      category: newArtForm.category,
      price: Number(newArtForm.price),
      medium: newArtForm.medium || 'Mixed Medium',
      dimensions: newArtForm.dimensions || 'Custom Size',
      description: newArtForm.description,
      imageUrl: newArtForm.imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      location: currentUser.location,
      likes: 0
    };

    try {
      await fetch(`${API_BASE_URL}/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artData)
      });
    } catch (err) {
      console.log("Saved locally to state.");
    }

    setProducts([artData, ...products]);
    setIsAddArtOpen(false);
    setNewArtForm({ title: '', category: 'Oil Painting', price: '', medium: '', dimensions: '', description: '', imageUrl: '' });
    showNotification("Artwork listed successfully on Hyper-Local Marketplace!");
  };

  // Submit custom demand request
  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    const reqData = {
      id: `req-${Date.now()}`,
      buyerName: currentUser.name,
      title: newReqForm.title,
      category: newReqForm.category,
      budgetMin: Number(newReqForm.budgetMin),
      budgetMax: Number(newReqForm.budgetMax),
      deadline: newReqForm.deadline,
      description: newReqForm.description,
      location: currentUser.location,
      status: 'open',
      bids: []
    };

    try {
      await fetch(`${API_BASE_URL}/custom-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      });
    } catch (err) {
      console.log("Saved locally to state.");
    }

    setBuyerRequests([reqData, ...buyerRequests]);
    setIsCreateRequestOpen(false);
    setNewReqForm({ title: '', category: 'Oil Painting', budgetMin: '', budgetMax: '', deadline: '', description: '' });
    showNotification("Custom demand posted successfully!");
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
      proposal: bidForm.proposal
    };

    setBuyerRequests(prev => prev.map(req => {
      const targetId = req.id || req._id;
      const activeId = activeBidModalItem.id || activeBidModalItem._id;
      if (targetId === activeId) {
        return { ...req, bids: req.bids ? [...req.bids, bidData] : [bidData] };
      }
      return req;
    }));

    setActiveBidModalItem(null);
    setBidForm({ amount: '', daysEst: '', proposal: '' });
    showNotification("Proposal quote submitted to buyer!");
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-amber-400 text-slate-950 px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-amber-300 p-2 rounded-xl text-slate-950 font-black text-xl tracking-wider shadow-lg">
              AH
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-100">
                Artisan<span className="text-amber-400">Hub</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> {currentUser.location}
              </p>
            </div>
          </div>

          {/* Persona Switcher Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={toggleRole}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentUser.role === 'buyer' 
                  ? 'bg-amber-400 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Buyer Portal
            </button>
            <button
              onClick={toggleRole}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentUser.role === 'artist' 
                  ? 'bg-amber-400 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Artist Studio
            </button>
          </div>

          {/* User Phone Auth Info */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{currentUser.phone}</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">OTP Verified</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN NAVIGATION TABS */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-none py-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'marketplace' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" /> Local Marketplace
          </button>

          <button
            onClick={() => setActiveTab('demands')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'demands' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Custom Art Demands & Bids
          </button>

          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'auctions' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gavel className="w-4 h-4" /> Limited Edition Auctions
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> Account Profile
          </button>

          <button
            onClick={() => setActiveTab('future')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'future' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" /> Roadmap Extensions
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">

        {/* ================= TAB 1: LOCAL MARKETPLACE CATALOG ================= */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Hyper-Local Art Catalog</h2>
                <p className="text-xs text-slate-400">Discover authentic handcrafted pieces directly from local neighborhood artists</p>
              </div>

              {currentUser.role === 'artist' && (
                <button
                  onClick={() => setIsAddArtOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg"
                >
                  <Plus className="w-4 h-4" /> List New Artwork
                </button>
              )}
            </div>

            {/* Filter Search Header */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by title, artist, or medium..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                  {['All', 'Oil Painting', 'Sculpture', 'Sketch', 'Digital Art', 'Ceramics'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition ${
                        selectedCategory === cat 
                          ? 'bg-amber-400/10 border-amber-400 text-amber-400' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter Slider */}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Max Price Filter:</span>
                <input 
                  type="range" 
                  min="1000" 
                  max="100000" 
                  step="1000" 
                  value={maxPriceFilter} 
                  onChange={e => setMaxPriceFilter(Number(e.target.value))}
                  className="accent-amber-400 flex-1 max-w-xs cursor-pointer"
                />
                <span className="text-amber-400 font-bold">{formatPrice(maxPriceFilter)}</span>
              </div>
            </div>

            {/* Artwork Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(art => (
                <div key={art.id || art._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition group flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 overflow-hidden bg-slate-950 cursor-pointer" onClick={() => setSelectedProductDetail(art)}>
                      <img 
                        src={art.imageUrl} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-medium border border-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" /> {art.location}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 
                            onClick={() => setSelectedProductDetail(art)}
                            className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition cursor-pointer"
                          >
                            {art.title}
                          </h3>
                          <p className="text-xs text-slate-400">by {art.artist}</p>
                        </div>
                        <span className="text-lg font-extrabold text-amber-400">{formatPrice(art.price)}</span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">{art.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                        <span>{art.medium}</span>
                        <span>{art.dimensions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button 
                      onClick={() => showNotification(`Contact details for ${art.artist} requested!`)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Connect with Artist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: CUSTOM DEMANDS & OPEN BIDS ================= */}
        {activeTab === 'demands' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Buyer Art Demands & Open Bids</h2>
                <p className="text-xs text-slate-400">Buyers state custom art requirements while local artists submit price proposals</p>
              </div>

              {currentUser.role === 'buyer' && (
                <button
                  onClick={() => setIsCreateRequestOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Post Custom Art Need
                </button>
              )}
            </div>

            {/* Demands Listing */}
            <div className="space-y-4">
              {buyerRequests.map(req => (
                <div key={req.id || req._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {req.category}
                        </span>
                        <h3 className="font-bold text-base text-slate-100">{req.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Requested by {req.buyerName} • <span className="text-slate-500">{req.location}</span></p>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 block">Preferred Budget Range</span>
                      <span className="text-sm font-bold text-amber-400">{formatPrice(req.budgetMin)} - {formatPrice(req.budgetMax)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">{req.description}</p>

                  <div className="flex flex-wrap justify-between items-center gap-4 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> Needed by: {req.deadline}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-500" /> Bids Submitted: {req.bids?.length || 0}</span>
                    </div>

                    {currentUser.role === 'artist' ? (
                      <button
                        onClick={() => setActiveBidModalItem(req)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Gavel className="w-3.5 h-3.5" /> Submit Price Proposal
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Artists are bidding on this demand...</span>
                    )}
                  </div>

                  {/* Submitted Bids Listing */}
                  {req.bids && req.bids.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submitted Artist Proposals</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {req.bids.map((bid, i) => (
                          <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-xs text-slate-200">{bid.artistName}</span>
                              <span className="text-sm font-extrabold text-amber-400">{formatPrice(bid.amount)}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">Est. Time: {bid.daysEst} Days</p>
                            <p className="text-xs text-slate-300 italic">"{bid.proposal}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: LIMITED EDITION AUCTIONS ================= */}
        {activeTab === 'auctions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Special Limited Edition Auctions</h2>
              <p className="text-xs text-slate-400">Exclusive bidding portal for rare, numbered, and high-value artworks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {auctions.map(auc => (
                <div key={auc.id || auc._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row gap-4">
                  <img src={auc.imageUrl} alt={auc.title} className="w-full sm:w-44 h-44 object-cover rounded-xl" />

                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-md">
                        LIVE AUCTION
                      </span>
                      <h3 className="font-bold text-sm text-slate-100 mt-1">{auc.title}</h3>
                      <p className="text-xs text-slate-400">By {auc.artist}</p>
                    </div>

                    <div className="flex justify-between items-end bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Current High Bid</span>
                        <span className="text-xl font-black text-amber-400">{formatPrice(auc.currentBid)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Total Bids</span>
                        <span className="text-xs font-bold text-slate-300">{auc.bidsCount} Bids</span>
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                        required
                      />
                      <button 
                        type="submit" 
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-full flex items-center justify-center text-slate-950 font-black text-2xl">
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
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> {currentUser.location} • Member since {currentUser.joinedDate}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> Phone Verification & Security Status
                </h3>
                
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{currentUser.phone}</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Mobile Number Authenticated with OTP
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    Manage Auth
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">About / Artist Bio</label>
                <textarea 
                  defaultValue={currentUser.bio} 
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                ></textarea>
              </div>

              <button 
                onClick={() => showNotification("Profile changes updated!")}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                Save Profile Updates
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: FUTURE ROADMAP EXTENSIONS ================= */}
        {activeTab === 'future' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Future Roadmap & Modules</h2>
              <p className="text-xs text-slate-400">Reserved space for upcoming hyper-local marketplace extensions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center font-bold">AR</div>
                <h3 className="font-bold text-sm text-slate-100">AR Room Visualizer</h3>
                <p className="text-xs text-slate-400">Buyers can preview selected art on their wall using augmented reality camera before purchasing.</p>
                <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Phase 2</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-bold">WS</div>
                <h3 className="font-bold text-sm text-slate-100">Local Art Workshops</h3>
                <p className="text-xs text-slate-400">Local artists host weekend pottery, painting, and sculpting masterclasses for neighborhood buyers.</p>
                <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Phase 3</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold">NFT</div>
                <h3 className="font-bold text-sm text-slate-100">Digital Authenticity Certificate</h3>
                <p className="text-xs text-slate-400">Verifiable blockchain certificates of physical artwork ownership and artist signature.</p>
                <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Phase 4</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: ADD ARTWORK (ARTIST STUDIO) */}
      {isAddArtOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-100">List New Artwork</h3>
            <form onSubmit={handleAddArtworkSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title *</label>
                <input required type="text" value={newArtForm.title} onChange={e => setNewArtForm({...newArtForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category *</label>
                  <select value={newArtForm.category} onChange={e => setNewArtForm({...newArtForm, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200">
                    <option>Oil Painting</option>
                    <option>Sculpture</option>
                    <option>Sketch</option>
                    <option>Digital Art</option>
                    <option>Ceramics</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Price (₹ INR) *</label>
                  <input required type="number" placeholder="e.g. 5000" value={newArtForm.price} onChange={e => setNewArtForm({...newArtForm, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Medium</label>
                  <input type="text" placeholder="e.g. Canvas & Oil" value={newArtForm.medium} onChange={e => setNewArtForm({...newArtForm, medium: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dimensions</label>
                  <input type="text" placeholder="e.g. 24x36 in" value={newArtForm.dimensions} onChange={e => setNewArtForm({...newArtForm, dimensions: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Image URL</label>
                <input type="url" placeholder="https://images.unsplash.com/..." value={newArtForm.imageUrl} onChange={e => setNewArtForm({...newArtForm, imageUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea rows="3" value={newArtForm.description} onChange={e => setNewArtForm({...newArtForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddArtOpen(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-amber-400 text-slate-950 py-2 rounded-xl text-xs font-bold">Post Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE CUSTOM DEMAND (BUYER) */}
      {isCreateRequestOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Post Custom Art Demand</h3>
            <form onSubmit={handleCreateRequestSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title / Requirement *</label>
                <input required type="text" placeholder="e.g. Portrait painting of family" value={newReqForm.title} onChange={e => setNewReqForm({...newReqForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min Budget (₹)</label>
                  <input required type="number" placeholder="2000" value={newReqForm.budgetMin} onChange={e => setNewReqForm({...newReqForm, budgetMin: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Budget (₹)</label>
                  <input required type="number" placeholder="10000" value={newReqForm.budgetMax} onChange={e => setNewReqForm({...newReqForm, budgetMax: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select value={newReqForm.category} onChange={e => setNewReqForm({...newReqForm, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200">
                    <option>Oil Painting</option>
                    <option>Sculpture</option>
                    <option>Sketch</option>
                    <option>Modern Art</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Deadline Date</label>
                  <input required type="date" value={newReqForm.deadline} onChange={e => setNewReqForm({...newReqForm, deadline: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Detailed Description</label>
                <textarea rows="3" placeholder="Describe style, colors, subject matter..." value={newReqForm.description} onChange={e => setNewReqForm({...newReqForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateRequestOpen(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-amber-400 text-slate-950 py-2 rounded-xl text-xs font-bold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ARTIST SUBMIT BID */}
      {activeBidModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Submit Proposal Quote</h3>
            <p className="text-xs text-slate-400">Bidding for: <span className="text-amber-400 font-semibold">{activeBidModalItem.title}</span></p>
            
            <form onSubmit={handleBidSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Price Quote (₹)</label>
                  <input required type="number" placeholder="e.g. 7500" value={bidForm.amount} onChange={e => setBidForm({...bidForm, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estimated Days</label>
                  <input required type="number" placeholder="e.g. 7" value={bidForm.daysEst} onChange={e => setBidForm({...bidForm, daysEst: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Proposal & Materials Detail</label>
                <textarea rows="3" placeholder="Explain how you will craft this piece..." value={bidForm.proposal} onChange={e => setBidForm({...bidForm, proposal: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setActiveBidModalItem(null)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-amber-400 text-slate-950 py-2 rounded-xl text-xs font-bold">Send Bid</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PRODUCT DETAIL VIEW */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100">{selectedProductDetail.title}</h3>
              <button onClick={() => setSelectedProductDetail(null)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <img src={selectedProductDetail.imageUrl} alt={selectedProductDetail.title} className="w-full h-64 object-cover rounded-xl" />

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Artist: <span className="text-slate-200 font-semibold">{selectedProductDetail.artist}</span></span>
              <span className="text-xl font-extrabold text-amber-400">{formatPrice(selectedProductDetail.price)}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedProductDetail.description}</p>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => {
                  setSelectedProductDetail(null);
                  showNotification(`Connection request sent to ${selectedProductDetail.artist}!`);
                }} 
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-2 rounded-xl text-xs font-bold"
              >
                Contact Artist via Phone OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PHONE OTP AUTH VERIFICATION */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Account Security & Auth
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-500 text-xs">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    value={loginPhone || currentUser.phone} 
                    onChange={e => setLoginPhone(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                  <button 
                    onClick={() => { setOtpSent(true); showNotification("Verification OTP sent to phone!"); }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Enter 4-Digit OTP Code</label>
                  <input 
                    type="text" 
                    placeholder="1 2 3 4" 
                    maxLength={4}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 tracking-widest text-center font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Account Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <button 
                onClick={() => {
                  setIsAuthModalOpen(false);
                  showNotification("Phone Number Verified & Security Updated!");
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-bold transition"
              >
                Verify & Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}