import React from 'react';
import { MapPin, Heart, Eye, Phone, Sparkles, Filter } from 'lucide-react';

export default function ArtGalleryGrid({
  artworks = [],
  likedArtworks = {},
  onToggleLike,
  onQuickView,
  onInquire,
  onResetFilters
}) {
  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  if (artworks.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xl">
        <div className="w-14 h-14 bg-amber-400/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-400/20">
          <Filter className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-100">No Handcrafted Pieces Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            No artworks match your active search keywords, artist selection, or price ceiling.
          </p>
        </div>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-amber-400/20"
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
        const isLiked = !!likedArtworks[art.id];
        return (
          <div
            key={art.id || art._id}
            className="group relative backdrop-blur-xl bg-slate-900/65 border border-white/10 hover:border-amber-400/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            {/* Ambient glass gradient glow behind the card on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              {/* IMAGE FRAME WITH HOVER ZOOM & GLASS BADGES */}
              <div 
                className="relative h-64 sm:h-72 overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => onQuickView && onQuickView(art)}
              >
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Vignette Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Top Left: Glassmorphic Location Tag */}
                <div className="absolute top-3.5 left-3.5 backdrop-blur-md bg-slate-950/70 border border-white/15 px-3 py-1 rounded-xl text-[11px] font-medium text-slate-200 flex items-center gap-1.5 shadow-lg">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[130px]">{art.location}</span>
                </div>

                {/* Top Right: Glassmorphic Like Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleLike) onToggleLike(art.id);
                  }}
                  className={`absolute top-3.5 right-3.5 backdrop-blur-md p-2.5 rounded-xl border transition-all duration-200 shadow-lg ${
                    isLiked
                      ? 'bg-rose-500/25 text-rose-400 border-rose-500/40 scale-105'
                      : 'bg-slate-950/70 text-slate-300 border-white/15 hover:text-white hover:bg-slate-900/90'
                  }`}
                  title={isLiked ? 'Unlike' : 'Appreciate artwork'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* Featured Badge if applicable */}
                {art.featured && (
                  <div className="absolute top-12 left-3.5 backdrop-blur-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Curated Pick
                  </div>
                )}

                {/* Hover Reveal Floating Quick View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <span className="backdrop-blur-md bg-slate-950/80 border border-amber-400/40 text-amber-400 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-4 h-4" /> Quick View
                  </span>
                </div>

                {/* Bottom Overlay Glass Bar */}
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-slate-200">
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
                      className="font-bold text-base text-slate-100 group-hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                    >
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-400">By {art.artist}</p>
                  </div>
                  <span className="text-lg font-black text-amber-400 tabular-nums shrink-0">
                    {formatPrice(art.price)}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {art.description}
                </p>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[170px]">{art.medium}</span>
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Heart className="w-3 h-3 text-rose-400/80" /> {art.likes || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD ACTION BUTTONS */}
            <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onQuickView && onQuickView(art)}
                className="w-full backdrop-blur-md bg-slate-800/70 hover:bg-slate-700/80 text-slate-200 py-2.5 rounded-xl text-xs font-semibold border border-white/10 hover:border-slate-600 transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" /> Details
              </button>
              <button
                type="button"
                onClick={() => onInquire && onInquire(art)}
                className="w-full backdrop-blur-md bg-amber-400/15 hover:bg-amber-400 text-amber-400 hover:text-slate-950 py-2.5 rounded-xl text-xs font-extrabold border border-amber-400/30 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" /> Inquire
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
