import React from 'react';
import { MapPin, Heart, Eye, Phone, Sparkles, Filter, ShoppingCart, Zap, Check } from 'lucide-react';

export default function ArtGalleryGrid({
  artworks = [],
  likedArtworks = {},
  cartItems = [],
  onToggleLike,
  onQuickView,
  onInquire,
  onAddToCart,
  onBuyNow,
  onResetFilters,
  isArtist = false
}) {
  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  const getCartQty = (artId) => {
    const found = cartItems.find((item) => (item.id || item._id) === artId);
    return found ? found.quantity || 1 : 0;
  };

  const accentText = isArtist ? 'text-emerald-700' : 'text-amber-400';
  const primaryBtn = isArtist
    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20'
    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20';

  if (artworks.length === 0) {
    return (
      <div className={`backdrop-blur-xl ${isArtist ? 'bg-white border-stone-200 shadow-stone-900/5' : 'bg-slate-900/60 border-slate-800/80'} border rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xl`}>
        <div className={`w-14 h-14 ${isArtist ? 'bg-emerald-700/10 text-emerald-700 border-emerald-700/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'} rounded-2xl flex items-center justify-center mx-auto border`}>
          <Filter className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className={`text-lg font-bold ${isArtist ? 'text-stone-900' : 'text-slate-100'}`}>No Handcrafted Pieces Found</h3>
          <p className={`text-xs sm:text-sm ${isArtist ? 'text-stone-600' : 'text-slate-400'} max-w-sm mx-auto`}>
            No artworks match your active search keywords, artist selection, or price ceiling.
          </p>
        </div>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className={`${primaryBtn} px-5 py-2.5 rounded-xl text-xs font-extrabold transition`}
          >
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
      {artworks.map((art) => {
        const artId = art.id || art._id;
        const isLiked = !!likedArtworks[artId];
        const cartQty = getCartQty(artId);
        return (
          <div
            key={artId}
            className={`group relative backdrop-blur-xl ${
              isArtist
                ? 'bg-white border-stone-200 hover:border-emerald-700/50 shadow-stone-900/5 hover:shadow-emerald-900/10'
                : 'bg-slate-900/65 border-white/10 hover:border-amber-400/40 hover:shadow-amber-500/10'
            } border rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between`}
          >
            {/* Ambient glass gradient glow behind the card on hover */}
            <div className={`absolute -inset-0.5 bg-gradient-to-tr ${isArtist ? 'from-emerald-600/10' : 'from-amber-500/10'} to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            <div>
              {/* IMAGE FRAME WITH HOVER ZOOM & GLASS BADGES */}
              <div
                className="relative h-64 sm:h-72 overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => onQuickView && onQuickView(art)}
              >
                <img
                  src={art.imageUrl || '/art-fallback.svg'}
                  alt={art.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/art-fallback.svg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Vignette Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Top Left: Glassmorphic Location Tag */}
                <div className="absolute top-3.5 left-3.5 backdrop-blur-md bg-slate-950/75 border border-white/15 px-3 py-1 rounded-xl text-[11px] font-medium text-slate-100 flex items-center gap-1.5 shadow-lg">
                  <MapPin className={`w-3.5 h-3.5 ${isArtist ? 'text-emerald-400' : 'text-amber-400'} shrink-0`} />
                  <span className="truncate max-w-[130px]">{art.location}</span>
                </div>

                {/* Top Right: Glassmorphic Like Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleLike) onToggleLike(artId);
                  }}
                  className={`absolute top-3.5 right-3.5 backdrop-blur-md p-2.5 rounded-xl border transition-all duration-200 shadow-lg ${
                    isLiked
                      ? 'bg-rose-500/25 text-rose-400 border-rose-500/40 scale-105'
                      : 'bg-slate-950/75 text-slate-200 border-white/15 hover:text-white hover:bg-slate-900/90'
                  }`}
                  title={isLiked ? 'Unlike' : 'Appreciate artwork'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* Featured Badge if applicable */}
                {art.featured && (
                  <div className={`absolute top-12 left-3.5 backdrop-blur-md ${
                    isArtist
                      ? 'bg-emerald-600/85 border-emerald-300/50 text-white'
                      : 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                  } border text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-md`}>
                    <Sparkles className={`w-3 h-3 ${isArtist ? 'text-emerald-100' : 'text-amber-300'}`} /> Curated Pick
                  </div>
                )}

                {/* Hover Reveal Floating Quick View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <span className={`backdrop-blur-md bg-slate-950/85 border ${isArtist ? 'border-emerald-400/50 text-emerald-300' : 'border-amber-400/40 text-amber-400'} text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform`}>
                    <Eye className="w-4 h-4" /> Quick View
                  </span>
                </div>

                {/* Bottom Overlay Glass Bar */}
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-slate-100">
                  <span className="backdrop-blur-md bg-slate-950/80 border border-white/15 px-2.5 py-1 rounded-xl font-medium">
                    {art.category}
                  </span>
                  <span className="backdrop-blur-md bg-slate-950/80 border border-white/15 px-2.5 py-1 rounded-xl tabular-nums font-medium">
                    {art.dimensions}
                  </span>
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <h3
                      onClick={() => onQuickView && onQuickView(art)}
                      className={`font-bold text-base ${isArtist ? 'text-stone-900 group-hover:text-emerald-700' : 'text-slate-100 group-hover:text-amber-400'} transition-colors cursor-pointer leading-snug`}
                    >
                      {art.title}
                    </h3>
                    <p className={`text-xs ${isArtist ? 'text-stone-500' : 'text-slate-400'}`}>By {art.artist}</p>
                  </div>
                  <span className={`text-lg font-black ${accentText} tabular-nums shrink-0`}>
                    {formatPrice(art.price)}
                  </span>
                </div>

                <p className={`text-xs ${isArtist ? 'text-stone-600' : 'text-slate-400'} line-clamp-2 leading-relaxed`}>
                  {art.description}
                </p>

                <div className={`pt-2.5 border-t ${isArtist ? 'border-stone-200 text-stone-500' : 'border-slate-800/80 text-slate-500'} flex items-center justify-between text-[11px]`}>
                  <span className="truncate max-w-[170px]">{art.medium}</span>
                  <span className={`flex items-center gap-1.5 ${isArtist ? 'text-stone-600' : 'text-slate-400'} font-medium`}>
                    <Heart className="w-3 h-3 text-rose-500/80" /> {art.likes || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD ACTION BUTTONS: Inquiry, Details, Add to Cart, Buy Now */}
            <div className="p-5 pt-0 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onInquire && onInquire(art)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                    isArtist
                      ? 'bg-[#faf6f0] hover:bg-stone-100 text-stone-800 border-stone-300'
                      : 'backdrop-blur-md bg-slate-800/70 hover:bg-slate-700/80 text-slate-200 border-white/10 hover:border-slate-600'
                  }`}
                >
                  <Phone className={`w-3.5 h-3.5 ${accentText}`} /> Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => onQuickView && onQuickView(art)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                    isArtist
                      ? 'bg-[#faf6f0] hover:bg-stone-100 text-stone-800 border-stone-300'
                      : 'backdrop-blur-md bg-slate-800/70 hover:bg-slate-700/80 text-slate-200 border-white/10 hover:border-slate-600'
                  }`}
                >
                  <Eye className={`w-3.5 h-3.5 ${isArtist ? 'text-stone-500' : 'text-slate-400'}`} /> Details
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onAddToCart && onAddToCart(art)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    cartQty > 0
                      ? isArtist
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-teal-500/15 text-teal-300 border-teal-500/40 hover:bg-teal-500/25'
                      : isArtist
                        ? 'bg-white hover:bg-emerald-50 text-stone-800 border-stone-300 hover:border-emerald-700/50'
                        : 'bg-slate-950/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-400/40'
                  }`}
                >
                  {cartQty > 0 ? (
                    <>
                      <Check className={`w-3.5 h-3.5 ${isArtist ? 'text-emerald-700' : 'text-teal-400'}`} /> In Cart ({cartQty})
                    </>
                  ) : (
                    <>
                      <ShoppingCart className={`w-3.5 h-3.5 ${accentText}`} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onBuyNow && onBuyNow(art)}
                  className={`w-full ${primaryBtn} py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5`}
                >
                  <Zap className="w-3.5 h-3.5" /> Buy Now
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
