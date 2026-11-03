import React from 'react';
import { Search, Filter, X, ArrowUpDown, DollarSign, User } from 'lucide-react';

export default function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedArtist,
  setSelectedArtist,
  artistsList = [],
  categoriesList = [],
  priceRange,
  setPriceRange,
  maxAvailablePrice = 100000,
  sortBy,
  setSortBy,
  onResetFilters,
  totalResults = 0
}) {
  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedCategory !== 'All' || 
    selectedArtist !== 'All' || 
    priceRange < maxAvailablePrice ||
    sortBy !== 'default';

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Primary Row: Search & Artist Dropdown & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        {/* Keyword Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search title, medium, or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter by Artist */}
        <div className="sm:col-span-4 relative">
          <div className="absolute left-3.5 top-3 text-slate-500 pointer-events-none">
            <User className="w-3.5 h-3.5" />
          </div>
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-400 transition appearance-none cursor-pointer"
          >
            <option value="All">All Neighborhood Artists</option>
            {artistsList.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:col-span-3 relative">
          <div className="absolute left-3.5 top-3 text-slate-500 pointer-events-none">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-400 transition appearance-none cursor-pointer"
          >
            <option value="default">Sort: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="likes-desc">Most Appreciated</option>
          </select>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-amber-400" /> Categories:
        </span>
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Price Range Slider & Result Feedback */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Max Budget:
          </span>
          <input
            type="range"
            min="2000"
            max={maxAvailablePrice}
            step="1000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="accent-amber-400 flex-1 sm:w-48 cursor-pointer"
          />
          <span className="text-amber-400 font-bold tabular-nums">
            {formatPrice(priceRange)}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px] text-slate-500">
            Showing <strong className="text-slate-200">{totalResults}</strong> handcrafted piece(s)
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1 transition"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
