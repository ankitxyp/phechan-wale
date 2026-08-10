"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Home,
  Box,
  Target,
  Bell,
  Mic,
  Search,
  ChevronRight,
  IndianRupee,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  MapPin,
  Send,
  Star,
  BadgeCheck,
  ShoppingBag,
  User,
  Settings,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

type TabId = "home" | "catalog" | "leads" | "orders";

interface CatalogItem {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  inStock: boolean;
  emoji: string;
}

interface CustomerLead {
  id: number;
  title: string;
  description: string;
  distance: string;
  timeAgo: string;
  emoji: string;
  budget: string;
  bids: number;
  customerName: string;
}

interface Order {
  id: number;
  customerName: string;
  items: string;
  bookingFee: number;
  totalAmount: number;
  status: "pending" | "ready" | "completed";
  timeAgo: string;
  phone: string;
}

/* ══════════════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════════════ */

const initialCatalog: CatalogItem[] = [
  { id: 1, name: "Ashirvaad Atta 10kg", category: "Flour", price: 410, unit: "pack", inStock: true, emoji: "🌾" },
  { id: 2, name: "Tata Salt 1kg", category: "Spices", price: 22, unit: "pack", inStock: true, emoji: "🧂" },
  { id: 3, name: "Fortune Oil 1L", category: "Oil", price: 155, unit: "bottle", inStock: true, emoji: "🫒" },
  { id: 4, name: "Surf Excel 2kg", category: "Cleaning", price: 340, unit: "pack", inStock: false, emoji: "🧴" },
  { id: 5, name: "Amul Butter 500g", category: "Dairy", price: 270, unit: "pack", inStock: true, emoji: "🧈" },
  { id: 6, name: "Red Label Tea 500g", category: "Beverages", price: 265, unit: "pack", inStock: true, emoji: "🍵" },
  { id: 7, name: "Maggi Noodles 12pk", category: "Instant", price: 144, unit: "pack", inStock: true, emoji: "🍜" },
  { id: 8, name: "Dettol Soap 4-Pack", category: "Personal", price: 195, unit: "pack", inStock: true, emoji: "🧼" },
  { id: 9, name: "Coconut Oil 1L", category: "Oil", price: 190, unit: "bottle", inStock: false, emoji: "🥥" },
  { id: 10, name: "Sugar 5kg", category: "Basics", price: 210, unit: "pack", inStock: true, emoji: "🍬" },
  { id: 11, name: "Haldi Powder 200g", category: "Spices", price: 45, unit: "pack", inStock: true, emoji: "🟡" },
  { id: 12, name: "Rice Basmati 5kg", category: "Grains", price: 380, unit: "pack", inStock: true, emoji: "🍚" },
];

const initialLeads: CustomerLead[] = [
  {
    id: 1,
    title: "Broken TV Display — 42 inch",
    description: "Samsung LED TV not turning on. Screen has a crack on the lower half. Need repair or replacement quote.",
    distance: "1.2 km",
    timeAgo: "5 min ago",
    emoji: "📺",
    budget: "₹1,000–₹3,000",
    bids: 2,
    customerName: "Amit K.",
  },
  {
    id: 2,
    title: "Ceiling Fan Not Spinning",
    description: "Fan makes humming noise but blades don't rotate. Tried different speeds, same result. Capacitor issue?",
    distance: "800m",
    timeAgo: "12 min ago",
    emoji: "🌀",
    budget: "₹100–₹500",
    bids: 4,
    customerName: "Priya S.",
  },
  {
    id: 3,
    title: "Water Pipe Leaking in Kitchen",
    description: "PVC pipe joint leaking under the kitchen sink. Water dripping constantly. Need urgent fix.",
    distance: "2.1 km",
    timeAgo: "25 min ago",
    emoji: "🚰",
    budget: "₹200–₹800",
    bids: 1,
    customerName: "Ravi M.",
  },
  {
    id: 4,
    title: "Wall Painting — 2 Rooms",
    description: "Need interior painting for 2 bedrooms. Approx 400 sqft total. Asian Paints preferred. Labour + material quote needed.",
    distance: "3 km",
    timeAgo: "1 hr ago",
    emoji: "🎨",
    budget: "₹5,000–₹10,000",
    bids: 3,
    customerName: "Sunita D.",
  },
];

const initialOrders: Order[] = [
  {
    id: 1,
    customerName: "Rahul Verma",
    items: "Ashirvaad Atta 10kg × 1, Amul Butter × 2",
    bookingFee: 10,
    totalAmount: 950,
    status: "pending",
    timeAgo: "10 min ago",
    phone: "+91 98765 43210",
  },
  {
    id: 2,
    customerName: "Neha Gupta",
    items: "Onion 2kg, Tomato 1kg, Potato 3kg",
    bookingFee: 10,
    totalAmount: 180,
    status: "pending",
    timeAgo: "25 min ago",
    phone: "+91 91234 56789",
  },
  {
    id: 3,
    customerName: "Deepak Singh",
    items: "Maggi 12pk × 2, Red Label Tea × 1",
    bookingFee: 10,
    totalAmount: 553,
    status: "ready",
    timeAgo: "45 min ago",
    phone: "+91 87654 32100",
  },
  {
    id: 4,
    customerName: "Pooja Kumari",
    items: "Sugar 5kg, Haldi 200g, Rice 5kg",
    bookingFee: 10,
    totalAmount: 635,
    status: "completed",
    timeAgo: "2 hrs ago",
    phone: "+91 77889 90011",
  },
];

/* ══════════════════════════════════════════════════════════════════
   VENDOR HEADER
   ══════════════════════════════════════════════════════════════════ */

function VendorHeader({
  isOnline,
  onToggle,
}: {
  isOnline: boolean;
  onToggle: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--header-border)]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Shop info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-sm font-black">प</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-text-primary truncate">
                Sharma General Store
              </h1>
              <div className="flex items-center gap-1">
                <BadgeCheck className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-text-muted font-medium">
                  Verified Partner
                </span>
              </div>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 flex-shrink-0
              ${isOnline
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-600"
              }`}
          >
            <div className="relative">
              <div className={`w-9 h-5 rounded-full transition-colors duration-300 ${isOnline ? "bg-emerald-500" : "bg-red-400"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300
                  ${isOnline ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </div>
            <span className="text-xs font-bold whitespace-nowrap">
              {isOnline ? "🟢 Online" : "🔴 Offline"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 1: HOME (Overview)
   ══════════════════════════════════════════════════════════════════ */

function HomeTab({ isOnline, pendingCount }: { isOnline: boolean; pendingCount: number }) {
  const stats = [
    {
      label: "Today's Earnings",
      value: "₹2,450",
      sub: "from 6 orders",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      label: "Pending Orders",
      value: String(pendingCount),
      sub: "customers waiting",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      label: "Completed Today",
      value: "4",
      sub: "all picked up",
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary-subtle",
      borderColor: "border-orange-100",
    },
    {
      label: "Shop Rating",
      value: "4.8",
      sub: "142 reviews",
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50",
      borderColor: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">
          Welcome back! 👋
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          {isOnline
            ? "You're accepting orders. Customers can find you!"
            : "You're offline. Go online to receive orders."}
        </p>
      </div>

      {/* Status banner */}
      {!isOnline && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-2xl border border-red-100 animate-scale-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">You are Offline</p>
            <p className="text-[11px] text-red-500">
              Toggle the switch above to start accepting orders
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`bg-card-bg rounded-2xl border ${s.borderColor} p-4 animate-scale-in`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-xl font-extrabold text-text-primary leading-none">
                {s.value}
              </p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                {s.label}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {[
            { label: "View Full Earnings Report", icon: TrendingUp, color: "text-emerald-600" },
            { label: "Edit Shop Profile", icon: Settings, color: "text-accent" },
            { label: "Share My Shop Link", icon: Send, color: "text-primary" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-card-bg rounded-2xl border border-card-border
                  hover:border-card-hover-border hover:shadow-sm transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-sm font-semibold text-text-primary">
                    {action.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 2: CATALOG (Inventory Manager)
   ══════════════════════════════════════════════════════════════════ */

function CatalogTab() {
  const [items, setItems] = useState<CatalogItem[]>(initialCatalog);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const updatePrice = (id: number, newPrice: string) => {
    const parsed = parseInt(newPrice) || 0;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: parsed } : item))
    );
  };

  const toggleStock = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  const inStockCount = items.filter((i) => i.inStock).length;

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">
          My Catalog 📦
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          {inStockCount} of {items.length} items in stock
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card-bg rounded-2xl border border-card-border px-4 py-2.5 shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
        <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items (atta, oil, soap...)"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm font-semibold text-text-secondary">
              No items found
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Try a different search term
            </p>
          </div>
        )}

        {filteredItems.map((item, i) => (
          <div
            key={item.id}
            className={`bg-card-bg rounded-2xl border overflow-hidden transition-all duration-200 animate-scale-in
              ${item.inStock ? "border-card-border" : "border-red-100 bg-red-50/20"}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Emoji */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                ${item.inStock ? "bg-surface" : "bg-red-50"}`}>
                {item.emoji}
              </div>

              {/* Item info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-snug ${item.inStock ? "text-text-primary" : "text-text-muted line-through"}`}>
                  {item.name}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5 uppercase font-semibold tracking-wider">
                  {item.category} · per {item.unit}
                </p>
              </div>

              {/* Price input */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <span className="text-xs font-bold text-text-muted">₹</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updatePrice(item.id, e.target.value)}
                  className={`w-16 text-right bg-input-bg border border-input-border rounded-lg px-2 py-1.5 text-sm font-extrabold outline-none
                    focus:border-primary/40 focus:shadow-sm transition-all
                    ${item.inStock ? "text-text-primary" : "text-text-muted"}`}
                />
              </div>

              {/* Stock toggle */}
              <button
                onClick={() => toggleStock(item.id)}
                className="flex-shrink-0"
                title={item.inStock ? "Mark Out of Stock" : "Mark In Stock"}
              >
                <div className={`w-11 h-6 rounded-full transition-colors duration-300 relative
                  ${item.inStock ? "bg-emerald-500" : "bg-red-400"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300
                    ${item.inStock ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 3: LOCAL LEADS (Bidding Engine)
   ══════════════════════════════════════════════════════════════════ */

function LeadsTab() {
  const [leads, setLeads] = useState<CustomerLead[]>(initialLeads);
  const [bidAmounts, setBidAmounts] = useState<Record<number, string>>({});
  const [sentBids, setSentBids] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('customer_requests')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const liveLeads: CustomerLead[] = data.map((d, i) => ({
            ...initialLeads[i % initialLeads.length], // Borrow mock data UI elements
            id: d.id,
            title: d.category || "Service Request",
            description: d.description,
            emoji: "🔔",
            timeAgo: "Just now", 
            customerName: "Pehchan User",
          }));
          setLeads(liveLeads);
        }
      } catch (err) {
        console.warn("Supabase fetch failed, using demo data");
      }
    };
    fetchLeads();
  }, []);

  const updateBid = (id: number, value: string) => {
    setBidAmounts((prev) => ({ ...prev, [id]: value.replace(/\D/g, "") }));
  };

  const sendBid = async (id: number) => {
    const amount = bidAmounts[id];
    if (!amount || parseInt(amount) <= 0) return;
    
    try {
      const { error } = await supabase.from('vendor_bids').insert([{
        request_id: id,
        vendor_id: 'vendor-123',
        bid_amount: parseInt(amount)
      }]);
      
      if (error) throw error;
      
      setSentBids((prev) => new Set(prev).add(id));
      alert("Deal Sent to Customer!");
    } catch (e) {
      console.warn("Supabase insert failed, using demo mode");
      setSentBids((prev) => new Set(prev).add(id));
      alert("Deal Sent to Customer! (Demo Mode)");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">
          Local Leads 🎯
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          Nearby customer requests — bid to win the job!
        </p>
      </div>

      {/* Leads feed */}
      <div className="space-y-3">
        {leads.map((lead, i) => {
          const isSent = sentBids.has(lead.id);
          return (
            <div
              key={lead.id}
              className={`bg-card-bg rounded-2xl border overflow-hidden transition-all duration-300 animate-scale-in
                ${isSent ? "border-success/40 bg-emerald-50/20" : "border-card-border"}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Lead header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-2xl flex-shrink-0">
                    {lead.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-text-primary leading-snug">
                      {lead.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-accent bg-accent-subtle px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {lead.distance}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {lead.timeAgo}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        · {lead.bids} bids
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">
                  {lead.description}
                </p>

                {/* Budget + Customer */}
                <div className="flex items-center justify-between mt-3 px-3 py-2 bg-surface rounded-xl">
                  <div>
                    <p className="text-[9px] text-text-muted font-semibold uppercase tracking-wider">
                      Customer Budget
                    </p>
                    <p className="text-sm font-extrabold text-text-primary">
                      {lead.budget}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-text-muted font-semibold uppercase tracking-wider">
                      By
                    </p>
                    <p className="text-xs font-bold text-text-secondary flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {lead.customerName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bid input area */}
              <div className="px-4 pb-4 pt-1">
                {isSent ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-scale-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700">
                        Deal sent: ₹{bidAmounts[lead.id]}
                      </p>
                      <p className="text-[10px] text-emerald-600">
                        Waiting for customer response
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Price input */}
                    <div className="flex-1 flex items-center bg-input-bg border-2 border-input-border rounded-xl overflow-hidden focus-within:border-primary/40 transition-all">
                      <span className="px-3 text-sm font-bold text-text-muted">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={bidAmounts[lead.id] || ""}
                        onChange={(e) => updateBid(lead.id, e.target.value)}
                        placeholder="Your price"
                        className="flex-1 bg-transparent py-3 pr-3 text-sm font-bold text-text-primary placeholder:text-text-muted outline-none"
                      />
                    </div>

                    {/* Voice button */}
                    <button
                      className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center
                        hover:bg-surface-raised hover:border-accent/40 transition-all active:scale-90"
                      title="Voice input"
                    >
                      <Mic className="w-5 h-5 text-accent" />
                    </button>

                    {/* Send bid */}
                    <button
                      onClick={() => sendBid(lead.id)}
                      disabled={!bidAmounts[lead.id]}
                      className={`h-12 px-5 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm
                        ${bidAmounts[lead.id]
                          ? "bg-gradient-to-r from-primary to-primary-light hover:shadow-md"
                          : "bg-gray-300 cursor-not-allowed"
                        }`}
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 4: ORDERS
   ══════════════════════════════════════════════════════════════════ */

function OrdersTab() {
  const [orders, setOrders] = useState(initialOrders);

  const markReady = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ready" as const } : o))
    );
  };

  const markCompleted = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "completed" as const } : o))
    );
  };

  const pending = orders.filter((o) => o.status === "pending");
  const ready = orders.filter((o) => o.status === "ready");
  const completed = orders.filter((o) => o.status === "completed");

  const statusConfig = {
    pending: { label: "⏳ Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
    ready: { label: "✅ Ready", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
    completed: { label: "🎉 Completed", color: "text-text-muted", bg: "bg-surface", border: "border-border" },
  };

  const renderOrder = (order: Order, i: number) => {
    const config = statusConfig[order.status];
    return (
      <div
        key={order.id}
        className={`bg-card-bg rounded-2xl border overflow-hidden animate-scale-in
          ${order.status === "completed" ? "border-border opacity-70" : "border-card-border"}`}
        style={{ animationDelay: `${i * 50}ms` }}
      >
        {/* Status ribbon */}
        <div className={`${config.bg} ${config.border} border-b px-4 py-2 flex items-center justify-between`}>
          <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
          <span className="text-[10px] text-text-muted">{order.timeAgo}</span>
        </div>

        <div className="px-4 py-3.5">
          {/* Customer */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-subtle flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{order.customerName}</p>
                <p className="text-[10px] text-text-muted">{order.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-extrabold text-text-primary">
                ₹{order.totalAmount}
              </p>
              <p className="text-[9px] text-success font-semibold">
                ₹{order.bookingFee} paid
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="px-3 py-2 bg-surface rounded-xl mb-3">
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-0.5">
              Items
            </p>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
              {order.items}
            </p>
          </div>

          {/* Actions */}
          {order.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => markReady(order.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light
                  text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <Package className="w-4 h-4" />
                Mark Ready
              </button>
            </div>
          )}

          {order.status === "ready" && (
            <div className="flex gap-2">
              <button
                onClick={() => markCompleted(order.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500
                  text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                Completed — Customer Picked Up
              </button>
            </div>
          )}

          {order.status === "completed" && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/60 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">
                Order completed · ₹{order.totalAmount - order.bookingFee} collected
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-extrabold text-text-primary">
          Orders 🔔
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          {pending.length} pending · {ready.length} ready for pickup
        </p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending ({pending.length})
          </h3>
          {pending.map((o, i) => renderOrder(o, i))}
        </div>
      )}

      {/* Ready */}
      {ready.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Ready for Pickup ({ready.length})
          </h3>
          {ready.map((o, i) => renderOrder(o, i))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed ({completed.length})
          </h3>
          {completed.map((o, i) => renderOrder(o, i))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   BOTTOM NAVIGATION
   ══════════════════════════════════════════════════════════════════ */

function BottomNav({
  activeTab,
  onTabChange,
  pendingOrders,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingOrders: number;
}) {
  const tabs: { id: TabId; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "catalog", label: "Catalog", icon: Box },
    { id: "leads", label: "Leads", icon: Target },
    { id: "orders", label: "Orders", icon: Bell, badge: pendingOrders > 0 ? pendingOrders : undefined },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="bg-[var(--header-bg)] backdrop-blur-2xl border-t border-border">
          <div className="flex items-center justify-around py-1.5 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200
                    ${isActive
                      ? "text-primary bg-primary-ghost"
                      : "text-text-muted hover:text-text-secondary active:scale-90"
                    }`}
                >
                  <div className="relative">
                    <Icon className={`w-5.5 h-5.5 ${isActive ? "stroke-[2.5]" : ""}`} />
                    {tab.badge && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center
                        bg-danger text-white text-[9px] font-bold rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [isOnline, setIsOnline] = useState(true);

  // Count pending orders for badge
  const pendingCount = initialOrders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Phone-like container */}
      <div className="max-w-md mx-auto bg-background min-h-screen shadow-xl relative">
        <VendorHeader isOnline={isOnline} onToggle={() => setIsOnline(!isOnline)} />

        {/* Tab content */}
        <main className="px-4 py-5 pb-24">
          {activeTab === "home" && <HomeTab isOnline={isOnline} pendingCount={pendingCount} />}
          {activeTab === "catalog" && <CatalogTab />}
          {activeTab === "leads" && <LeadsTab />}
          {activeTab === "orders" && <OrdersTab />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} pendingOrders={pendingCount} />
      </div>
    </div>
  );
}
