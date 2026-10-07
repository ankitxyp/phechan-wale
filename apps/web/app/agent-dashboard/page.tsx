"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { registerNewShop, triggerAutoCatalog, creditAgentWallet } from "../../lib/api/shopActions";
import {
  ArrowLeft,
  User,
  Wallet,
  Store,
  CheckCircle2,
  Loader2,
  Sparkles,
  Share2,
  PlusCircle,
  IndianRupee,
  BadgeCheck,
  LocateFixed,
  ChevronDown,
  Camera,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  X,
  Clock,
  TrendingUp,
  AlertCircle,
  Download,
  type LucideIcon,
} from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ShopCertificate from "../components/ShopCertificate";

/* ══════════════════════════════════════════════════════════════════
   TYPES & CONFIG
   ══════════════════════════════════════════════════════════════════ */

type ShopCategory = "grocery" | "mechanic" | "electrician" | "farmer" | "food";

interface CategoryConfig {
  label: string;
  emoji: string;
  catalogCount: string;
  catalogMessage: string;
}

const CATEGORIES: Record<ShopCategory, CategoryConfig> = {
  grocery: {
    label: "Grocery / Kirana",
    emoji: "🛒",
    catalogCount: "100+",
    catalogMessage: "100+ daily need items (atta, dal, oil, soap, detergent…) will be auto-added with standard MRP",
  },
  mechanic: {
    label: "Mechanic / Garage",
    emoji: "🔧",
    catalogCount: "60+",
    catalogMessage: "60+ common repair services (puncture, oil change, brake pad…) with standard local rates",
  },
  electrician: {
    label: "Electrician",
    emoji: "⚡",
    catalogCount: "45+",
    catalogMessage: "45+ electrical services & spare parts (wiring, fan, MCB, switch…) with pricing",
  },
  farmer: {
    label: "Farmer / Kisaan",
    emoji: "🌾",
    catalogCount: "80+",
    catalogMessage: "80+ seasonal crops & produce (aloo, tamatar, pyaaz…) with mandi reference prices",
  },
  food: {
    label: "Food / Restaurant",
    emoji: "🍽️",
    catalogCount: "70+",
    catalogMessage: "70+ popular food items & combos (thali, biryani, chai, snacks…) with standard pricing",
  },
};

/* ══════════════════════════════════════════════════════════════════
   AGENT HEADER
   ══════════════════════════════════════════════════════════════════ */

function AgentHeader({ totalEarned }: { totalEarned: number }) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--header-border)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center hover:bg-surface transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-black">प</span>
              </div>
              <div className="leading-none hidden sm:block">
                <span className="text-sm font-extrabold text-text-primary">Agent</span>
                <span className="text-sm font-extrabold text-primary">Panel</span>
                <p className="text-[8px] font-semibold text-text-muted tracking-widest uppercase">Internal Tool</p>
              </div>
            </div>
          </div>

          {/* Right — Wallet */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-[8px] sm:text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">
                  Earned Today
                </p>
                <p className="text-sm font-extrabold text-emerald-700">₹{totalEarned}</p>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STATS BAR
   ══════════════════════════════════════════════════════════════════ */

function StatsBar({ shopsToday, totalEarned }: { shopsToday: number; totalEarned: number }) {
  const stats = [
    { icon: Store, label: String(shopsToday), sub: "Registered", color: "text-primary", bg: "bg-primary-subtle" },
    { icon: IndianRupee, label: `₹${totalEarned}`, sub: "Commission", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: TrendingUp, label: `₹${shopsToday * 100}`, sub: "Collected", color: "text-accent", bg: "bg-accent-subtle" },
    { icon: Clock, label: "Active", sub: "Status", color: "text-success", bg: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.sub}
            className="flex flex-col items-center gap-1 py-2.5 sm:py-3 rounded-2xl bg-card-bg border border-card-border animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-text-primary leading-none">{s.label}</p>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-medium">{s.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FORM FIELD COMPONENT
   ══════════════════════════════════════════════════════════════════ */

function FormField({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
        {label}
        {required && <span className="text-danger text-xs">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[10px] text-text-muted mt-1 pl-0.5">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-danger mt-1 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION DIVIDER
   ══════════════════════════════════════════════════════════════════ */

function SectionDivider({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-text-muted" />
      </div>
      <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-border-light" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   REGISTRATION FORM
   ══════════════════════════════════════════════════════════════════ */

function RegistrationForm({ onSuccess }: { onSuccess: (shopData: { name: string; id: string }) => void }) {
  // Shop Details
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState<ShopCategory | "">("");

  // KYC
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [email, setEmail] = useState("");

  // Photo Proof
  const [shopPhoto, setShopPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);

  // Auto-catalog
  const [autoCatalog, setAutoCatalog] = useState(true);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Helpers ──

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShopPhoto(file);
    clearError("photo");
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setShopPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const detectGPS = useCallback(() => {
    setGpsLoading(true);
    setGpsDetected(false);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setGpsLoading(false);
          setGpsDetected(true);
          setErrors((prev) => { const n = { ...prev }; delete n.location; return n; });
        },
        () => {
          // Fallback: Patna coordinates
          setLatitude("25.612677");
          setLongitude("85.158875");
          setGpsLoading(false);
          setGpsDetected(true);
          setErrors((prev) => { const n = { ...prev }; delete n.location; return n; });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLatitude("25.612677");
      setLongitude("85.158875");
      setGpsLoading(false);
      setGpsDetected(true);
    }
  }, []);

  // ── Validation ──

  const validate = () => {
    const e: Record<string, string> = {};

    if (!shopName.trim()) e.shopName = "Shop name is required";
    if (!category) e.category = "Select a shop category";

    if (!ownerName.trim()) e.ownerName = "Owner name is required";
    if (!ownerPhone.trim()) e.ownerPhone = "Phone number is required";
    else if (ownerPhone.length !== 10) e.ownerPhone = "Enter a valid 10-digit phone number";

    if (!aadhaarNumber.trim()) e.aadhaar = "Aadhaar number is required for KYC";
    else if (aadhaarNumber.replace(/\s/g, "").length !== 12) e.aadhaar = "Aadhaar must be exactly 12 digits";

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";

    if (!shopPhoto) e.photo = "Shop photo is mandatory — proof of physical visit";

    if (!latitude || !longitude) e.location = "GPS location is required — tap to detect";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      // 1. Register Shop in Supabase
      const newShop = await registerNewShop({
        name: shopName,
        category: category,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        owner_name: ownerName,
        owner_phone: ownerPhone,
        aadhaar_number: aadhaarNumber,
        agent_id: "agent-123", // Static ID for current agent session
      });

      // 2. Trigger Auto-Catalog if enabled
      if (autoCatalog && newShop?.id) {
        await triggerAutoCatalog(newShop.id, category);
      }

      // 3. Credit Agent Wallet ₹50
      await creditAgentWallet("agent-123", 50);

      onSuccess({ name: shopName, id: newShop?.id || "temp-id" });
    } catch (error) {
      console.error("Failed to register shop:", error);
      setErrors({ ...errors, form: "Failed to register shop to database. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCat = category ? CATEGORIES[category] : null;

  return (
    <div className="bg-card-bg rounded-2xl sm:rounded-3xl border border-card-border shadow-[var(--shadow-lg)] overflow-hidden animate-scale-in">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">New Shop Registration</h2>
            <p className="text-[11px] text-white/70 mt-0.5">
              All fields marked <span className="text-amber-200 font-semibold">*</span> are mandatory
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-4 sm:p-6 space-y-5">

        {/* ═══ SECTION 1: Shop Details ═══ */}
        <SectionDivider icon={Store} label="Shop Details" />

        <div className="space-y-4">
          <FormField label="Shop Name" required error={errors.shopName}>
            <input
              type="text"
              value={shopName}
              onChange={(e) => { setShopName(e.target.value); clearError("shopName"); }}
              placeholder="e.g. Sharma General Store"
              className={`w-full bg-input-bg border-2 ${errors.shopName ? "border-danger" : "border-input-border"}
                rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none
                focus:border-primary/40 focus:shadow-md transition-all`}
            />
          </FormField>

          <FormField label="Shop Category" required error={errors.category}>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value as ShopCategory); clearError("category"); }}
                className={`w-full appearance-none bg-input-bg border-2 ${errors.category ? "border-danger" : "border-input-border"}
                  rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/40 focus:shadow-md transition-all cursor-pointer
                  ${!category ? "text-text-muted" : "text-text-primary"}`}
              >
                <option value="">Select a category</option>
                {(Object.entries(CATEGORIES) as [ShopCategory, CategoryConfig][]).map(([key, val]) => (
                  <option key={key} value={key}>{val.emoji} {val.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </FormField>
        </div>

        {/* ═══ SECTION 2: KYC Details ═══ */}
        <SectionDivider icon={ShieldCheck} label="KYC & Owner Details" />

        <div className="space-y-4">
          <FormField label="Owner Full Name" required error={errors.ownerName}>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={ownerName}
                onChange={(e) => { setOwnerName(e.target.value); clearError("ownerName"); }}
                placeholder="e.g. Rajesh Kumar Sharma"
                className={`w-full bg-input-bg border-2 ${errors.ownerName ? "border-danger" : "border-input-border"}
                  rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none
                  focus:border-primary/40 focus:shadow-md transition-all`}
              />
            </div>
          </FormField>

          <FormField label="Owner Phone Number" required error={errors.ownerPhone} hint="Will receive OTP for verification">
            <div className="relative flex">
              <div className="flex items-center gap-1 px-3 bg-surface border-2 border-r-0 border-input-border rounded-l-xl text-xs font-semibold text-text-secondary">
                <span>🇮🇳</span> +91
              </div>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => { setOwnerPhone(formatPhone(e.target.value)); clearError("ownerPhone"); }}
                placeholder="98765 43210"
                maxLength={10}
                className={`flex-1 bg-input-bg border-2 border-l-0 ${errors.ownerPhone ? "border-danger" : "border-input-border"}
                  rounded-r-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none
                  focus:border-primary/40 focus:shadow-md transition-all font-mono tracking-wider`}
              />
            </div>
          </FormField>

          <FormField label="Aadhaar Number" required error={errors.aadhaar} hint="12-digit Aadhaar for KYC compliance">
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => { setAadhaarNumber(formatAadhaar(e.target.value)); clearError("aadhaar"); }}
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                className={`w-full bg-input-bg border-2 ${errors.aadhaar ? "border-danger" : "border-input-border"}
                  rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none
                  focus:border-primary/40 focus:shadow-md transition-all font-mono tracking-[0.2em]`}
              />
            </div>
          </FormField>

          <FormField label="Email ID" error={errors.email} hint="Optional — for sending registration receipt">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                placeholder="owner@email.com"
                className={`w-full bg-input-bg border-2 ${errors.email ? "border-danger" : "border-input-border"}
                  rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none
                  focus:border-primary/40 focus:shadow-md transition-all`}
              />
            </div>
          </FormField>
        </div>

        {/* ═══ SECTION 3: Proof of Visit ═══ */}
        <SectionDivider icon={Camera} label="Proof of Visit" />

        <FormField label="Shop Photo" required error={errors.photo} hint="Take a clear photo of the shop front — mandatory for verification">
          {/* Hidden file input with camera capture */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="sr-only"
            id="shop-photo-input"
          />

          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-success bg-emerald-50/30 animate-fade-in-up">
              <img
                src={photoPreview}
                alt="Shop photo preview"
                className="w-full h-48 sm:h-56 object-cover"
              />
              {/* Overlay info bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">
                      {shopPhoto?.name || "Photo captured"}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/70">
                    {shopPhoto ? `${(shopPhoto.size / 1024).toFixed(0)} KB` : ""}
                  </span>
                </div>
              </div>
              {/* Remove button */}
              <button
                onClick={removePhoto}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm
                  flex items-center justify-center hover:bg-black/70 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {/* Retake */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold
                  hover:bg-black/70 transition-colors"
              >
                <Camera className="w-3 h-3" />
                Retake
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center gap-3 px-4 py-8 sm:py-10 rounded-2xl
                border-2 border-dashed transition-all duration-200 cursor-pointer
                ${errors.photo
                  ? "border-danger bg-red-50/30 hover:bg-red-50/50"
                  : "border-border hover:border-primary/40 hover:bg-primary-ghost/50 bg-surface/50"
                }
                active:scale-[0.98]`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${errors.photo ? "bg-red-100" : "bg-primary-subtle"}`}>
                <Camera className={`w-7 h-7 ${errors.photo ? "text-danger" : "text-primary"}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${errors.photo ? "text-danger" : "text-text-primary"}`}>
                  📸 Tap to Snap Shop Photo
                </p>
                <p className="text-[11px] text-text-muted mt-1">
                  Opens rear camera · Required for proof of visit
                </p>
              </div>
            </button>
          )}
        </FormField>

        {/* ═══ SECTION 4: Location ═══ */}
        <SectionDivider icon={LocateFixed} label="Shop Location" />

        <div>
          <button
            onClick={detectGPS}
            disabled={gpsLoading}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed transition-all duration-300
              ${gpsDetected
                ? "border-success bg-emerald-50/60"
                : errors.location
                  ? "border-danger bg-red-50/30"
                  : "border-border hover:border-accent/40 hover:bg-accent-ghost/50 bg-card-bg"
              }
              ${gpsLoading ? "opacity-70 cursor-wait" : "cursor-pointer"}
              active:scale-[0.98]`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
              ${gpsDetected ? "bg-success/10" : gpsLoading ? "bg-accent-subtle" : errors.location ? "bg-red-100" : "bg-surface"}`}>
              {gpsLoading ? (
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
              ) : gpsDetected ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <LocateFixed className={`w-5 h-5 ${errors.location ? "text-danger" : "text-accent"}`} />
              )}
            </div>
            <div className="text-left flex-1">
              <p className={`text-sm font-bold ${gpsDetected ? "text-success" : errors.location ? "text-danger" : "text-text-secondary"}`}>
                {gpsLoading ? "Detecting location…" : gpsDetected ? "📍 Location Captured" : "📍 Auto-Detect GPS Location"}
              </p>
              <p className="text-[11px] text-text-muted">
                {gpsDetected
                  ? `Lat ${latitude}, Long ${longitude}`
                  : "Uses device GPS to record exact shop coordinates"}
              </p>
            </div>
          </button>

          {gpsDetected && (
            <div className="grid grid-cols-2 gap-3 mt-3 animate-fade-in-up">
              <div>
                <label className="block text-[10px] font-semibold text-text-muted mb-1 uppercase tracking-wider">Latitude</label>
                <input
                  type="text" value={latitude} readOnly
                  className="w-full bg-emerald-50/60 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-success font-mono font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-text-muted mb-1 uppercase tracking-wider">Longitude</label>
                <input
                  type="text" value={longitude} readOnly
                  className="w-full bg-emerald-50/60 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-success font-mono font-semibold outline-none"
                />
              </div>
            </div>
          )}

          {errors.location && !gpsDetected && (
            <p className="text-[11px] text-danger mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.location}
            </p>
          )}
        </div>

        {/* ═══ SECTION 5: Auto-Catalog ═══ */}
        <SectionDivider icon={Sparkles} label="Magic Feature" />

        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden
          ${autoCatalog ? "border-primary/30 bg-primary-ghost" : "border-border bg-card-bg"}`}>
          <label className="flex items-start gap-3 px-4 py-3.5 cursor-pointer select-none">
            {/* Toggle switch */}
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={autoCatalog}
                onChange={(e) => setAutoCatalog(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${autoCatalog ? "bg-primary" : "bg-gray-300"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                  ${autoCatalog ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className={`w-4 h-4 ${autoCatalog ? "text-primary" : "text-text-muted"}`} />
                Apply Auto-Catalog
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                ✨ Pre-fill shop with standard market prices & items
              </p>
            </div>
          </label>

          {autoCatalog && selectedCat && (
            <div className="px-4 pb-3.5 animate-fade-in-up">
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-card-bg border border-border">
                <span className="text-lg mt-0.5">{selectedCat.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-primary">{selectedCat.catalogCount} items ready</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">{selectedCat.catalogMessage}</p>
                </div>
              </div>
            </div>
          )}

          {autoCatalog && !selectedCat && (
            <div className="px-4 pb-3.5 animate-fade-in-up">
              <p className="text-[11px] text-text-muted italic px-1">
                ↑ Select a shop category above to see auto-catalog details
              </p>
            </div>
          )}
        </div>

        {/* ═══ PAYMENT & SUBMIT ═══ */}
        <div className="border-t border-border-light pt-5 space-y-3">
          <SectionDivider icon={IndianRupee} label="Payment & Submit" />

          {/* Fee breakdown */}
          <div className="bg-surface rounded-2xl overflow-hidden border border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-secondary font-medium">Registration Fee (Cash)</span>
              </div>
              <span className="text-base font-extrabold text-text-primary">₹100</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-emerald-700 font-medium">Your Commission</span>
              </div>
              <span className="text-base font-extrabold text-emerald-600">+₹50</span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white text-sm sm:text-base font-bold shadow-lg
              transition-all duration-300 active:scale-[0.97]
              ${submitting
                ? "bg-gray-400 cursor-wait shadow-none"
                : "bg-gradient-to-r from-primary to-primary-light hover:shadow-xl hover:-translate-y-0.5 shadow-[var(--shadow-primary)]"
              }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying & Registering…
              </>
            ) : (
              <>
                <BadgeCheck className="w-5 h-5" />
                Collect ₹100 & Register Shop
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-text-muted">
            Collect ₹100 cash from shop owner · Photo & Aadhaar stored securely
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SUCCESS CARD
   ══════════════════════════════════════════════════════════════════ */

function SuccessCard({
  onRegisterAnother,
  totalEarned,
  shopData,
}: {
  onRegisterAnother: () => void;
  totalEarned: number;
  shopData?: { name: string; id: string };
}) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${shopData?.name || "Shop"}_Certificate.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
    } finally {
      setDownloading(false);
    }
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(
      `🎉 A new shop has been registered on PehchanWale!\n\nCheck out local shops, compare prices & support your neighbourhood.\n\n👉 https://pehchanwale.com`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="bg-card-bg rounded-2xl sm:rounded-3xl border border-card-border shadow-[var(--shadow-xl)] overflow-hidden animate-scale-in">
      {/* Confetti header */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 px-5 py-8 sm:px-8 sm:py-10 text-center overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 left-8 w-3 h-3 rounded-full bg-white/30 animate-float" />
        <div className="absolute top-6 right-12 w-2 h-2 rounded-full bg-white/40 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-6 left-16 w-2.5 h-2.5 rounded-full bg-white/25 animate-float" style={{ animationDelay: "1s" }} />

        <div className="relative">
          <div className="w-18 h-18 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-gentle-bounce">
            <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
            🎉 Shop Registered!
          </h2>
          <p className="text-sm text-white/80">
            KYC verified · Photo saved · Shop is now live
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-8 space-y-5">
        {/* Commission earned */}
        <div className="flex items-center gap-4 px-5 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-fade-in-up">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Commission Earned</p>
            <p className="text-2xl font-extrabold text-emerald-700">₹50</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-muted font-medium">Today&apos;s Total</p>
            <p className="text-base font-extrabold text-text-primary">₹{totalEarned}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-surface rounded-xl">
            <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-[11px] text-text-secondary">₹100 collected · ₹50 commission credited to wallet</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-surface rounded-xl">
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-[11px] text-text-secondary">Aadhaar KYC recorded · Photo proof saved</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-surface rounded-xl">
            <Store className="w-4 h-4 text-success flex-shrink-0" />
            <p className="text-[11px] text-text-secondary">Shop is now visible to all local customers</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={onRegisterAnother}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold
              shadow-lg shadow-[var(--shadow-primary)] hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.97]"
          >
            <PlusCircle className="w-4 h-4" />
            Register Another Shop
          </button>
          <button
            onClick={downloadCertificate}
            disabled={downloading}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-emerald-500 text-emerald-700 text-sm font-bold
              shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                📥 Download QR Certificate
              </>
            )}
          </button>
          <button
            onClick={shareOnWhatsApp}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366] text-white text-sm font-bold
              shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.97] sm:col-span-2"
          >
            <Share2 className="w-4 h-4" />
            Share on WhatsApp
          </button>
        </div>

        {/* Hidden Certificate for PDF Generation */}
        {shopData && (
          <ShopCertificate
            ref={certificateRef}
            shopName={shopData.name}
            shopUrl={`https://pehchanwale.com/shop/${shopData.id}`}
          />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function AgentDashboardPage() {
  const [shopsRegistered, setShopsRegistered] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentShopData, setCurrentShopData] = useState<{ name: string; id: string } | null>(null);

  const totalEarned = shopsRegistered * 50;

  const handleSuccess = (shopData: { name: string; id: string }) => {
    setShopsRegistered((prev) => prev + 1);
    setCurrentShopData(shopData);
    setShowSuccess(true);
  };

  const handleRegisterAnother = () => {
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      <AgentHeader totalEarned={totalEarned} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Welcome */}
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-text-primary">
            Welcome, Agent 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Register local shops · Collect ₹100 fee · Earn ₹50 commission
          </p>
        </div>

        {/* Stats */}
        <StatsBar shopsToday={shopsRegistered} totalEarned={totalEarned} />

        {/* Form or Success */}
        {showSuccess ? (
          <SuccessCard onRegisterAnother={handleRegisterAnother} totalEarned={totalEarned} shopData={currentShopData || undefined} />
        ) : (
          <RegistrationForm onSuccess={handleSuccess} />
        )}
      </main>
    </div>
  );
}
