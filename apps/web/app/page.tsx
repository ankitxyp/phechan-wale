"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Bell,
  User,
  ShoppingCart,
  Wallet,
  MapPin,
  Star,
  BadgeCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Store,
  Phone,
  Heart,
  IndianRupee,
  Camera,
  Upload,
  Zap,
  Wrench,
  Scissors,
  Paintbrush,
  ShieldCheck,
  Leaf,
  Flame,
  Smartphone,
  Home,
  Truck,
  AlertTriangle,
  Clock,
  type LucideIcon,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════════════ */

interface Product {
  id: number;
  name: string;
  shop: string;
  shopVerified: boolean;
  localPrice: number;
  onlinePrice: number;
  distance: string;
  emoji: string;
  available: string;
  image?: string;
}

const dailyNeedsProducts: Product[] = [
  { id: 1, name: "Ashirvaad Atta 10kg", shop: "Sharma Kirana", shopVerified: true, localPrice: 410, onlinePrice: 480, distance: "350m", emoji: "🌾", available: "In stock" },
  { id: 2, name: "Surf Excel Matic 2kg", shop: "Gupta Provision", shopVerified: true, localPrice: 340, onlinePrice: 395, distance: "800m", emoji: "🧴", available: "In stock" },
  { id: 3, name: "Amul Butter 500g", shop: "Krishna Dairy", shopVerified: true, localPrice: 270, onlinePrice: 285, distance: "600m", emoji: "🧈", available: "In stock" },
  { id: 4, name: "Fresh Cabbage 1kg", shop: "Sabzi Mandi Ramu", shopVerified: true, localPrice: 25, onlinePrice: 45, distance: "400m", emoji: "🥬", available: "Fresh today" },
  { id: 5, name: "Tata Salt 1kg", shop: "Mehta Store", shopVerified: false, localPrice: 22, onlinePrice: 28, distance: "500m", emoji: "🧂", available: "In stock" },
  { id: 6, name: "Coconut Oil 1L", shop: "Organic Corner", shopVerified: true, localPrice: 190, onlinePrice: 260, distance: "2km", emoji: "🥥", available: "Limited" },
  { id: 7, name: "Dettol Soap 4-Pack", shop: "Sharma Kirana", shopVerified: true, localPrice: 195, onlinePrice: 230, distance: "350m", emoji: "🧼", available: "In stock" },
  { id: 8, name: "Red Label Tea 500g", shop: "Gupta Provision", shopVerified: true, localPrice: 265, onlinePrice: 310, distance: "800m", emoji: "🍵", available: "In stock" },
  { id: 9, name: "Fortune Oil 1L", shop: "Krishna Dairy", shopVerified: false, localPrice: 155, onlinePrice: 185, distance: "600m", emoji: "🫒", available: "In stock" },
  { id: 10, name: "Maggi Noodles 12pk", shop: "Mini Bazaar", shopVerified: true, localPrice: 144, onlinePrice: 168, distance: "1.2km", emoji: "🍜", available: "In stock" },
];

interface ServiceProvider {
  id: number;
  name: string;
  trade: string;
  tradeIcon: LucideIcon;
  rating: number;
  reviews: number;
  jobs: number;
  visitCharge: string;
  available: string;
  verified: boolean;
  emoji: string;
}

const topServices: ServiceProvider[] = [
  { id: 1, name: "Ramesh Mistri", trade: "Electrician", tradeIcon: Zap, rating: 4.8, reviews: 142, jobs: 230, visitCharge: "₹100", available: "Available now", verified: true, emoji: "⚡" },
  { id: 2, name: "Sunil Plumber", trade: "Plumber", tradeIcon: Wrench, rating: 4.6, reviews: 98, jobs: 185, visitCharge: "₹150", available: "Available now", verified: true, emoji: "🔧" },
  { id: 3, name: "Ajay Painters", trade: "Painter", tradeIcon: Paintbrush, rating: 4.9, reviews: 67, jobs: 92, visitCharge: "Free Visit", available: "Book tomorrow", verified: true, emoji: "🎨" },
  { id: 4, name: "Guddu Barber", trade: "Home Salon", tradeIcon: Scissors, rating: 4.7, reviews: 210, jobs: 410, visitCharge: "₹50", available: "Available now", verified: false, emoji: "💈" },
  { id: 5, name: "Ravi AC Service", trade: "AC Repair", tradeIcon: Wrench, rating: 4.5, reviews: 88, jobs: 155, visitCharge: "₹200", available: "Available now", verified: true, emoji: "❄️" },
  { id: 6, name: "Manoj Carpenter", trade: "Carpenter", tradeIcon: Home, rating: 4.4, reviews: 55, jobs: 120, visitCharge: "₹150", available: "Book tomorrow", verified: true, emoji: "🪚" },
  { id: 7, name: "Deepak Welder", trade: "Welding", tradeIcon: Zap, rating: 4.3, reviews: 42, jobs: 95, visitCharge: "₹200", available: "Available now", verified: false, emoji: "🔥" },
  { id: 8, name: "Sonu Tiles", trade: "Tiling", tradeIcon: Home, rating: 4.8, reviews: 73, jobs: 180, visitCharge: "Free Visit", available: "Available now", verified: true, emoji: "🏠" },
];

interface FarmerItem {
  id: number;
  name: string;
  farmer: string;
  pricePerKg: number;
  marketPrice: number;
  emoji: string;
  freshness: string;
  qty: string;
}

const farmerProducts: FarmerItem[] = [
  { id: 1, name: "Desi Aloo", farmer: "Ramji Kisaan, Danapur", pricePerKg: 18, marketPrice: 30, emoji: "🥔", freshness: "Harvested today", qty: "100 kg" },
  { id: 2, name: "Fresh Tomatoes", farmer: "Suresh Farm, Phulwari", pricePerKg: 22, marketPrice: 40, emoji: "🍅", freshness: "Farm fresh", qty: "60 kg" },
  { id: 3, name: "Onion (Pyaaz)", farmer: "Mahesh Yadav, Barh", pricePerKg: 25, marketPrice: 35, emoji: "🧅", freshness: "Dried & sorted", qty: "200 kg" },
  { id: 4, name: "Spinach (Palak)", farmer: "Geeta Devi, Danapur", pricePerKg: 20, marketPrice: 40, emoji: "🥬", freshness: "Picked morning", qty: "30 kg" },
  { id: 5, name: "Desi Ghee (Cow)", farmer: "Gopal Dairy, Bihta", pricePerKg: 550, marketPrice: 750, emoji: "🫕", freshness: "Pure & fresh", qty: "15 L" },
  { id: 6, name: "Green Chilli", farmer: "Lakshmi Farm", pricePerKg: 40, marketPrice: 80, emoji: "🌶️", freshness: "Picked today", qty: "25 kg" },
  { id: 7, name: "Cauliflower", farmer: "Ramji Kisaan", pricePerKg: 30, marketPrice: 50, emoji: "🥦", freshness: "Farm fresh", qty: "40 kg" },
  { id: 8, name: "Mustard Oil 1L", farmer: "Gopal Dairy", pricePerKg: 160, marketPrice: 220, emoji: "🫗", freshness: "Cold pressed", qty: "50 L" },
];

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
  emoji: string;
  badge?: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "Monsoon Special: AC Servicing",
    subtitle: "Get your AC serviced by verified experts at unbeatable local prices. No middlemen!",
    cta: "Book at ₹499",
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    emoji: "❄️",
    badge: "TRENDING",
  },
  {
    id: 2,
    title: "Upload TV Photo → Get Repair Bids",
    subtitle: "Broken TV? Take a photo, post it, and let local experts compete to fix it at the best price.",
    cta: "Upload Issue Now",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    emoji: "📺",
    badge: "NEW FEATURE",
  },
  {
    id: 3,
    title: "Farm Fresh: Direct to Your Door",
    subtitle: "Skip the middleman. Buy aloo at ₹18/kg, tamatar at ₹22/kg — straight from Patna's farmers.",
    cta: "Shop Farm Fresh",
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    emoji: "🌾",
    badge: "SAVE 40%",
  },
  {
    id: 4,
    title: "Reserve Any Product at Just ₹10",
    subtitle: "Find it cheaper locally. Reserve online, inspect in person, then pay the rest. Zero risk!",
    cta: "Start Browsing",
    gradient: "from-violet-500 via-purple-600 to-fuchsia-700",
    emoji: "🛒",
  },
];

interface CategoryItem {
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

const categories: CategoryItem[] = [
  { label: "Daily Groceries", emoji: "🛒", color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Home Repairs", emoji: "🔧", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Electronics", emoji: "📱", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Direct from Farmer", emoji: "🌾", color: "text-green-700", bg: "bg-green-50" },
  { label: "Emergency SOS", emoji: "🆘", color: "text-red-600", bg: "bg-red-50" },
  { label: "Home Salon", emoji: "💈", color: "text-pink-600", bg: "bg-pink-50" },
  { label: "Painting", emoji: "🎨", color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "AC & Cooling", emoji: "❄️", color: "text-cyan-600", bg: "bg-cyan-50" },
];

/* ══════════════════════════════════════════════════════════════════
   PREMIUM HEADER
   ══════════════════════════════════════════════════════════════════ */

function PremiumHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const searchCategories = [
    { value: "all", label: "All" },
    { value: "products", label: "Products" },
    { value: "services", label: "Services" },
    { value: "farmers", label: "Farmers" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary-hover shadow-lg">
      {/* ── Desktop ── */}
      <div className="hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-6 xl:px-8">
          <div className="flex items-center gap-6 h-[64px]">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm group-hover:bg-white/30 transition-colors">
                <span className="text-white text-lg font-black">प</span>
              </div>
              <div className="leading-none">
                <span className="text-lg font-extrabold text-white">Pehchan</span>
                <span className="text-lg font-extrabold text-amber-200">Wale</span>
                <p className="text-[8px] font-semibold text-white/60 tracking-widest uppercase">Apne Logon Se</p>
              </div>
            </Link>

            {/* Location Pill */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-amber-200" />
              <span className="text-xs font-semibold">Patna</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-md">
                {/* Category dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCatDropdown(!showCatDropdown)}
                    className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold text-text-secondary bg-surface hover:bg-surface-raised transition-colors border-r border-border whitespace-nowrap"
                  >
                    {searchCategories.find((c) => c.value === searchCategory)?.label}
                    <ChevronDown className="w-3 h-3 text-text-muted" />
                  </button>
                  {showCatDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-border py-1 z-50 animate-scale-in">
                      {searchCategories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setSearchCategory(cat.value);
                            setShowCatDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-surface transition-colors
                            ${searchCategory === cat.value ? "text-primary font-bold bg-primary-ghost" : "text-text-secondary"}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder="Search for groceries, electricians, spare parts, farm produce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none bg-transparent"
                />

                {/* Search button */}
                <button className="px-5 py-3 bg-primary hover:bg-primary-hover text-white transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <button className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-300 rounded-full ring-2 ring-primary" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-white">
                <Wallet className="w-5 h-5" />
                <span className="text-xs font-semibold hidden xl:inline">₹0</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-white">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-xs font-semibold hidden xl:inline">Cart</span>
              </button>
              <Link href="/login" className="flex items-center gap-2 ml-1 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-white border border-white/10">
                <User className="w-5 h-5" />
                <span className="text-xs font-semibold hidden xl:inline">Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="lg:hidden">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-sm font-black">प</span>
              </div>
              <div className="leading-none">
                <span className="text-sm font-extrabold text-white">Pehchan</span>
                <span className="text-sm font-extrabold text-amber-200">Wale</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-white text-[11px] font-semibold border border-white/10">
                <MapPin className="w-3 h-3 text-amber-200" />
                Patna
              </button>
              <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-300 rounded-full ring-2 ring-primary" />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <ShoppingCart className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
          {/* Mobile search */}
          <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm">
            <Search className="w-4 h-4 text-text-muted ml-3.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products, services, farmers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none bg-transparent"
            />
            <button className="px-3 py-2.5 text-primary">
              <Camera className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CATEGORY STRIP
   ══════════════════════════════════════════════════════════════════ */

function CategoryStrip() {
  return (
    <section className="bg-card-bg border-b border-card-border shadow-[var(--shadow-xs)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex overflow-x-auto hide-scrollbar">
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 sm:px-6 lg:px-8 py-3.5 lg:py-4
                hover:bg-surface transition-all duration-200 group relative
                border-b-2 border-transparent hover:border-primary"
            >
              <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${cat.bg} flex items-center justify-center text-2xl lg:text-3xl
                group-hover:scale-110 transition-transform duration-300 select-none shadow-sm`}>
                {cat.emoji}
              </div>
              <span className={`text-[10px] lg:text-xs font-semibold text-text-secondary group-hover:text-primary transition-colors whitespace-nowrap`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HERO CAROUSEL
   ══════════════════════════════════════════════════════════════════ */

function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoSlide]);

  const goTo = (index: number) => {
    setActiveSlide(index);
    startAutoSlide();
  };

  const goPrev = () => {
    setActiveSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    startAutoSlide();
  };

  const goNext = () => {
    setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    startAutoSlide();
  };

  const slide = bannerSlides[activeSlide];

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
      <div className={`relative bg-gradient-to-br ${slide.gradient} rounded-2xl lg:rounded-3xl overflow-hidden
        shadow-xl transition-all duration-700`}>
        {/* Decorative shapes */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5" />

        {/* Content */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-14 gap-6">
          <div className="flex-1 text-center lg:text-left max-w-xl">
            {slide.badge && (
              <span className="inline-block text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3 tracking-wider">
                {slide.badge}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3">
              {slide.title}
            </h2>
            <p className="text-sm lg:text-base text-white/80 mb-5 leading-relaxed max-w-md mx-auto lg:mx-0">
              {slide.subtitle}
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-text-primary text-sm font-bold
              hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-md">
              {slide.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Emoji graphic */}
          <div className="text-7xl sm:text-8xl lg:text-9xl select-none animate-gentle-bounce flex-shrink-0 opacity-90">
            {slide.emoji}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-black/20 hover:bg-black/40
            backdrop-blur-sm flex items-center justify-center text-white transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-black/20 hover:bg-black/40
            backdrop-blur-sm flex items-center justify-center text-white transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeSlide
                  ? "w-7 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HORIZONTAL SCROLL ROW — DAILY NEEDS
   ══════════════════════════════════════════════════════════════════ */

function HorizontalScrollRow({
  title,
  subtitle,
  badge,
  badgeColor,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 lg:mb-5">
        <div>
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-text-primary flex items-center gap-2">
            {title}
            {badge && (
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor || "bg-primary-subtle text-primary"}`}>
                {badge}
              </span>
            )}
          </h2>
          <p className="text-[11px] sm:text-xs lg:text-sm text-text-muted mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="hidden sm:flex w-8 h-8 rounded-full border border-border items-center justify-center hover:bg-surface active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden sm:flex w-8 h-8 rounded-full border border-border items-center justify-center hover:bg-surface active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
          <button className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1 hover:gap-1.5 transition-all group ml-1">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Scrolling container */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-2"
      >
        {children}
      </div>
    </section>
  );
}

/* ── Product Card ── */
function ProductCard({ product, index }: { product: Product; index: number }) {
  const savings = product.onlinePrice - product.localPrice;
  const savingsPct = Math.round((savings / product.onlinePrice) * 100);
  const [isFav, setIsFav] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[240px] bg-card-bg rounded-2xl border border-card-border overflow-hidden
        hover:shadow-lg hover:border-card-hover-border hover:-translate-y-1
        transition-all duration-300 animate-scale-in group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gradient-to-br from-surface via-surface-raised/40 to-surface flex items-center justify-center">
        <span className="text-5xl lg:text-6xl group-hover:scale-110 transition-transform duration-500 select-none">
          {product.emoji}
        </span>

        {savingsPct > 0 && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-extrabold text-white bg-success px-2 py-0.5 rounded-lg shadow-sm">
            {savingsPct}% OFF
          </span>
        )}

        <button
          onClick={() => setIsFav(!isFav)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm
            flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-transform"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
        </button>

        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
          <Navigation className="w-2.5 h-2.5" />
          {product.distance}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <h3 className="text-[13px] font-bold text-text-primary leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
          <Store className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{product.shop}</span>
          {product.shopVerified && <BadgeCheck className="w-3 h-3 text-primary flex-shrink-0" />}
        </p>

        <div className="mt-2 flex items-baseline gap-1.5">
          <p className="text-base font-extrabold text-text-primary">₹{product.localPrice}</p>
          <span className="text-[10px] text-text-muted line-through">₹{product.onlinePrice}</span>
        </div>

        <Link href="/checkout" className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold
          bg-primary text-white hover:bg-primary-hover transition-colors active:scale-95 shadow-sm">
          <IndianRupee className="w-3 h-3" />
          Reserve ₹10
        </Link>
      </div>
    </div>
  );
}

/* ── Service Card ── */
function ServiceCard({ sp, index }: { sp: ServiceProvider; index: number }) {
  const TradeIcon = sp.tradeIcon;
  return (
    <div
      className="flex-shrink-0 w-[240px] sm:w-[260px] lg:w-[280px] bg-card-bg rounded-2xl border border-card-border p-4 lg:p-5
        hover:shadow-lg hover:border-card-hover-border hover:-translate-y-1
        transition-all duration-300 animate-scale-in group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center text-2xl select-none flex-shrink-0
          group-hover:scale-105 transition-transform duration-300">
          {sp.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <span className="truncate">{sp.name}</span>
            {sp.verified && <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />}
          </h3>
          <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
            <TradeIcon className="w-3 h-3" />
            {sp.trade}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-700">{sp.rating}</span>
        </div>
        <span className="text-[10px] text-text-muted">{sp.reviews} reviews · {sp.jobs} jobs</span>
      </div>

      {/* Visit charge */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface rounded-xl mb-3">
        <span className="text-[10px] text-text-muted font-medium">Visit charge</span>
        <span className={`text-xs font-extrabold ${sp.visitCharge === "Free Visit" ? "text-success" : "text-text-primary"}`}>
          {sp.visitCharge}
        </span>
      </div>

      {/* Availability */}
      <p className="text-[10px] text-success font-semibold flex items-center gap-1 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
        {sp.available}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href="/fix-problem" className="flex-1 py-2.5 rounded-xl bg-accent text-white text-xs font-bold text-center
          hover:bg-accent-hover transition-colors active:scale-95 shadow-sm">
          Get Deal
        </Link>
        <button className="w-10 rounded-xl border border-border flex items-center justify-center
          hover:bg-surface hover:border-accent/40 transition-all active:scale-95" title="Call">
          <Phone className="w-3.5 h-3.5 text-text-muted" />
        </button>
      </div>
    </div>
  );
}

/* ── Farmer Card ── */
function FarmerCard({ item, index }: { item: FarmerItem; index: number }) {
  const savings = item.marketPrice - item.pricePerKg;
  return (
    <div
      className="flex-shrink-0 w-[220px] sm:w-[240px] lg:w-[260px] bg-card-bg rounded-2xl border border-card-border overflow-hidden
        hover:shadow-lg hover:border-card-hover-border hover:-translate-y-1
        transition-all duration-300 animate-scale-in group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Green ribbon */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xl select-none">{item.emoji}</span>
        <span className="text-[9px] font-bold text-emerald-100 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
          🌿 {item.freshness}
        </span>
      </div>

      <div className="p-3.5">
        <h3 className="text-[13px] font-bold text-text-primary">{item.name}</h3>
        <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
          <Leaf className="w-3 h-3 text-success" />
          <span className="truncate">{item.farmer}</span>
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-semibold text-text-secondary bg-surface px-2 py-0.5 rounded-md">
            {item.qty} avail
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-base font-extrabold text-text-primary">₹{item.pricePerKg}/kg</p>
          <span className="text-[10px] text-text-muted line-through">₹{item.marketPrice}</span>
          <span className="text-[10px] font-bold text-success">Save ₹{savings}</span>
        </div>

        <button className="w-full mt-2.5 py-2 rounded-xl bg-success text-white text-xs font-bold
          hover:bg-emerald-600 transition-colors active:scale-95 shadow-sm">
          🌾 Reserve from Farmer
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   BIDDING / PROBLEM BANNER
   ══════════════════════════════════════════════════════════════════ */

function BiddingBanner() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl">
        {/* Decorative */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-primary/10" />
        <div className="absolute top-8 right-1/3 w-2 h-2 rounded-full bg-amber-400/60 animate-float" />
        <div className="absolute bottom-12 left-1/4 w-1.5 h-1.5 rounded-full bg-primary-light/50 animate-float" style={{ animationDelay: "1s" }} />

        <div className="relative flex flex-col lg:flex-row items-center justify-between px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12 gap-6">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full mb-3 tracking-wider">
              <Zap className="w-3 h-3" />
              PEHCHAN WALE BIDDING
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3">
              Got a broken item?{" "}
              <span className="text-amber-300">Upload a photo</span> and let
              local experts bid!
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Post your repair issue — broken TV, leaking pipe, cracked wall — and local Pehchan Wale
              experts will compete to give you the best price. No more overpaying!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold
                shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95">
                <Upload className="w-5 h-5" />
                Upload Issue
              </button>
              <button className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium
                hover:bg-white/20 transition-all">
                <Camera className="w-4 h-4" />
                Take a Photo
              </button>
            </div>
          </div>

          {/* Right — visual */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="flex flex-col gap-2.5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 animate-fade-in-up">
                <p className="text-[10px] text-gray-400 mb-1">Plumber Sunil bid</p>
                <p className="text-lg font-extrabold text-emerald-400">₹350</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <p className="text-[10px] text-gray-400 mb-1">Electrician Ramesh bid</p>
                <p className="text-lg font-extrabold text-amber-400">₹420</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <p className="text-[10px] text-gray-400 mb-1">AC Expert Ravi bid</p>
                <p className="text-lg font-extrabold text-sky-400">₹500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TRUST STRIP
   ══════════════════════════════════════════════════════════════════ */

function TrustStrip() {
  const stats = [
    { icon: Store, label: "500+", sub: "Local Shops", color: "text-primary", bg: "bg-primary-subtle" },
    { icon: ShieldCheck, label: "150+", sub: "Verified Experts", color: "text-accent", bg: "bg-accent-subtle" },
    { icon: IndianRupee, label: "₹10", sub: "Reserve & Pickup", color: "text-success", bg: "bg-emerald-50" },
    { icon: Truck, label: "0 km", sub: "No Delivery Needed", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.sub}
                className="flex items-center gap-3 py-2 animate-fade-in-up justify-center sm:justify-start"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm lg:text-base font-extrabold text-text-primary leading-none">{s.label}</p>
                  <p className="text-[10px] lg:text-xs text-text-muted mt-0.5 font-medium">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SOS QUICK ACCESS BANNER
   ══════════════════════════════════════════════════════════════════ */

function SOSBanner() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 py-5 sm:py-6 gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">🆘 Emergency SOS</h3>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                Pipe burst? Power out? Get immediate help from verified local experts.
              </p>
            </div>
          </div>
          <Link href="/fix-problem" className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-red-600 text-sm font-bold
            hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-md">
            <Phone className="w-4 h-4" />
            Call for Help Now
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ══════════════════════════════════════════════════════════════════ */

function HowItWorks() {
  const steps = [
    { step: "1", title: "Search or Describe", description: "Find products by name or upload a photo of what needs fixing", emoji: "🔍" },
    { step: "2", title: "Compare & Reserve", description: "See local prices vs online. Reserve at ₹10 — zero commitment", emoji: "💰" },
    { step: "3", title: "Walk & Pickup", description: "Walk to the shop, inspect the product, pay the remaining amount", emoji: "🚶" },
  ];

  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h2 className="text-base lg:text-xl font-extrabold text-text-primary text-center mb-2">
          How Pehchan Wale Works
        </h2>
        <p className="text-xs lg:text-sm text-text-muted text-center mb-6 lg:mb-8 max-w-md mx-auto">
          No delivery. No shipping. Just your neighbourhood, made searchable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8 max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.step} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-card-bg border border-card-border flex items-center justify-center text-3xl shadow-sm">
                {s.emoji}
              </div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mb-2">
                {s.step}
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">{s.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAV
   ══════════════════════════════════════════════════════════════════ */

function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState("Home");
  const tabs = [
    { icon: Home, label: "Home", href: "/" },
    { icon: ShoppingCart, label: "Reserve", href: "/checkout" },
    { icon: Wrench, label: "Fix", href: "/fix-problem" },
    { icon: Leaf, label: "Farm", href: "/" },
    { icon: User, label: "Profile", href: "/login" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[var(--header-bg)] backdrop-blur-2xl border-t border-border lg:hidden">
      <div className="flex items-center justify-around py-1.5 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.label === activeTab;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              onClick={() => setActiveTab(tab.label)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200
                ${isActive ? "text-primary bg-primary-ghost" : "text-text-muted hover:text-text-secondary active:scale-95"}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white text-base font-black">प</span>
              </div>
              <div>
                <span className="text-lg font-extrabold text-white">Pehchan</span>
                <span className="text-lg font-extrabold text-primary-light">Wale</span>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              Your neighbourhood, made searchable. Find products, compare local prices, connect with
              trusted repairmen — all without leaving your area.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              {["How it Works", "For Shop Owners", "For Mechanics", "For Farmers", "Agent Dashboard"].map((l) => (
                <li key={l}><Link href={l === "Agent Dashboard" ? "/agent-dashboard" : l === "For Shop Owners" ? "/vendor-dashboard" : "#"} className="hover:text-primary-light transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              {["Help Center", "Safety", "Terms of Service", "Privacy Policy"].map((l) => (
                <li key={l}><Link href="#" className="hover:text-primary-light transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-light flex-shrink-0" /> Patna, Bihar</li>
              <li>📧 hello@pehchanwale.com</li>
              <li>📞 +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 Pehchan Wale · All rights reserved</p>
          <p>Made with ❤️ in Patna for Patna</p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <PremiumHeader />
      <CategoryStrip />
      <HeroCarousel />

      <TrustStrip />

      {/* Daily Needs — Horizontal Scroll */}
      <HorizontalScrollRow
        title="Daily Needs Near You"
        subtitle="Reserve at ₹10, pick up from your neighbourhood shop — no delivery wait"
        badge="SAVE vs ONLINE"
        badgeColor="bg-primary-subtle text-primary"
      >
        {dailyNeedsProducts.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </HorizontalScrollRow>

      {/* Top Rated Services — Horizontal Scroll */}
      <div className="bg-surface border-y border-border">
        <HorizontalScrollRow
          title="Top Rated Pehchan Wale"
          subtitle="Verified local mechanics, painters & electricians your neighbours trust"
          badge="VERIFIED"
          badgeColor="bg-accent-subtle text-accent"
        >
          {topServices.map((sp, i) => (
            <ServiceCard key={sp.id} sp={sp} index={i} />
          ))}
        </HorizontalScrollRow>
      </div>

      {/* Bidding Banner */}
      <BiddingBanner />

      {/* Direct from Farmers — Horizontal Scroll */}
      <HorizontalScrollRow
        title="🌾 Direct from Farmers"
        subtitle="Buy 1 kg or 50 kg — straight from the farm, no middlemen"
        badge="FARM FRESH"
        badgeColor="bg-emerald-50 text-emerald-700"
      >
        {farmerProducts.map((item, i) => (
          <FarmerCard key={item.id} item={item} index={i} />
        ))}
      </HorizontalScrollRow>

      {/* SOS */}
      <SOSBanner />

      {/* How It Works */}
      <HowItWorks />

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
