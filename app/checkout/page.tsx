"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Lock,
  Store,
  MapPin,
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Navigation,
  QrCode,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

/* ══════════════════════════════════════════════════════════════════
   TYPES & MOCK DATA
   ══════════════════════════════════════════════════════════════════ */

type PaymentMethod = "upi_gpay" | "upi_phonepe" | "upi_paytm" | "card" | "pay_at_shop";
type CheckoutState = "review" | "processing" | "success";

const ORDER_DETAILS = {
  shopName: "Sharma General Store",
  distance: "1.2 km away",
  items: [
    { id: 1, name: "Aashirvaad Atta 5kg", qty: 1, price: 210 },
  ],
  itemTotal: 210,
  platformFee: 5,
};

const WALLET_BALANCE = 50;

/* ══════════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════════ */

// Mock Logo Components for UPI apps
const GPayLogo = () => (
  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm p-1.5">
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 12.5L9.5 15.5L7 11.5L5.5 14L4 11L2 14.5L5 19.5L8.5 13.5L10 16L12.5 12L11.5 12.5Z" fill="#EA4335" />
      <path d="M12.5 12L15 16L18.5 10L16 6L12.5 12Z" fill="#FBBC04" />
      <path d="M16 6L18.5 10L22 4L19.5 2.5L16 6Z" fill="#34A853" />
      <path d="M12.5 12L10 16L8.5 13.5L11.5 8L15 16H18.5L12.5 12Z" fill="#4285F4" />
    </svg>
  </div>
);

const PhonePeLogo = () => (
  <div className="w-8 h-8 rounded-full bg-[#5F259F] flex items-center justify-center shadow-sm text-white font-black italic text-xs">
    पे
  </div>
);

const PaytmLogo = () => (
  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
    <span className="text-[#002970] font-black text-[10px] tracking-tighter">Paytm</span>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════════════════════════ */

function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </Link>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-sm font-bold text-gray-900">Secure Checkout</span>
        </div>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 1: ORDER SUMMARY
   ══════════════════════════════════════════════════════════════════ */

function OrderSummary() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in-up">
      {/* Shop Info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-gray-900 truncate">{ORDER_DETAILS.shopName}</h2>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-500">{ORDER_DETAILS.distance}</span>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-dashed border-gray-200 my-3" />

      {/* Items */}
      <div className="space-y-3">
        {ORDER_DETAILS.items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-600">
                {item.qty}x
              </div>
              <span className="text-sm font-semibold text-gray-800">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 flex-shrink-0">₹{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN CHECKOUT PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function CheckoutPage() {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("review");
  const [useWallet, setUseWallet] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi_gpay");

  // Calculations
  const grandTotal = ORDER_DETAILS.itemTotal + ORDER_DETAILS.platformFee;
  const walletDeduction = useWallet ? Math.min(WALLET_BALANCE, grandTotal) : 0;
  let finalAmount = grandTotal - walletDeduction;

  // Pay at Shop logic: If Pay at Shop is selected, they only pay the platform fee online
  const isPayAtShop = selectedMethod === "pay_at_shop";
  const onlineAmountToPay = isPayAtShop
    ? Math.max(0, ORDER_DETAILS.platformFee - walletDeduction) // Pay only platform fee online, minus wallet if used
    : finalAmount;

  const cashToPayAtShop = isPayAtShop
    ? grandTotal - ORDER_DETAILS.platformFee - (useWallet ? Math.max(0, walletDeduction - ORDER_DETAILS.platformFee) : 0)
    : 0;


  const [orderError, setOrderError] = useState<string | null>(null);

  const handlePayment = async () => {
    setCheckoutState("processing");
    setOrderError(null);

    try {
      // Insert order into Supabase
      const { data, error } = await supabase
        .from("orders")
        .insert([{
          shop_name: ORDER_DETAILS.shopName,
          item_name: ORDER_DETAILS.items[0].name,
          item_total: ORDER_DETAILS.itemTotal,
          platform_fee: ORDER_DETAILS.platformFee,
          wallet_applied: walletDeduction,
          amount_paid_online: onlineAmountToPay,
          amount_pay_at_shop: cashToPayAtShop,
          payment_method: selectedMethod,
          pickup_pin: "4892",
          status: "confirmed",
        }])
        .select()
        .single();

      if (error) {
        console.warn("Supabase order insert error (using demo mode):", error.message);
        // Fall back to demo mode — show success after delay
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setCheckoutState("success");
        return;
      }

      // Real success!
      setCheckoutState("success");
    } catch (err) {
      console.warn("Supabase unreachable, using demo mode");
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setCheckoutState("success");
    }
  };

  if (checkoutState === "success") {
    return (
      <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-6 animate-fade-in-up">
        {/* Confetti / Success Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
          {/* Decorative background circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-50 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-gentle-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              {isPayAtShop
                ? `₹${onlineAmountToPay} paid online. Pay ₹${cashToPayAtShop} at shop.`
                : `₹${onlineAmountToPay} paid securely.`}
            </p>

            {/* Secret PIN / QR Code Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Secret Pickup PIN</p>
              <div className="flex justify-center gap-3 mb-4">
                {["4", "8", "9", "2"].map((digit, i) => (
                  <div key={i} className="w-12 h-14 bg-white border-2 border-emerald-500 rounded-xl flex items-center justify-center text-3xl font-black text-gray-900 shadow-sm">
                    {digit}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-medium bg-white py-2 px-3 rounded-lg border border-gray-100 inline-flex">
                <QrCode className="w-4 h-4 text-gray-400" />
                <span>Show this PIN to shopkeeper</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors active:scale-95">
              <Navigation className="w-5 h-5" />
              Get GPS Directions
            </button>

            <Link href="/" className="block mt-4 text-sm font-bold text-emerald-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-32">
      {/* Phone-like container */}
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-xl">
        <CheckoutHeader />

        <main className="px-4 py-5 space-y-5">
          {/* 1. Order Summary */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">Order Summary</h3>
            <OrderSummary />
          </section>

          {/* Bill Details */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Bill Details</h3>
            
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between text-gray-600">
                <span>Item Total</span>
                <span className="text-gray-900">₹{ORDER_DETAILS.itemTotal}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  Platform Fee
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <span className="text-gray-900">₹{ORDER_DETAILS.platformFee}</span>
              </div>

              {useWallet && (
                <div className="flex justify-between text-emerald-600">
                  <span>Wallet Applied</span>
                  <span>-₹{walletDeduction}</span>
                </div>
              )}

              <div className="w-full border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Grand Total</span>
                <span className="font-extrabold text-lg text-gray-900">₹{finalAmount}</span>
              </div>
            </div>
          </section>

          {/* 2. Pehchan Wallet */}
          <section className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Pehchan Wallet</h3>
                  <p className="text-xs font-medium text-blue-600 mt-0.5">Balance: ₹{WALLET_BALANCE}</p>
                </div>
              </div>

              {/* iOS Style Toggle */}
              <button
                onClick={() => setUseWallet(!useWallet)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 ease-in-out flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${useWallet ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ease-in-out
                    ${useWallet ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </section>

          {/* 3. Payment Methods */}
          <section className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">Payment Options</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* UPI Options */}
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Preferred UPI</h4>
                <div className="space-y-4">
                  {[
                    { id: "upi_gpay", label: "Google Pay", icon: <GPayLogo /> },
                    { id: "upi_phonepe", label: "PhonePe", icon: <PhonePeLogo /> },
                    { id: "upi_paytm", label: "Paytm", icon: <PaytmLogo /> },
                  ].map((method) => (
                    <label key={method.id} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        {method.icon}
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{method.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${selectedMethod === method.id ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                        {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        className="sr-only" 
                        checked={selectedMethod === method.id}
                        onChange={() => setSelectedMethod(method.id as PaymentMethod)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Card Option */}
              <div className="p-4 border-b border-gray-100">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">Credit / Debit Card</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${selectedMethod === "card" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                    {selectedMethod === "card" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="sr-only" 
                    checked={selectedMethod === "card"}
                    onChange={() => setSelectedMethod("card")}
                  />
                </label>
              </div>

              {/* Pay at Shop (O2O Specific) */}
              <div className="p-4 bg-orange-50/30">
                <label className="flex items-start justify-between cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Banknote className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 block mb-0.5">Pay at Shop (Cash)</span>
                      <span className="text-xs font-medium text-gray-500 leading-tight block">
                        Pay ₹{Math.max(0, ORDER_DETAILS.platformFee - walletDeduction)} platform fee now, pay rest at the shop.
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors
                    ${selectedMethod === "pay_at_shop" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                    {selectedMethod === "pay_at_shop" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="sr-only" 
                    checked={selectedMethod === "pay_at_shop"}
                    onChange={() => setSelectedMethod("pay_at_shop")}
                  />
                </label>
              </div>

            </div>
          </section>
        </main>

        {/* 4. Sticky Bottom Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">To Pay</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-gray-900">₹{onlineAmountToPay}</span>
                {isPayAtShop && <span className="text-xs text-gray-500 font-medium line-through">₹{finalAmount}</span>}
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              Pay ₹{onlineAmountToPay}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Processing Overlay */}
        {checkoutState === "processing" && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Processing Payment...</h2>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure connection via {selectedMethod.replace("upi_", "").toUpperCase() || "Bank"}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
