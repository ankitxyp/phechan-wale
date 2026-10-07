"use client";

import { useState, useCallback } from "react";
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Megaphone,
  Wallet,
  MapPin,
  ChevronDown,
  Upload,
  Clock,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Users,
  BarChart3,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  Sparkles,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ══════════════════════════════════════════════════════════════════ */

type TabId = "overview" | "register-shop" | "add-product" | "create-ad";

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, description: "Dashboard summary" },
  { id: "register-shop", label: "Register Shop", icon: Store, description: "Agent tool" },
  { id: "add-product", label: "Add Product", icon: PlusCircle, description: "Vendor tool" },
  { id: "create-ad", label: "Create Ad", icon: Megaphone, description: "Flash sale" },
];

const SHOP_CATEGORIES = [
  "Grocery / Kirana",
  "Home Services",
  "Electronics",
  "Salon & Spa",
  "Plumbing",
  "Fashion & Clothing",
  "Pharmacy / Medical",
  "Delivery / Courier",
  "Food & Restaurant",
  "Other",
];

const AD_DURATIONS = [
  { label: "1 Hour", value: "1h" },
  { label: "2 Hours", value: "2h" },
  { label: "6 Hours", value: "6h" },
  { label: "12 Hours", value: "12h" },
  { label: "24 Hours", value: "24h" },
  { label: "48 Hours", value: "48h" },
];

/* ══════════════════════════════════════════════════════════════════
   REUSABLE UI COMPONENTS
   ══════════════════════════════════════════════════════════════════ */

function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

function FormInput({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  prefix,
  required = true,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900
            placeholder:text-gray-400 outline-none transition-all duration-200
            focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100
            hover:border-gray-300
            ${prefix ? "pl-8" : ""}`}
        />
      </div>
    </div>
  );
}

function FormSelect({
  label,
  id,
  options,
  value,
  onChange,
  placeholder = "Select...",
}: {
  label: string;
  id: string;
  options: { label: string; value: string }[] | string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900
            outline-none transition-all duration-200 cursor-pointer
            focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100
            hover:border-gray-300"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function SubmitButton({
  children,
  isLoading = false,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  variant?: "primary" | "success" | "purple";
}) {
  const colorMap = {
    primary: "from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-teal-200",
    success: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-200",
    purple: "from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-violet-200",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white
        bg-gradient-to-r ${colorMap[variant]} shadow-lg
        transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
        hover:shadow-xl hover:-translate-y-0.5`}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed top-6 right-6 z-[60] animate-slide-in-toast">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-100/50 px-5 py-4 max-w-sm">
        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 text-lg font-light leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 1: OVERVIEW
   ══════════════════════════════════════════════════════════════════ */

function OverviewTab() {
  const stats = [
    {
      label: "Wallet Balance",
      value: "₹2,500",
      sub: "Commission earned",
      icon: Wallet,
      trend: "+₹350 this week",
      trendUp: true,
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Shops Registered",
      value: "15",
      sub: "Across 4 categories",
      icon: Store,
      trend: "+3 this month",
      trendUp: true,
      gradient: "from-blue-500 to-indigo-500",
      bgLight: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Products Listed",
      value: "47",
      sub: "Active listings",
      icon: ShoppingBag,
      trend: "+12 this week",
      trendUp: true,
      gradient: "from-violet-500 to-purple-500",
      bgLight: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      label: "Active Ads",
      value: "5",
      sub: "Running promotions",
      icon: Megaphone,
      trend: "2 expiring soon",
      trendUp: false,
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const recentActivity = [
    { text: "Shop 'Sharma General Store' verified", time: "2 hours ago", icon: BadgeCheck, color: "text-emerald-500" },
    { text: "₹50 commission credited", time: "2 hours ago", icon: IndianRupee, color: "text-teal-500" },
    { text: "New product 'Organic Toor Dal' listed", time: "5 hours ago", icon: PlusCircle, color: "text-blue-500" },
    { text: "Flash ad 'Rice at ₹2/kg' went live", time: "1 day ago", icon: Megaphone, color: "text-violet-500" },
    { text: "Shop 'Krishna Kirana' registered", time: "2 days ago", icon: Store, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <DashboardCard className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 px-6 py-6 lg:px-8 lg:py-8">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider">Agent Dashboard</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-white mb-1">
              Welcome back, Rajesh! 👋
            </h1>
            <p className="text-sm text-teal-100">
              You&apos;ve earned <span className="font-bold text-white">₹2,500</span> in commissions. Keep growing your network!
            </p>
          </div>
        </div>
      </DashboardCard>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <DashboardCard key={stat.label} className="p-5 lg:p-6">
              <div
                className="flex items-start justify-between mb-3"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
                    ${stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                >
                  {stat.trendUp && <TrendingUp className="w-3 h-3" />}
                  {!stat.trendUp && <Clock className="w-3 h-3" />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-none mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{stat.label}</p>
              <p className="text-[11px] text-gray-400">{stat.sub}</p>
            </DashboardCard>
          );
        })}
      </div>

      {/* Quick actions + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Quick actions */}
        <DashboardCard className="lg:col-span-2 p-5 lg:p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Register a new shop", sub: "Earn ₹50 per shop", icon: Store, color: "bg-teal-50 text-teal-600" },
              { label: "List a product", sub: "Help vendors go digital", icon: PlusCircle, color: "bg-blue-50 text-blue-600" },
              { label: "Create flash ad", sub: "Boost local sales", icon: Megaphone, color: "bg-violet-50 text-violet-600" },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-100
                    hover:bg-white hover:border-gray-200 hover:shadow-sm
                    transition-all duration-200 group text-left"
                >
                  <div className={`w-9 h-9 rounded-lg ${action.color.split(" ")[0]} flex items-center justify-center flex-shrink-0`}>
                    <ActionIcon className={`w-4 h-4 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                    <p className="text-[11px] text-gray-400">{action.sub}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </DashboardCard>

        {/* Recent Activity */}
        <DashboardCard className="lg:col-span-3 p-5 lg:p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Recent Activity
          </h3>
          <div className="space-y-1">
            {recentActivity.map((activity, i) => {
              const ActivityIcon = activity.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <ActivityIcon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{activity.text}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 2: REGISTER SHOP (Agent Tool)
   ══════════════════════════════════════════════════════════════════ */

function RegisterShopTab({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "done">("idle");
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetGPS = useCallback(() => {
    setGpsStatus("loading");
    // Simulate GPS fetch
    setTimeout(() => {
      setCoords({ lat: "25.6115", lng: "85.1376" });
      setGpsStatus("done");
    }, 1500);
  }, []);

  const handleSubmit = () => {
    if (!shopName || !category || !address || gpsStatus !== "done") return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("🏪 Shop Registered:", { shopName, category, address, coords });
      setIsSubmitting(false);
      setShopName("");
      setCategory("");
      setAddress("");
      setGpsStatus("idle");
      setCoords({ lat: "", lng: "" });
      onSuccess(`"${shopName}" registered! ₹50 credited to your wallet.`);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <DashboardCard>
        {/* Header */}
        <div className="px-6 py-5 lg:px-8 lg:py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Store className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-gray-900">Register a New Shop</h2>
              <p className="text-xs text-gray-500">Earn ₹50 for every verified shop registration</p>
            </div>
          </div>
        </div>

        {/* Commission banner */}
        <div className="mx-6 mt-5 lg:mx-8 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-700">
              You earn <span className="text-emerald-900 font-extrabold">₹50</span> when this shop gets verified by the admin
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 lg:px-8 lg:py-6 space-y-5">
          <FormInput
            label="Shop Name"
            id="shop-name"
            placeholder="e.g. Sharma General Store"
            value={shopName}
            onChange={setShopName}
          />

          <FormSelect
            label="Category"
            id="shop-category"
            options={SHOP_CATEGORIES}
            value={category}
            onChange={setCategory}
            placeholder="Select shop category..."
          />

          <FormInput
            label="Full Address"
            id="shop-address"
            placeholder="e.g. Shop No. 12, Boring Road, Patna"
            value={address}
            onChange={setAddress}
          />

          {/* GPS Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              GPS Location
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={gpsStatus === "loading"}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all duration-200
                  ${gpsStatus === "done"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-white hover:border-teal-300 hover:text-teal-600"
                  }
                  disabled:opacity-60 active:scale-[0.98]`}
              >
                {gpsStatus === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : gpsStatus === "done" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {gpsStatus === "loading"
                  ? "Fetching location..."
                  : gpsStatus === "done"
                  ? "Location captured"
                  : "📍 Get GPS Location"}
              </button>

              {gpsStatus === "done" && (
                <span className="text-xs text-gray-400 font-mono">
                  {coords.lat}, {coords.lng}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 pb-6 lg:px-8 lg:pb-8">
          <SubmitButton
            isLoading={isSubmitting}
            onClick={handleSubmit}
            variant="success"
          >
            <Store className="w-4 h-4" />
            Register Shop & Earn ₹50
          </SubmitButton>
        </div>
      </DashboardCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 3: ADD PRODUCT (Vendor Tool)
   ══════════════════════════════════════════════════════════════════ */

function AddProductTab({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = () => {
    // Simulate file picker
    setFileName("product-image.jpg");
  };

  const handleSubmit = () => {
    if (!itemName || !price) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("📦 Product Added:", { itemName, price, description, fileName });
      setIsSubmitting(false);
      setItemName("");
      setPrice("");
      setDescription("");
      setFileName("");
      onSuccess(`"${itemName}" has been listed at ₹${price}`);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <DashboardCard>
        {/* Header */}
        <div className="px-6 py-5 lg:px-8 lg:py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-gray-900">Add a Product or Service</h2>
              <p className="text-xs text-gray-500">List an item for a shop you manage</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 lg:px-8 lg:py-6 space-y-5">
          <FormInput
            label="Item Name"
            id="item-name"
            placeholder="e.g. Organic Toor Dal (1kg)"
            value={itemName}
            onChange={setItemName}
          />

          <FormInput
            label="Price"
            id="item-price"
            type="number"
            placeholder="e.g. 120"
            value={price}
            onChange={setPrice}
            prefix="₹"
          />

          <div>
            <label htmlFor="item-desc" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="item-desc"
              rows={3}
              placeholder="Brief description of the product or service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900
                placeholder:text-gray-400 outline-none transition-all duration-200 resize-none
                focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100
                hover:border-gray-300"
            />
          </div>

          {/* Image upload placeholder */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Image <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <button
              type="button"
              onClick={handleFileSelect}
              className="w-full flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl
                border-2 border-dashed border-gray-200 bg-gray-50/30
                hover:border-teal-300 hover:bg-teal-50/30
                transition-all duration-200 group cursor-pointer"
            >
              {fileName ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{fileName}</p>
                  <p className="text-[11px] text-gray-400">Click to change</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 group-hover:text-teal-600 transition-colors">
                    Upload product image
                  </p>
                  <p className="text-[11px] text-gray-400">PNG, JPG up to 5MB</p>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 pb-6 lg:px-8 lg:pb-8">
          <SubmitButton isLoading={isSubmitting} onClick={handleSubmit} variant="primary">
            <PlusCircle className="w-4 h-4" />
            List Product
          </SubmitButton>
        </div>
      </DashboardCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 4: CREATE AD (Flash Sale)
   ══════════════════════════════════════════════════════════════════ */

function CreateAdTab({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [adTitle, setAdTitle] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!adTitle || !discountPrice || !duration) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("📢 Ad Created:", { adTitle, discountPrice, originalPrice, duration, adDescription });
      setIsSubmitting(false);
      setAdTitle("");
      setDiscountPrice("");
      setOriginalPrice("");
      setDuration("");
      setAdDescription("");
      onSuccess(`Flash ad "${adTitle}" is now live!`);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <DashboardCard>
        {/* Header */}
        <div className="px-6 py-5 lg:px-8 lg:py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-bold text-gray-900">Create Flash Sale Ad</h2>
              <p className="text-xs text-gray-500">Promote a time-limited deal to nearby customers</p>
            </div>
          </div>
        </div>

        {/* Preview tip */}
        <div className="mx-6 mt-5 lg:mx-8 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <p className="text-xs font-semibold text-violet-700">
              Your ad will appear in the <span className="text-violet-900 font-extrabold">&quot;Offers Near You&quot;</span> section with a live countdown timer
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 lg:px-8 lg:py-6 space-y-5">
          <FormInput
            label="Offer Title"
            id="ad-title"
            placeholder="e.g. Rice at ₹2/kg — Flash Sale!"
            value={adTitle}
            onChange={setAdTitle}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Discounted Price"
              id="ad-discount-price"
              type="number"
              placeholder="e.g. 2"
              value={discountPrice}
              onChange={setDiscountPrice}
              prefix="₹"
            />
            <FormInput
              label="Original Price"
              id="ad-original-price"
              type="number"
              placeholder="e.g. 76"
              value={originalPrice}
              onChange={setOriginalPrice}
              prefix="₹"
              required={false}
            />
          </div>

          <FormSelect
            label="Offer Duration"
            id="ad-duration"
            options={AD_DURATIONS}
            value={duration}
            onChange={setDuration}
            placeholder="How long should this deal run?"
          />

          <div>
            <label htmlFor="ad-desc" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="ad-desc"
              rows={2}
              placeholder="Briefly describe the offer..."
              value={adDescription}
              onChange={(e) => setAdDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900
                placeholder:text-gray-400 outline-none transition-all duration-200 resize-none
                focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100
                hover:border-gray-300"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 pb-6 lg:px-8 lg:pb-8">
          <SubmitButton isLoading={isSubmitting} onClick={handleSubmit} variant="purple">
            <Megaphone className="w-4 h-4" />
            Publish Flash Ad
          </SubmitButton>
        </div>
      </DashboardCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DESKTOP SIDEBAR
   ══════════════════════════════════════════════════════════════════ */

function DesktopSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-gray-100 min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none">
            <span className="text-base font-extrabold text-gray-900">Phechan</span>
            <span className="text-base font-extrabold text-teal-600">Wale</span>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Partner Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                ${isActive
                  ? "bg-teal-50 text-teal-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                  ${isActive ? "bg-teal-100" : "bg-gray-50"}`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? "text-teal-600" : "text-gray-400"}`} />
              </div>
              <div>
                <p className={`text-sm leading-tight ${isActive ? "font-bold" : "font-semibold"}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">{item.description}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">Rajesh Kumar</p>
            <p className="text-[11px] text-gray-400">Field Agent</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MOBILE TOP BAR & BOTTOM NAV
   ══════════════════════════════════════════════════════════════════ */

function MobileTopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none">
            <span className="text-sm font-extrabold text-gray-900">Phechan</span>
            <span className="text-sm font-extrabold text-teal-600">Wale</span>
            <p className="text-[9px] text-gray-400 font-medium">Partner Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[60px]
                ${isActive
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-400 hover:text-gray-600 active:scale-95"
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[10px] leading-none ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD PAGE — Assembly
   ══════════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const tabTitles: Record<TabId, string> = {
    overview: "Dashboard Overview",
    "register-shop": "Register a Shop",
    "add-product": "Add Product / Service",
    "create-ad": "Create Flash Ad",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar />

        {/* Desktop page header */}
        <header className="hidden lg:block bg-white border-b border-gray-100 px-8 py-5">
          <h1 className="text-lg font-bold text-gray-900">{tabTitles[activeTab]}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeTab === "overview" && "Your business at a glance"}
            {activeTab === "register-shop" && "Register a local shop and earn ₹50 commission"}
            {activeTab === "add-product" && "List products or services for your shops"}
            {activeTab === "create-ad" && "Create time-limited promotional offers"}
          </p>
        </header>

        {/* Content area */}
        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-6 pb-24 lg:pb-6 overflow-y-auto">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "register-shop" && <RegisterShopTab onSuccess={showToast} />}
          {activeTab === "add-product" && <AddProductTab onSuccess={showToast} />}
          {activeTab === "create-ad" && <CreateAdTab onSuccess={showToast} />}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Toast */}
      {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}

      {/* Toast animation */}
      <style jsx>{`
        @keyframes slide-in-toast {
          from {
            opacity: 0;
            transform: translateX(24px) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        .animate-slide-in-toast {
          animation: slide-in-toast 0.35s ease-out;
        }
      `}</style>
    </div>
  );
}
