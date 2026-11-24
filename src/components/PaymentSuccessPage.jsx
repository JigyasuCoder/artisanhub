import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  MapPin,
  Smartphone,
  Shield,
  ArrowLeft,
  User,
  Calendar,
  Copy,
  Check
} from 'lucide-react';

export default function PaymentSuccessPage({ receipt, onBackToGallery, onViewProfile }) {
  const [copiedUtr, setCopiedUtr] = React.useState(false);

  if (!receipt) {
    return (
      <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
        <p className="text-sm text-slate-400">No payment receipt found.</p>
        <button
          type="button"
          onClick={onBackToGallery}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition"
        >
          Back to Art Gallery
        </button>
      </div>
    );
  }

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;
  const isUpi = receipt.paymentMethod === 'upi';

  const handleCopyUtr = () => {
    if (!receipt.utrNumber) return;
    navigator.clipboard?.writeText(receipt.utrNumber);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="relative overflow-hidden bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Ambient Emerald & Amber Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Hero Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            {isUpi ? 'UPI Payment Verified & Confirmed' : 'Order Confirmed'}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Thank you, <span className="text-slate-200 font-semibold">{receipt.buyerName}</span>. Your{' '}
            {isUpi ? `${receipt.upiApp || 'UPI'} payment` : receipt.paymentMethodLabel} has been received
            and the neighborhood artist has been notified.
          </p>
        </div>

        {/* Transaction Receipt Details */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Order Reference
              </span>
              <span className="text-sm font-black text-slate-100 font-mono">{receipt.orderId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Amount Paid
              </span>
              <span className="text-xl font-black text-amber-400 tabular-nums">
                {formatPrice(receipt.totalAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-400" /> Payment Method
              </span>
              <div className="text-slate-200 font-semibold">{receipt.paymentMethodLabel}</div>
              {receipt.upiId && (
                <div className="text-[11px] text-slate-400 font-mono">VPA: {receipt.upiId}</div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> {isUpi ? 'UPI Transaction / UTR ID' : 'Transaction ID'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-mono font-semibold">{receipt.utrNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyUtr}
                  className="text-slate-400 hover:text-amber-400 transition"
                  title="Copy Transaction ID"
                >
                  {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" /> Timestamp
              </span>
              <div className="text-slate-200 font-medium">{receipt.paidAt}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> Fulfillment
              </span>
              <div className="text-slate-200 font-medium">{receipt.shippingAddress}</div>
            </div>
          </div>
        </div>

        {/* Purchased Artworks List */}
        <div className="space-y-3 relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Acquired Artwork{receipt.items.length > 1 ? 's' : ''}
          </h2>
          <div className="space-y-3">
            {receipt.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/80 p-3 rounded-2xl"
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
                  <h3 className="text-sm font-bold text-slate-100 truncate">{item.title}</h3>
                  <p className="text-xs text-slate-400">
                    By {item.artist} · Qty {item.quantity}
                  </p>
                </div>
                <div className="text-sm font-black text-amber-400 tabular-nums shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={onBackToGallery}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Exploring Gallery
          </button>
          <button
            type="button"
            onClick={onViewProfile}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-2xl text-xs sm:text-sm font-bold border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-amber-400" /> View Order in Profile
          </button>
        </div>
      </div>
    </div>
  );
}
