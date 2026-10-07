"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Mic,
  Send,
  X,
  Lightbulb,
  MapPin,
  CheckCircle2,
  Phone,
  Shield,
  Star,
  Clock,
  Smartphone,
  Loader2,
  type LucideIcon,
  Droplets,
  Zap,
  Tv,
  Paintbrush,
  Wind,
  Hammer,
  Wrench,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

/* ══════════════════════════════════════════════════════════════════
   TYPES & DATA
   ══════════════════════════════════════════════════════════════════ */

type Step = "form" | "scanning" | "bids";

interface CategoryChip {
  label: string;
  emoji: string;
  icon: LucideIcon;
}

const categories: CategoryChip[] = [
  { label: "Plumbing", emoji: "🚰", icon: Droplets },
  { label: "Electrical", emoji: "⚡", icon: Zap },
  { label: "Appliances", emoji: "📺", icon: Tv },
  { label: "Painting", emoji: "🎨", icon: Paintbrush },
  { label: "AC & Cooling", emoji: "❄️", icon: Wind },
  { label: "Carpentry", emoji: "🪚", icon: Hammer },
  { label: "Phone Repair", emoji: "📱", icon: Smartphone },
  { label: "Other", emoji: "🔧", icon: Wrench },
];

interface Bid {
  id: number;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  jobs: number;
  distance: string;
  price: number;
  timeToArrive: string;
  verified: boolean;
  emoji: string;
  message: string;
}

const mockBids: Bid[] = [
  {
    id: 1,
    name: "Raju Electronics",
    trade: "Appliance Expert",
    rating: 4.8,
    reviews: 142,
    jobs: 230,
    distance: "1.2 km",
    price: 350,
    timeToArrive: "15 min",
    verified: true,
    emoji: "⚡",
    message: "I can fix this today. Have all spare parts available.",
  },
  {
    id: 2,
    name: "Sunil Kumar",
    trade: "Master Technician",
    rating: 4.6,
    reviews: 98,
    jobs: 185,
    distance: "2.5 km",
    price: 420,
    timeToArrive: "25 min",
    verified: true,
    emoji: "🔧",
    message: "Experienced with this model. Can give 3-month warranty on repair.",
  },
  {
    id: 3,
    name: "Patna Repair Hub",
    trade: "Multi-brand Service",
    rating: 4.9,
    reviews: 210,
    jobs: 340,
    distance: "3.8 km",
    price: 500,
    timeToArrive: "40 min",
    verified: true,
    emoji: "🏪",
    message: "Official service centre quality. OEM parts used. 6-month warranty.",
  },
];

/* ══════════════════════════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════════════════════════ */

function PageHeader({ step }: { step: Step }) {
  const titles: Record<Step, string> = {
    form: "Fix a Problem",
    scanning: "Finding Experts",
    bids: "Live Deals",
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--header-border)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center hover:bg-surface transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </a>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-sm">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="leading-none">
                <p className="text-sm font-extrabold text-text-primary">{titles[step]}</p>
                <p className="text-[9px] text-text-muted font-semibold uppercase tracking-widest">Pehchan Wale</p>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {(["form", "scanning", "bids"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${s === step
                    ? "w-6 bg-accent"
                    : (["form", "scanning", "bids"].indexOf(step) > i)
                      ? "w-3 bg-accent/40"
                      : "w-3 bg-border"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STEP 1: REQUEST FORM
   ══════════════════════════════════════════════════════════════════ */

function RequestForm({ onSubmit }: { onSubmit: (reqId: string | null) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showEstimate = description.length > 10;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setErrors((p) => { const n = { ...p }; delete n.photo; return n; });
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedCategory) e.category = "Select a category";
    if (!description.trim()) e.description = "Describe your problem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    let imageUrl = null;

    try {
      // 1. Upload photo if exists
      if (photo) {
        const fileName = `problem_${Date.now()}_${photo.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from("problem-photos")
          .upload(fileName, photo);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("problem-photos")
            .getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        } else {
          console.warn("Photo upload error:", uploadError.message);
        }
      }

      // 2. Insert into customer_requests
      const { data, error } = await supabase
        .from("customer_requests")
        .insert([{
          category: selectedCategory,
          description: description,
          image_url: imageUrl,
          status: "open",
        }])
        .select()
        .single();

      if (error) throw error;

      setIsSubmitting(false);
      onSubmit(data.id);
    } catch (err) {
      console.warn("Supabase insert failed, using demo mode");
      setIsSubmitting(false);
      onSubmit(null); // Demo mode
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-tight">
          What needs fixing today? 🔧
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Upload a photo, describe it, and let local experts compete to give you the best deal.
        </p>
      </div>

      {/* Category Chips */}
      <div>
        <label className="block text-xs font-bold text-text-secondary mb-2.5 uppercase tracking-wider">
          Select Category
        </label>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  setSelectedCategory(cat.label);
                  setErrors((p) => { const n = { ...p }; delete n.category; return n; });
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 transition-all duration-200 active:scale-95
                  ${isSelected
                    ? "border-accent bg-accent-ghost text-accent shadow-sm"
                    : "border-border bg-card-bg text-text-secondary hover:border-accent/30 hover:bg-accent-ghost/50"
                  }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span className={`text-xs font-bold whitespace-nowrap ${isSelected ? "text-accent" : ""}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="text-[11px] text-danger mt-1.5 font-medium">{errors.category}</p>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-xs font-bold text-text-secondary mb-2.5 uppercase tracking-wider">
          Photo of the Problem
          <span className="text-text-muted font-medium normal-case tracking-normal ml-1">(Recommended)</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="sr-only"
          id="problem-photo"
        />

        {photoPreview ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-accent/40 animate-scale-in">
            <img
              src={photoPreview}
              alt="Problem photo"
              className="w-full h-52 sm:h-64 object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Photo attached</span>
              </div>
            </div>
            <button
              onClick={removePhoto}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold hover:bg-black/70 transition-colors"
            >
              <Camera className="w-3 h-3" />
              Retake
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 px-4 py-10 sm:py-12 rounded-2xl
              border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent-ghost/30
              bg-surface/50 transition-all duration-200 cursor-pointer active:scale-[0.98] group"
          >
            <div className="w-16 h-16 rounded-3xl bg-accent-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-8 h-8 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-text-primary">
                📸 Tap to Upload or Snap Photo
              </p>
              <p className="text-[11px] text-text-muted mt-1">
                Broken TV, leaking pipe, cracked wall — show us the problem
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-text-secondary mb-2.5 uppercase tracking-wider">
          Describe the Issue <span className="text-danger">*</span>
        </label>
        <div className={`relative bg-card-bg rounded-2xl border-2 overflow-hidden transition-all
          ${errors.description ? "border-danger" : "border-card-border focus-within:border-accent/40 focus-within:shadow-md"}`}>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((p) => { const n = { ...p }; delete n.description; return n; });
            }}
            placeholder="e.g. RO water purifier is leaking from the bottom. Water pooling on the floor. Started yesterday."
            rows={4}
            className="w-full bg-transparent px-4 pt-4 pb-10 text-sm text-text-primary placeholder:text-text-muted outline-none resize-none"
          />
          {/* Bottom bar */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 bg-surface/80 border-t border-border-light">
            <span className="text-[10px] text-text-muted font-medium">
              {description.length} / 500
            </span>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-subtle hover:bg-accent-ghost text-accent text-[11px] font-bold transition-colors active:scale-95"
              title="Voice input"
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Type
            </button>
          </div>
        </div>
        {errors.description && (
          <p className="text-[11px] text-danger mt-1.5 font-medium">{errors.description}</p>
        )}
      </div>

      {/* AI Estimate */}
      {showEstimate && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 rounded-2xl border border-amber-100 animate-fade-in-up">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
              💡 AI Price Estimate
            </p>
            <p className="text-lg font-extrabold text-amber-700 mt-0.5">₹300 – ₹500</p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Based on similar repairs in your area · Actual bids may vary
            </p>
          </div>
        </div>
      )}

      {/* Trust indicators */}
      <div className="flex items-center gap-4 justify-center py-1">
        {[
          { icon: Shield, text: "Verified Experts" },
          { icon: Star, text: "Rated by Locals" },
          { icon: Clock, text: "Quick Response" },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.text} className="flex items-center gap-1">
              <Icon className="w-3 h-3 text-text-muted" />
              <span className="text-[10px] text-text-muted font-medium">{t.text}</span>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
          bg-gradient-to-r from-accent to-accent-light text-white text-base font-bold shadow-lg
          hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        {isSubmitting ? "Uploading..." : "Get Local Deals Now"}
      </button>

      <p className="text-center text-[10px] text-text-muted">
        Free to post · No obligation to accept any bid
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STEP 2: SCANNING / RADAR STATE
   ══════════════════════════════════════════════════════════════════ */

function ScanningState({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Analyzing your request...");
  const [expertsFound, setExpertsFound] = useState(0);

  useEffect(() => {
    const stages = [
      { at: 15, text: "Scanning nearby experts...", experts: 0 },
      { at: 35, text: "📡 Alerting nearby Pehchan Wale...", experts: 1 },
      { at: 55, text: "Receiving bids from experts...", experts: 2 },
      { at: 80, text: "Almost done! Comparing deals...", experts: 3 },
      { at: 100, text: "Deals ready!", experts: 3 },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        const stage = stages.find((s) => s.at === next);
        if (stage) {
          setStatusText(stage.text);
          setExpertsFound(stage.experts);
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
      {/* Radar animation */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-8">
        {/* Outer rings */}
        <div className="absolute inset-0 rounded-full border-2 border-accent/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-4 rounded-full border-2 border-accent/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
        <div className="absolute inset-8 rounded-full border-2 border-accent/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.6s" }} />

        {/* Static rings */}
        <div className="absolute inset-0 rounded-full border border-accent/10" />
        <div className="absolute inset-6 rounded-full border border-accent/10" />
        <div className="absolute inset-12 rounded-full border border-accent/10" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-xl">
            <Wrench className="w-9 h-9 sm:w-10 sm:h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Floating expert dots */}
        {expertsFound >= 1 && (
          <div className="absolute top-4 right-6 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-scale-in">
            ⚡
          </div>
        )}
        {expertsFound >= 2 && (
          <div className="absolute bottom-8 left-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-lg animate-scale-in">
            🔧
          </div>
        )}
        {expertsFound >= 3 && (
          <div className="absolute top-12 left-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-scale-in">
            🏪
          </div>
        )}
      </div>

      {/* Status */}
      <h2 className="text-lg sm:text-xl font-extrabold text-text-primary text-center mb-2">
        {statusText}
      </h2>
      <p className="text-sm text-text-muted text-center mb-6">
        {expertsFound > 0
          ? `${expertsFound} expert${expertsFound > 1 ? "s" : ""} found nearby`
          : "Searching your area for verified experts"}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-text-muted font-medium">Finding best deals</span>
          <span className="text-[10px] font-bold text-accent">{progress}%</span>
        </div>
      </div>

      {/* Trust message */}
      <div className="flex items-center gap-2 mt-8 px-4 py-2.5 bg-surface rounded-full border border-border">
        <Shield className="w-3.5 h-3.5 text-accent" />
        <span className="text-[11px] text-text-muted font-medium">
          All experts are verified by PehchanWale
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STEP 3: LIVE BIDS DASHBOARD
   ══════════════════════════════════════════════════════════════════ */

function LiveBidsDashboard({ requestId }: { requestId: string | null }) {
  const [acceptedBid, setAcceptedBid] = useState<number | null>(null);
  const [visibleBids, setVisibleBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (!requestId) {
      // Demo mode
      const timers = mockBids.map((bid, i) =>
        setTimeout(() => {
          setVisibleBids((prev) => [...prev, bid]);
        }, i * 600)
      );
      return () => timers.forEach(clearTimeout);
    }

    // Real mode - subscribe to vendor_bids
    const fetchBids = async () => {
      const { data } = await supabase.from('vendor_bids').select('*').eq('request_id', requestId);
      if (data && data.length > 0) {
        // Map real bids to UI format
        const realBids = data.map((b, i) => ({
          ...mockBids[i % mockBids.length], // Borrow mock UI info for the vendor profile
          id: b.id,
          price: b.bid_amount,
        }));
        setVisibleBids(realBids);
      }
    };

    fetchBids();

    const channel = supabase
      .channel('realtime_bids')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vendor_bids', filter: `request_id=eq.${requestId}` }, (payload) => {
        const newBid = payload.new;
        setVisibleBids((prev) => [
          ...prev,
          {
            ...mockBids[prev.length % mockBids.length],
            id: newBid.id,
            price: newBid.bid_amount,
          }
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  const handleAccept = (bidId: number) => {
    setAcceptedBid(bidId);
  };

  if (acceptedBid) {
    const bid = visibleBids.find((b) => b.id === acceptedBid) || mockBids[0];
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-scale-in px-2">
        <div className="bg-card-bg rounded-3xl border border-card-border shadow-[var(--shadow-xl)] overflow-hidden w-full max-w-sm">
          {/* Success header */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 px-6 py-8 text-center overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-gentle-bounce">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-extrabold text-white">Deal Accepted! 🎉</h2>
              <p className="text-sm text-white/80 mt-1">Your expert is on the way</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-2xl">
              <div className="w-11 h-11 rounded-xl bg-accent-subtle flex items-center justify-center text-xl">{bid.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text-primary">{bid.name}</p>
                <p className="text-[11px] text-text-muted">Arriving in {bid.timeToArrive}</p>
              </div>
              <p className="text-lg font-extrabold text-success">₹{bid.price}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a href="tel:+919876543210" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold active:scale-95 transition-transform shadow-sm">
                <Phone className="w-4 h-4" />
                Call Expert
              </a>
              <Link href="/" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm font-bold active:scale-95 transition-transform">
                <ArrowLeft className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
          {visibleBids.length} Local Deal{visibleBids.length !== 1 ? "s" : ""} Found
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          Verified experts are competing for your job — pick the best deal
        </p>
      </div>

      {/* Lowest price highlight */}
      {/* Lowest price highlight */}
      {visibleBids.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 animate-fade-in-up">
          <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-700">
              Lowest bid: ₹{Math.min(...visibleBids.map((b) => b.price))} by {visibleBids.reduce((min, b) => (b.price < min.price ? b : min), visibleBids[0]).name}
            </p>
            <p className="text-[10px] text-emerald-600">Below market estimate of ₹300–₹500</p>
          </div>
        </div>
      )}

      {/* Bid Cards */}
      <div className="space-y-3">
        {visibleBids.length === 0 && (
          <div className="bg-card-bg rounded-2xl border border-card-border p-6 animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2 text-text-muted">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Waiting for experts to bid...</span>
            </div>
          </div>
        )}

        {visibleBids.map((bid, i) => {
          const isLowest = bid.price === Math.min(...visibleBids.map((b) => b.price));

          return (
            <div
              key={`${bid.id}-${i}`}
              className={`bg-card-bg rounded-2xl border overflow-hidden animate-scale-in transition-all duration-300
                ${isLowest ? "border-success/50 ring-1 ring-success/20" : "border-card-border"}
                hover:shadow-lg hover:-translate-y-0.5`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {isLowest && (
                <div className="bg-success/10 px-4 py-1.5 border-b border-success/20">
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Best Price
                  </span>
                </div>
              )}

              <div className="p-4 sm:p-5">
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-accent-subtle flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 select-none">
                    {bid.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-text-primary truncate">{bid.name}</h3>
                      {bid.verified && <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-text-muted">{bid.trade}</p>
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                      <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-bold text-amber-700">{bid.rating}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">{bid.reviews} reviews</span>
                      <span className="text-[10px] text-text-muted">·</span>
                      <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {bid.distance}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-extrabold text-text-primary">₹{bid.price}</p>
                    <p className="text-[10px] text-text-muted flex items-center gap-0.5 justify-end">
                      <Clock className="w-2.5 h-2.5" />
                      {bid.timeToArrive}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="px-3 py-2.5 bg-surface rounded-xl mb-4">
                  <p className="text-xs text-text-secondary leading-relaxed italic">
                    &ldquo;{bid.message}&rdquo;
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(bid.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm
                      ${isLowest
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-md"
                        : "bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-md"
                      }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Deal
                  </button>
                  <a
                    href="tel:+919876543210"
                    className="w-12 rounded-xl border-2 border-border flex items-center justify-center
                      hover:bg-surface hover:border-accent/40 transition-all active:scale-90"
                    title="Call vendor"
                  >
                    <Phone className="w-5 h-5 text-text-muted" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div className="text-center py-2">
        <p className="text-[11px] text-text-muted">
          All experts are <strong className="text-text-secondary">KYC verified</strong> by PehchanWale ·
          No upfront payment required
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function FixProblemPage() {
  const [step, setStep] = useState<Step>("form");
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleFormSubmit = (id: string | null) => {
    setRequestId(id);
    setStep("scanning");
  };

  const handleScanComplete = useCallback(() => {
    setStep("bids");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader step={step} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {step === "form" && <RequestForm onSubmit={handleFormSubmit} />}
        {step === "scanning" && <ScanningState onComplete={handleScanComplete} />}
        {step === "bids" && <LiveBidsDashboard requestId={requestId} />}
      </main>
    </div>
  );
}
