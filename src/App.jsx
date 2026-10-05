import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, MapPin, SlidersHorizontal, ShieldCheck, Heart, Sparkles, PlusCircle, 
  MessageSquare, Gavel, Tag, User, Lock, Phone, CheckCircle2, Clock, 
  ExternalLink, ChevronRight, Filter, AlertCircle, ShoppingBag, Eye, Send,
  Layers, Palette, Compass, ArrowRight, Zap, Image as ImageIcon, Award, X
} from 'lucide-react';

const INITIAL_ARTWORKS = [
  {
    id: 'art-1',
    title: 'Serenade of the Sunset Bay',
    artistName: 'Elena Rostova',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    location: 'Downtown Arts District (1.2 km)',
    category: 'Oil Painting',
    price: 450,
    dimensions: '24" x 36"',
    description: 'Textured canvas depicting the peaceful amber reflections along the city harbor during golden hour.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
    verified: true,
    likes: 34
  },
  {
    id: 'art-2',
    title: 'Minimalist Terracotta Vessel',
    artistName: 'Marcus Vance',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    location: 'Westside Craft Hub (3.5 km)',
    category: 'Pottery',
    price: 180,
    dimensions: '12" Height, 8" Diameter',
    description: 'Hand-thrown earthenware clay vase finished with natural organic glazes and textured matte finish.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=800',
    verified: true,
    likes: 52
  },
  {
    id: 'art-3',
    title: 'Cybernetic Echoes #04',
    artistName: 'Aria Chen',
    artistAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    location: 'Tech-Art Loft, North Suburb (4.8 km)',
    category: 'Digital Art',
    price: 310,
    dimensions: 'Digital Print + NFT Verified (A2 Size)',
    description: 'High-contrast futuristic urban landscape print on museum-grade metallic archival acrylic paper.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    verified: true,
    likes: 89
  },
  {
    id: 'art-4',
    title: 'Kinetic Bronze Solace',
    artistName: 'Devon Wright',
    artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    location: 'Old Town Foundry (2.1 km)',
    category: 'Sculpture',
    price: 950,
    dimensions: '18" x 14" x 10"',
    description: 'Hand-cast bronze figurine exploring balance and tension, set upon an oxidized basalt stone pedestal.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    verified: true,
    likes: 41
  }
];

const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    buyerName: 'Sophia Martinez',
    buyerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    location: 'Riverside Park (0.8 km)',
    title: 'Large Modern Abstract Mural for Living Room',
    category: 'Oil Painting',
    budgetMin: 600,
    budgetMax: 1000,
    deadline: '2026-11-15',
    description: 'Looking for a dynamic 48x60 canvas artwork featuring muted earth tones, warm brass, and deep navy accents to complement modern interior decor.',
    bids: [
      {
        id: 'bid-101',
        artistName: 'Elena Rostova',
        artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        amount: 850,
        timeline: '18 Days',
        proposal: 'I specialize in large layered oil textures. I can prepare a thumbnail color scheme composition before starting the canvas rendering.'
      }
    ]
  },
  {
    id: 'req-2',
    buyerName: 'David Kim',
    buyerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    location: 'Midtown Promenade (2.4 km)',
    title: 'Custom Handcrafted Oak & Epoxy Resin Coffee Table',
    category: 'Sculpture',
    budgetMin: 1200,
    budgetMax: 1800,
    deadline: '2026-12-01',
    description: 'Seeking a craftsman to create a live-edge walnut or oak tabletop infused with subtle smoky grey epoxy resin filler.',
    bids: []
  }
];

const INITIAL_AUCTIONS = [
  {
    id: 'auc-1',
    title: 'The Solitude of Winter Pines (Edition 1/1)',
    artistName: 'Elena Rostova',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    location: 'Downtown Arts District',
    startingPrice: 500,
    currentBid: 1250,
    highestBidder: 'Collector_99',
    totalBids: 14,
    endsInSeconds: 32000, // Dynamic timer countdown
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
    description: 'Exclusive masterwork oil painting showcased at the City Contemporary Art Fair. Authenticated certificate included.'
  },
  {
    id: 'auc-2',
    title: 'Ethereal Glass Sphere Prism #01',
    artistName: 'Marcus Vance',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    location: 'Westside Craft Hub',
    startingPrice: 300,
    currentBid: 680,
    highestBidder: 'ArtLover_SF',
    totalBids: 9,
    endsInSeconds: 18400,
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=800',
    description: 'Limited edition blown optical glass sculpture refracting spectrum reflections under sunlight.'
  }
];

export default function App() {
  // App Core States
  const [userRole, setUserRole] = useState('buyer'); // 'buyer' | 'artist'
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'commissions' | 'auctions' | 'profile' | 'future'
  
  // Data States
  const [artworks, setArtworks] = useState(INITIAL_ARTWORKS);
  const [commissionRequests, setCommissionRequests] = useState(INITIAL_REQUESTS);
  const [auctions, setAuctions] = useState(INITIAL_AUCTIONS);

  // Verification & Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userPhone, setUserPhone] = useState('+1 (555) 234-5678');
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Marketplace Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState(1500);

  // Modals States
  const [isAddArtModalOpen, setIsAddArtModalOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [biddingAuctionId, setBiddingAuctionId] = useState(null);
  const [auctionBidAmount, setAuctionBidAmount] = useState('');
  const [activeCommissionBidding, setActiveCommissionBidding] = useState(null);

  // Form States
  const [newArtwork, setNewArtwork] = useState({
    title: '', category: 'Oil Painting', price: '', dimensions: '', description: '', image: ''
  });

  const [newRequest, setNewRequest] = useState({
    title: '', category: 'Oil Painting', budgetMin: '', budgetMax: '', deadline: '', description: ''
  });

  const [newCommissionBid, setNewCommissionBid] = useState({
    amount: '', timeline: '', proposal: ''
  });

  // Notification Banner
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions(prev =>
        prev.map(auc => ({
          ...auc,
          endsInSeconds: auc.endsInSeconds > 0 ? auc.endsInSeconds - 1 : 0
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    if (seconds <= 0) return 'Ended';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const filteredArtworks = useMemo(() => {
    return artworks.filter(art => {
      const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            art.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            art.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
      const matchesPrice = art.price <= maxPriceFilter;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [artworks, searchQuery, selectedCategory, maxPriceFilter]);

  // Handle Add New Artwork (Artist Mode)
  const handleCreateArtwork = (e) => {
    e.preventDefault();
    if (!newArtwork.title || !newArtwork.price) return;
    
    const artItem = {
      id: `art-${Date.now()}`,
      title: newArtwork.title,
      artistName: 'You (Elena Rostova)',
      artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'Downtown Arts District (0.5 km)',
      category: newArtwork.category,
      price: parseFloat(newArtwork.price),
      dimensions: newArtwork.dimensions || 'Custom Size',
      description: newArtwork.description || 'Handcrafted unique original piece.',
      image: newArtwork.image || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
      verified: true,
      likes: 1
    };

    setArtworks([artItem, ...artworks]);
    setIsAddArtModalOpen(false);
    setNewArtwork({ title: '', category: 'Oil Painting', price: '', dimensions: '', description: '', image: '' });
    showNotification('Artwork listed successfully on local marketplace!');
  };

  // Handle Post Commission Request (Buyer Mode)
  const handleCreateCommissionRequest = (e) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.budgetMax) return;

    const reqItem = {
      id: `req-${Date.now()}`,
      buyerName: 'You (Current Buyer)',
      buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      location: 'Local Neighborhood (1.0 km)',
      title: newRequest.title,
      category: newRequest.category,
      budgetMin: parseFloat(newRequest.budgetMin || 0),
      budgetMax: parseFloat(newRequest.budgetMax),
      deadline: newRequest.deadline || 'Flexible',
      description: newRequest.description,
      bids: []
    };

    setCommissionRequests([reqItem, ...commissionRequests]);
    setIsCommissionModalOpen(false);
    setNewRequest({ title: '', category: 'Oil Painting', budgetMin: '', budgetMax: '', deadline: '', description: '' });
    showNotification('Custom Art request posted to local verified artists!');
  };

  // Handle Artist Bidding on Buyer Request
  const handleSubmitCommissionBid = (e) => {
    e.preventDefault();
    if (!newCommissionBid.amount || !activeCommissionBidding) return;

    const bidData = {
      id: `bid-${Date.now()}`,
      artistName: 'You (Elena Rostova)',
      artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      amount: parseFloat(newCommissionBid.amount),
      timeline: newCommissionBid.timeline || '2 Weeks',
      proposal: newCommissionBid.proposal
    };

    setCommissionRequests(prev =>
      prev.map(req => {
        if (req.id === activeCommissionBidding.id) {
          return { ...req, bids: [...req.bids, bidData] };
        }
        return req;
      })
    );

    setActiveCommissionBidding(null);
    setNewCommissionBid({ amount: '', timeline: '', proposal: '' });
    showNotification('Your custom bid & proposal has been sent to the buyer!');
  };

  // Handle Auction Bidding
  const handlePlaceAuctionBid = (aucId) => {
    const numericBid = parseFloat(auctionBidAmount);
    const targetAuction = auctions.find(a => a.id === aucId);

    if (!numericBid || numericBid <= targetAuction.currentBid) {
      alert(`Bid must be higher than current price ($${targetAuction.currentBid})`);
      return;
    }

    setAuctions(prev =>
      prev.map(auc => {
        if (auc.id === aucId) {
          return {
            ...auc,
            currentBid: numericBid,
            highestBidder: userRole === 'artist' ? 'Elena_Artist' : 'You (Local Buyer)',
            totalBids: auc.totalBids + 1
          };
        }
        return auc;
      })
    );

    setBiddingAuctionId(null);
    setAuctionBidAmount('');
    showNotification(`Bid placed successfully for $${numericBid}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Dynamic Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-xl shadow-2xl font-medium flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Palette className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 bg-clip-text text-transparent">
                ArtisanHub
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400/80 font-medium">
                <MapPin className="w-3 h-3" />
                <span>Downtown Arts Radius (5 km)</span>
              </div>
            </div>
          </div>

          {/* Persona Switcher Toggle Pill */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setUserRole('buyer')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                userRole === 'buyer'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyer View</span>
            </button>
            <button
              onClick={() => setUserRole('artist')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                userRole === 'artist'
                  ? 'bg-rose-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Artist View</span>
            </button>
          </div>

          {/* User Status / Verification Pill */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 transition"
            >
              <ShieldCheck className={`w-4 h-4 ${isPhoneVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{isPhoneVerified ? 'Phone Verified' : 'Verify Phone'}</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
              {userRole === 'artist' ? 'ER' : 'UB'}
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
          <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto py-3 scrollbar-none">
            {[
              { id: 'marketplace', label: 'Marketplace & Search', icon: Compass },
              { id: 'commissions', label: 'Art Commission Desk', icon: MessageSquare, badge: commissionRequests.length },
              { id: 'auctions', label: 'Limited Edition Auctions', icon: Gavel, badge: auctions.length },
              { id: 'profile', label: 'Security & Phone Auth', icon: Lock },
              { id: 'future', label: 'Hub Extensions', icon: Layers, isNew: true },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-1 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1 bg-slate-800 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                      {tab.badge}
                    </span>
                  )}
                  {tab.isNew && (
                    <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                      Next
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Persona Banner Context Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${userRole === 'artist' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {userRole === 'artist' ? <Palette className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Logged in as <span className="text-amber-400">{userRole === 'artist' ? 'Elena Rostova (Local Artist)' : 'Verified Local Buyer'}</span>
              </p>
              <p className="text-xs text-slate-400">
                {userRole === 'artist' 
                  ? 'Manage listings, bid on custom buyer requests, and list special limited editions.' 
                  : 'Browse nearby hyper-local art, place custom commission requests, and join live bids.'}
              </p>
            </div>
          </div>

          {userRole === 'artist' && (
            <button
              onClick={() => setIsAddArtModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Artwork</span>
            </button>
          )}

          {userRole === 'buyer' && activeTab === 'commissions' && (
            <button
              onClick={() => setIsCommissionModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Custom Request</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FEATURE TAB 1: MARKETPLACE & SEARCH ENGINE                               */}
        {/* ========================================================================= */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            
            {/* Hyper-Local Search & Filter Controls */}
            <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search local artists, artwork titles, mediums (e.g. Oil, Clay, Modern)..."
                    className="w-full bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-200 placeholder-slate-500"
                  />
                </div>

                {/* Maximum Price Range Slider */}
                <div className="w-full md:w-64 bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Max Price</span>
                    <span className="text-amber-400 font-bold">${maxPriceFilter}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="accent-amber-500 cursor-pointer w-full"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-2">
                  <Filter className="w-3.5 h-3.5" /> Mediums:
                </span>
                {['All', 'Oil Painting', 'Pottery', 'Digital Art', 'Sculpture'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Artwork Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtworks.map(art => (
                <div
                  key={art.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5"
                >
                  {/* Artwork Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{art.category}</span>
                    </div>
                    <button className="absolute top-3 right-3 p-2 bg-slate-950/80 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-400 transition">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Artwork Meta Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-100 group-hover:text-amber-400 transition line-clamp-1">
                          {art.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {art.description}
                      </p>

                      {/* Artist Detail Card */}
                      <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800/60">
                        <img
                          src={art.artistAvatar}
                          alt={art.artistName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div className="text-xs overflow-hidden">
                          <p className="text-slate-300 font-medium flex items-center gap-1">
                            {art.artistName}
                            {art.verified && <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />}
                          </p>
                          <p className="text-slate-500 truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{art.location}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Price</span>
                        <span className="text-lg font-extrabold text-amber-400">${art.price}</span>
                      </div>
                      <button 
                        onClick={() => showNotification(`Inquiry sent to ${art.artistName} for ${art.title}`)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inquire</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No artwork matching your search criteria.</p>
                <p className="text-xs text-slate-500 mt-1">Try expanding your max price filter or changing search tags.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE TAB 2: CUSTOM ART COMMISSIONS & BIDDING DESK                      */}
        {/* ========================================================================= */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="max-w-2xl">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Custom Art Commission Desk
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Buyers present custom art desires and budget limits. Local artists review details and bid competitive price quotes and completion schedules.
                </p>
              </div>
            </div>

            {/* List of Custom Commission Requests */}
            <div className="space-y-4">
              {commissionRequests.map(req => (
                <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  
                  {/* Buyer Request Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={req.buyerAvatar}
                        alt={req.buyerName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h3 className="font-bold text-slate-100 text-base">{req.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>Posted by <strong className="text-slate-200">{req.buyerName}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {req.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 self-start md:self-auto">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Target Budget</span>
                        <span className="text-sm font-bold text-amber-400">${req.budgetMin} - ${req.budgetMax}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Deadline</span>
                        <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {req.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Bids Section Header */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-rose-400" />
                        Artist Bids ({req.bids.length})
                      </h4>

                      {userRole === 'artist' && (
                        <button
                          onClick={() => setActiveCommissionBidding(req)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Bid Proposal</span>
                        </button>
                      )}
                    </div>

                    {/* Bids List */}
                    {req.bids.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {req.bids.map(bid => (
                          <div key={bid.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img src={bid.artistAvatar} className="w-6 h-6 rounded-full" />
                                <span className="text-xs font-semibold text-slate-200">{bid.artistName}</span>
                              </div>
                              <span className="text-sm font-extrabold text-amber-400">${bid.amount}</span>
                            </div>
                            <p className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                              "{bid.proposal}"
                            </p>
                            <span className="text-[10px] text-slate-500 block">Est. Timeline: {bid.timeline}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-950 rounded-xl border border-slate-800/60 text-xs text-slate-500">
                        No proposals submitted yet. Artists can review and submit bids above.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE TAB 3: LIMITED EDITION LIVE AUCTIONS                              */}
        {/* ========================================================================= */}
        {activeTab === 'auctions' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-400" />
                  Limited Edition Live Auctions
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Place dynamic competitive bids on rare, one-of-a-kind art pieces authenticated directly by local masters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {auctions.map(auc => (
                <div key={auc.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/2 relative bg-slate-950">
                    <img src={auc.image} alt={auc.title} className="w-full h-full object-cover min-h-[220px]" />
                    <div className="absolute top-3 left-3 bg-rose-500/90 backdrop-blur-md text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatCountdown(auc.endsInSeconds)}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 md:w-1/2 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{auc.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{auc.description}</p>

                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-300">
                        <img src={auc.artistAvatar} className="w-5 h-5 rounded-full" />
                        <span>{auc.artistName}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Current Highest Bid</span>
                        <span className="text-xs text-slate-400">{auc.totalBids} bids</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-amber-400">${auc.currentBid}</span>
                        <span className="text-[11px] text-slate-400">By {auc.highestBidder}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {biddingAuctionId === auc.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="number"
                            placeholder={`> $${auc.currentBid}`}
                            value={auctionBidAmount}
                            onChange={(e) => setAuctionBidAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-amber-500/60 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                          />
                          <button
                            onClick={() => handlePlaceAuctionBid(auc.id)}
                            className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl hover:bg-amber-400"
                          >
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setBiddingAuctionId(auc.id);
                            setAuctionBidAmount(auc.currentBid + 50);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
                        >
                          Place Higher Bid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE TAB 4: SECURITY & PHONE AUTH VERIFICATION                         */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Security & Authentication Settings</h2>
                  <p className="text-xs text-slate-400">Manage phone-verified login credentials and marketplace security status.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                {/* Phone Verification Box */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-500 block">Phone Number Status</span>
                      <span className="text-sm font-semibold text-slate-200">{userPhone}</span>
                    </div>
                  </div>
                  {isPhoneVerified ? (
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400"
                    >
                      Verify OTP
                    </button>
                  )}
                </div>

                {/* Password Protection Placeholder */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-500 block">Password Protection</span>
                      <span className="text-sm font-semibold text-slate-200">••••••••••••••</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => showNotification('Password update link dispatched to registered phone.')}
                    className="text-xs text-amber-400 hover:underline font-medium"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE TAB 5: FUTURE EXPANSION SLOTS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'future' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-400" />
                Modular Architecture: Future Feature Additions
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ArtisanHub is architected for extensible scaling. Below are planned modular extensions integrated directly into the layout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Augmented Reality (AR) Preview',
                  icon: Eye,
                  status: 'In Development',
                  desc: 'Project artwork virtually onto buyer studio walls using mobile device camera previews.'
                },
                {
                  title: 'Local Artisan Workshops',
                  icon: Award,
                  status: 'Planned Slot',
                  desc: 'Host weekend physical craft sessions, pottery tutorials, and painting meetups locally.'
                },
                {
                  title: 'Artisan Community Forum',
                  icon: MessageSquare,
                  status: 'Planned Slot',
                  desc: 'Peer-to-peer artist supply exchanges, critique circles, and local exhibition discussions.'
                }
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-200 text-base">{feat.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
                        {feat.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Phone OTP Verification</h3>
              <p className="text-xs text-slate-400">Verify your mobile contact to access bids and sales.</p>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => setOtpSent(true)}
                  className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition"
                >
                  Send Verification OTP Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Enter 4-Digit Security OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-center tracking-widest text-lg text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsPhoneVerified(true);
                    setIsAuthModalOpen(false);
                    setOtpSent(false);
                    setOtpCode('');
                    showNotification('Phone number successfully verified!');
                  }}
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 transition"
                >
                  Verify & Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {isAddArtModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddArtModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" /> List Artwork for Local Marketplace
            </h3>

            <form onSubmit={handleCreateArtwork} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Artwork Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Whispering Forest Stream"
                  value={newArtwork.title}
                  onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category Medium</label>
                  <select
                    value={newArtwork.category}
                    onChange={(e) => setNewArtwork({ ...newArtwork, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Oil Painting">Oil Painting</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Digital Art">Digital Art</option>
                    <option value="Sculpture">Sculpture</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Price ($ USD) *</label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={newArtwork.price}
                    onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Dimensions / Size Spec</label>
                <input
                  type="text"
                  placeholder='e.g., 20" x 30" Canvas'
                  value={newArtwork.dimensions}
                  onChange={(e) => setNewArtwork({ ...newArtwork, dimensions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Image URL (Optional Sample)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newArtwork.image}
                  onChange={(e) => setNewArtwork({ ...newArtwork, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your art creation process, materials used..."
                  value={newArtwork.description}
                  onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition mt-2"
              >
                Publish Artwork Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative">
            <button onClick={() => setIsCommissionModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" /> Post Custom Art Commission Request
            </h3>

            <form onSubmit={handleCreateCommissionRequest} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Custom Portrait Painting for Wedding Gift"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preferred Budget Range ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="Max budget (e.g. 500)"
                    value={newRequest.budgetMax}
                    onChange={(e) => setNewRequest({ ...newRequest, budgetMax: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Needed Deadline</label>
                  <input
                    type="date"
                    value={newRequest.deadline}
                    onChange={(e) => setNewRequest({ ...newRequest, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Art Description & Specifications</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide color choices, sizes, or references..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
              >
                Publish Request to Artists
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      {activeCommissionBidding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative">
            <button onClick={() => setActiveCommissionBidding(null)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" /> Submit Bid for: {activeCommissionBidding.title}
            </h3>

            <form onSubmit={handleSubmitCommissionBid} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Price Quote ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="750"
                    value={newCommissionBid.amount}
                    onChange={(e) => setNewCommissionBid({ ...newCommissionBid, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Completion Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g., 2 Weeks"
                    value={newCommissionBid.timeline}
                    onChange={(e) => setNewCommissionBid({ ...newCommissionBid, timeline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Proposal & Sample Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain your plan, materials, and why you are fit for this artwork..."
                  value={newCommissionBid.proposal}
                  onChange={(e) => setNewCommissionBid({ ...newCommissionBid, proposal: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-rose-400 transition"
              >
                Send Proposal & Bid
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">ArtisanHub Local Marketplace</span>
            <span>• Hyper-Local Artist & Buyer Network</span>
          </div>
          <p>© 2026 ArtisanHub Inc. All phone numbers OTP encrypted.</p>
        </div>
      </footer>

    </div>
  );
}