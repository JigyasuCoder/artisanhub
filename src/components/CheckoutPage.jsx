import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  MapPin,
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  CheckCircle2,
  Lock,
  Sparkles,
  Trash2,
  Plus,
  Minus,
  QrCode,
  RefreshCw,
  Truck
} from 'lucide-react';

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', handle: '@okicici' },
  { id: 'phonepe', label: 'PhonePe', handle: '@ybl' },
  { id: 'paytm', label: 'Paytm', handle: '@paytm' },
  { id: 'bhim', label: 'BHIM UPI', handle: '@upi' }
];

export default function CheckoutPage({
  items = [],
  currentUser,
  isCartCheckout = false,
  onUpdateQty,
  onRemoveItem,
  onBack,
  onPaymentSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiMode, setUpiMode] = useState('id'); // 'id' | 'qr'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState(
    `${(currentUser?.name || 'collector').toLowerCase().replace(/[^a-z0-9]/g, '')}@okicici`
  );
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8841');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('412');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [deliveryMode, setDeliveryMode] = useState('courier'); // 'courier' | 'pickup'
  const [shippingAddress, setShippingAddress] = useState(
    currentUser?.location || 'Koramangala 4th Block, Bengaluru'
  );
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [orderNote, setOrderNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const deliveryFee = 0; // Complimentary insured local art delivery
  const totalAmount = subtotal + deliveryFee;

  const handleSelectUpiApp = (app) => {
    setSelectedUpiApp(app.id);
    const prefix = upiId.split('@')[0] || 'collector';
    setUpiId(`${prefix}${app.handle}`);
  };

  const handleCompletePayment = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your order has no artworks selected.');
      return;
    }

    if (paymentMethod === 'upi' && upiMode === 'id') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID (for example: name@okicici).');
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      const orderId = `AH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const utrNumber = `UTR${Math.floor(100000000000 + Math.random() * 899999999999)}`;
      const appObj = UPI_APPS.find((a) => a.id === selectedUpiApp) || UPI_APPS[0];

      const receipt = {
        orderId,
        utrNumber,
        paymentMethod,
        paymentMethodLabel:
          paymentMethod === 'upi'
            ? `UPI (${appObj.label})`
            : paymentMethod === 'card'
              ? 'Credit / Debit Card'
              : paymentMethod === 'netbanking'
                ? `Net Banking (${selectedBank})`
                : 'Cash on Studio Pickup',
        upiId: paymentMethod === 'upi' ? (upiMode === 'qr' ? 'artisanhub.merchant@okaxis' : upiId.trim()) : null,
        upiApp: paymentMethod === 'upi' ? appObj.label : null,
        items: items.map((item) => ({
          id: item.id || item._id,
          title: item.title,
          artist: item.artist,
          category: item.category,
          medium: item.medium,
          dimensions: item.dimensions,
          location: item.location,
          imageUrl: item.imageUrl,
          price: Number(item.price),
          quantity: Number(item.quantity || 1)
        })),
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryMode,
        shippingAddress: deliveryMode === 'pickup' ? 'Direct Artist Studio Pickup' : shippingAddress,
        buyerName: currentUser?.name || 'Art Patron',
        buyerPhone,
        orderNote,
        isCartCheckout,
        paidAt: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      };

      setIsProcessing(false);
      onPaymentSuccess(receipt);
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Breadcrumb & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Art Gallery
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Order Summary & Payment Method
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your handcrafted artwork selection and choose a payment option to complete your order
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-emerald-400 font-semibold self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted Checkout
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <p className="text-sm text-slate-400">No artworks in your checkout summary yet.</p>
          <button
            type="button"
            onClick={onBack}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-extrabold transition"
          >
            Browse Art Gallery
          </button>
        </div>
      ) : (
        <form onSubmit={handleCompletePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* LEFT COLUMN: ORDER SUMMARY & DELIVERY DETAILS */}
          <div className="lg:col-span-7 space-y-6">
            {/* Artwork Items Summary */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Order Summary ({items.reduce((acc, i) => acc + (i.quantity || 1), 0)} Item
                  {items.reduce((acc, i) => acc + (i.quantity || 1), 0) > 1 ? 's' : ''})
                </h2>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Certificate of Authenticity Included
                </span>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const itemId = item.id || item._id;
                  const qty = item.quantity || 1;
                  return (
                    <div
                      key={itemId}
                      className="flex flex-col sm:flex-row gap-4 bg-slate-950/90 border border-slate-800/80 p-3.5 rounded-2xl"
                    >
                      <img
                        src={item.imageUrl || '/art-fallback.svg'}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/art-fallback.svg';
                        }}
                        className="w-full sm:w-24 h-36 sm:h-24 object-cover rounded-xl bg-slate-900 shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              {item.category}
                            </span>
                            <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                            <p className="text-xs text-slate-400">
                              By <span className="text-slate-200 font-medium">{item.artist}</span> ·{' '}
                              {item.medium} ({item.dimensions})
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-base font-black text-amber-400 tabular-nums">
                              {formatPrice(item.price * qty)}
                            </div>
                            {qty > 1 && (
                              <div className="text-[10px] text-slate-500 tabular-nums">
                                {formatPrice(item.price)} each
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/70">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" /> {item.location}
                          </span>

                          <div className="flex items-center gap-2">
                            {onUpdateQty && (
                              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQty(itemId, Math.max(1, qty - 1))}
                                  className="p-1.5 text-slate-400 hover:text-white transition"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2.5 text-xs font-bold text-slate-200 tabular-nums">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQty(itemId, qty + 1)}
                                  className="p-1.5 text-slate-400 hover:text-white transition"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {isCartCheckout && onRemoveItem && (
                              <button
                                type="button"
                                onClick={() => onRemoveItem(itemId)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                                title="Remove artwork"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery / Pickup Details */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" /> Fulfillment & Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('courier')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    deliveryMode === 'courier'
                      ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">Insured Local Courier</span>
                    <span className="text-[10px] font-bold text-emerald-400">FREE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    White-glove wooden crate delivery within 2–4 days
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode('pickup')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    deliveryMode === 'pickup'
                      ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">Direct Studio Pickup</span>
                    <span className="text-[10px] font-bold text-amber-400">SAME DAY</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Meet the neighborhood artist & inspect artwork in person
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    {deliveryMode === 'pickup' ? 'Collector Neighborhood' : 'Delivery Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">
                  Framing / Packaging Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please include wall hanging hooks or gift wrapping..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PAYMENT METHOD & PAY CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> Select Payment Method
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Demo Gateway
                </span>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* Payment Method Options */}
              <div className="space-y-3">
                {/* OPTION 1: UPI */}
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-100">UPI Instant Pay</span>
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Google Pay, PhonePe, Paytm, BHIM UPI
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'upi' ? 'border-amber-400' : 'border-slate-600'
                      }`}
                    >
                      {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                    </div>
                  </button>

                  {paymentMethod === 'upi' && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-400/20 space-y-3.5">
                      {/* Quick App Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => handleSelectUpiApp(app)}
                            className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition ${
                              selectedUpiApp === app.id
                                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {app.label}
                          </button>
                        ))}
                      </div>

                      {/* UPI ID vs Scan QR Toggle */}
                      <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setUpiMode('id')}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                            upiMode === 'id'
                              ? 'bg-slate-800 text-amber-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Enter UPI ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiMode('qr')}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                            upiMode === 'qr'
                              ? 'bg-slate-800 text-amber-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" /> Scan UPI QR
                        </button>
                      </div>

                      {upiMode === 'id' ? (
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-slate-300 font-semibold block">
                            Your UPI ID / VPA
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@okicici"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                          />
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Instant zero-fee settlement to artist
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-20 h-20 bg-white rounded-xl p-2 flex items-center justify-center shrink-0">
                            <QrCode className="w-16 h-16 text-slate-950" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-slate-100">
                              Scan with any UPI App
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Pay <span className="text-amber-400 font-bold">{formatPrice(totalAmount)}</span>{' '}
                              to <span className="font-mono text-slate-300">artisanhub@okaxis</span>
                            </p>
                            <p className="text-[10px] text-emerald-400">
                              Click the button below once scanned to confirm.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* OPTION 2: CREDIT / DEBIT CARD */}
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    paymentMethod === 'card'
                      ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-100">Credit / Debit Card</div>
                        <p className="text-[11px] text-slate-400">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-amber-400' : 'border-slate-600'
                      }`}
                    >
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                    </div>
                  </button>

                  {paymentMethod === 'card' && (
                    <div className="px-4 pb-4 pt-2 border-t border-amber-400/20 space-y-2.5">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Card Number"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* OPTION 3: NET BANKING */}
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-100">Net Banking</div>
                        <p className="text-[11px] text-slate-400">HDFC, ICICI, SBI, Axis & more</p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'netbanking' ? 'border-amber-400' : 'border-slate-600'
                      }`}
                    >
                      {paymentMethod === 'netbanking' && (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                  </button>

                  {paymentMethod === 'netbanking' && (
                    <div className="px-4 pb-4 pt-2 border-t border-amber-400/20">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* OPTION 4: CASH ON STUDIO PICKUP */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between text-left transition ${
                    paymentMethod === 'cod'
                      ? 'bg-amber-400/10 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">Pay on Delivery / Pickup</div>
                      <p className="text-[11px] text-slate-400">Cash or QR upon artwork handover</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-amber-400' : 'border-slate-600'
                    }`}
                  >
                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Artwork Subtotal</span>
                  <span className="text-slate-200 font-semibold tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Marketplace Commission</span>
                  <span className="text-emerald-400 font-semibold">₹0 (Zero Commission)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Insured Packaging & Delivery</span>
                  <span className="text-emerald-400 font-semibold">Complimentary</span>
                </div>
                <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-100">Total Payable</span>
                  <span className="text-xl font-black text-amber-400 tabular-nums">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {paymentMethod === 'upi' ? 'Verifying UPI Payment...' : 'Confirming Order...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {paymentMethod === 'upi'
                      ? `Pay ${formatPrice(totalAmount)} via UPI`
                      : paymentMethod === 'cod'
                        ? `Confirm Order (${formatPrice(totalAmount)})`
                        : `Pay ${formatPrice(totalAmount)} Now`}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
