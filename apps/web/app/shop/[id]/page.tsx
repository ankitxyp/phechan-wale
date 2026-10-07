"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  BadgeCheck,
  Star,
  Pencil,
  ShoppingBag,
  ChevronLeft,
  Share2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/link"; // Not using next/image to avoid config issues with external URLs, we'll just use standard img tags.

/* ══════════════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════════════ */

const MOCK_SHOP = {
  id: "s101",
  name: "Sharma General Store",
  verified: true,
  rating: 4.8,
  reviews: 342,
  address: "Boring Road, Patna",
  openTime: "08:00 AM - 10:00 PM",
  coverImage:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
  profileImage:
    "https://images.unsplash.com/photo-1534723452862-4c876431d683?auto=format&fit=crop&q=80&w=200",
  specialOffer: "🎉 Today's Special: 10% Off on all Spices!",
  categories: [
    {
      name: "Daily Needs",
      items: [
        {
          id: 1,
          name: "Fresh Red Onions",
          price: 40,
          unit: "kg",
          image:
            "https://images.unsplash.com/photo-1518977676601-b14cf8a12203?auto=format&fit=crop&q=80&w=300",
        },
        {
          id: 2,
          name: "Aashirvaad Atta",
          price: 410,
          unit: "10kg",
          image:
            "https://images.unsplash.com/photo-1627485937980-221c88ce04ea?auto=format&fit=crop&q=80&w=300",
        },
        {
          id: 5,
          name: "Amul Taaza Milk",
          price: 52,
          unit: "1L",
          image:
            "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300",
        },
      ],
    },
    {
      name: "Spices & Condiments",
      items: [
        {
          id: 3,
          name: "Everest Garam Masala",
          price: 75,
          unit: "100g",
          image:
            "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300",
        },
        {
          id: 4,
          name: "Turmeric Powder",
          price: 45,
          unit: "250g",
          image:
            "https://images.unsplash.com/photo-1615485925600-97237c4ff1cb?auto=format&fit=crop&q=80&w=300",
        },
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════════
   SHOP PROFILE PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function ShopProfilePage() {
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [reservedItems, setReservedItems] = useState<Set<number>>(new Set());

  const toggleReserve = (id: number) => {
    setReservedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* ── Top Navigation Bar (Mobile / Back Button) ── */}
      <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-b from-black/60 to-transparent p-4 flex justify-between items-center pointer-events-none">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors pointer-events-auto">
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ── 1. Hero Banner & Profile Info ── */}
      <section className="relative bg-white border-b border-border shadow-sm pb-6">
        {/* Cover Photo */}
        <div className="w-full h-48 sm:h-64 lg:h-80 relative bg-stone-200">
          <img
            src={MOCK_SHOP.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Circular Profile Picture */}
          <div className="absolute -top-16 left-4 sm:left-6 lg:left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden relative">
              <img
                src={MOCK_SHOP.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {isOwnerMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                  <CameraIcon />
                </div>
              )}
            </div>
          </div>

          {/* Spacer for avatar */}
          <div className="h-20" />

          {/* Shop Details */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2">
                {MOCK_SHOP.name}
                {MOCK_SHOP.verified && (
                  <BadgeCheck className="w-6 h-6 text-primary flex-shrink-0" />
                )}
              </h1>
              {MOCK_SHOP.verified && (
                <p className="text-xs font-bold text-primary mt-0.5">
                  VERIFIED PEHCHAN WALA
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                <div className="flex items-center gap-1 font-semibold text-text-primary">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {MOCK_SHOP.rating}
                  <span className="text-text-muted font-normal">
                    ({MOCK_SHOP.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {MOCK_SHOP.openTime}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-1 text-sm text-text-muted">
                <MapPin className="w-4 h-4" />
                {MOCK_SHOP.address}
              </div>
            </div>
          </div>

          {/* ── 2. Action Buttons ── */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <button className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-surface border border-border hover:bg-surface-raised transition-colors active:scale-95 group">
              <div className="w-10 h-10 rounded-full bg-accent-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-bold text-text-primary">Directions</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-surface border border-border hover:bg-surface-raised transition-colors active:scale-95 group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-text-primary">Contact</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-surface border border-border hover:bg-surface-raised transition-colors active:scale-95 group">
              <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-text-primary">Inquiry</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Live Offer Banner ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-4 sm:p-5 text-white shadow-primary relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-wider mb-1">
                Live Store Offer
              </p>
              <h3 className="text-base sm:text-lg font-extrabold">
                {MOCK_SHOP.specialOffer}
              </h3>
            </div>
            {isOwnerMode && (
              <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0">
                <Pencil className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. "Smart Auto-Catalog" Grid ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {MOCK_SHOP.categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                {category.name}
              </h2>
              {isOwnerMode && (
                <button className="text-xs font-bold text-primary hover:underline">
                  + Add Item
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.items.map((item) => {
                const isReserved = reservedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group relative"
                  >
                    {/* Item Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-raised flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {isOwnerMode && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary line-clamp-2 leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs text-text-muted mt-1">
                          {item.unit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-base font-extrabold text-text-primary">
                          ₹{item.price}
                        </p>
                        {!isOwnerMode ? (
                          <button
                            onClick={() => toggleReserve(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5
                              ${
                                isReserved
                                  ? "bg-success/10 text-success border border-success/20"
                                  : "bg-primary text-white hover:bg-primary-hover shadow-sm"
                              }`}
                          >
                            {isReserved ? (
                              <>
                                <BadgeCheck className="w-3.5 h-3.5" /> Reserved
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" /> Reserve
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button className="text-xs font-bold text-accent hover:underline">
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── 5. Owner Mode (Edit Toggle) ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOwnerMode(!isOwnerMode)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-xl transition-all active:scale-95
            ${
              isOwnerMode
                ? "bg-slate-800 text-white hover:bg-slate-900"
                : "bg-white text-text-primary border border-border hover:bg-surface"
            }`}
        >
          <Pencil className="w-4 h-4" />
          <span className="text-sm font-bold">
            {isOwnerMode ? "Exit Owner Mode" : "View as Owner"}
          </span>
        </button>
      </div>
    </main>
  );
}

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6 text-white"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
      />
    </svg>
  );
}
