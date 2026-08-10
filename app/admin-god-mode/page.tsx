"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Banknote,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
  UserCheck,
  Image as ImageIcon,
  ArrowRightCircle,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   TYPES & MOCK DATA
   ══════════════════════════════════════════════════════════════════ */

type TabId = "dashboard" | "kyc" | "payouts" | "settings";

interface KycRequest {
  id: string;
  shopName: string;
  category: string;
  agentName: string;
  aadhaar: string;
  date: string;
}

interface AgentPayout {
  id: string;
  agentName: string;
  totalEarned: number;
  upiId: string;
  status: "pending" | "paid";
}

const INITIAL_KYC: KycRequest[] = [
  { id: "REQ-001", shopName: "Sharma General Store", category: "Grocery", agentName: "Amit Kumar", aadhaar: "4589 1234 9087", date: "Today, 10:42 AM" },
  { id: "REQ-002", shopName: "Raju Electronics", category: "Appliance Repair", agentName: "Neha Singh", aadhaar: "9812 7634 1120", date: "Today, 09:15 AM" },
  { id: "REQ-003", shopName: "Fresh Farms Patna", category: "Farmer", agentName: "Amit Kumar", aadhaar: "3321 9988 4455", date: "Yesterday, 04:30 PM" },
];

const INITIAL_PAYOUTS: AgentPayout[] = [
  { id: "AGT-101", agentName: "Amit Kumar", totalEarned: 3500, upiId: "amit.k@okicici", status: "pending" },
  { id: "AGT-102", agentName: "Neha Singh", totalEarned: 1250, upiId: "neha.s@okhdfc", status: "pending" },
  { id: "AGT-103", agentName: "Rahul Verma", totalEarned: 800, upiId: "rahul99@paytm", status: "pending" },
];

const ACTIVITY_FEED = [
  { id: 1, text: "Raju accepted a ₹350 TV Repair bid", time: "2 mins ago", type: "order" },
  { id: 2, text: "Agent Aman registered a new Grocery Store", time: "15 mins ago", type: "agent" },
  { id: 3, text: "Customer Priya completed an order worth ₹850", time: "1 hour ago", type: "order" },
  { id: 4, text: "New vendor 'Bihari Sweets' passed KYC auto-check", time: "2 hours ago", type: "system" },
];

/* ══════════════════════════════════════════════════════════════════
   LAYOUT COMPONENTS
   ══════════════════════════════════════════════════════════════════ */

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: any) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "kyc", label: "KYC Approvals", icon: ShieldCheck, badge: 3 },
    { id: "payouts", label: "Agent Payouts", icon: Banknote, badge: 2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mr-3">
            <span className="text-white text-sm font-black">प</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white leading-tight">Pehchan Wale</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors
                  ${isActive 
                    ? "bg-slate-800 text-white" 
                    : "hover:bg-slate-800/50 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-500"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                    ${isActive ? "bg-primary text-white" : "bg-slate-800 text-slate-400"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Super Admin</p>
              <p className="text-[10px] text-slate-400 truncate">admin@pehchanwale.in</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ setIsOpen }: { setIsOpen: (val: boolean) => void }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={() => setIsOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2 flex-1 max-w-md border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search any user, shop, or order ID..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent shadow-sm flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          AD
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 1: DASHBOARD
   ══════════════════════════════════════════════════════════════════ */

function DashboardTab() {
  const metrics = [
    { label: "Total Platform Revenue", value: "₹45,200", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Pehchan Wale", value: "1,204", icon: Store, color: "text-primary", bg: "bg-primary-subtle" },
    { label: "Live Orders & Bids", value: "34", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Commissions", value: "₹2,500", icon: Banknote, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Financial Overview</h2>
        <p className="text-sm text-gray-500">Live metrics across all operations</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
                  <p className="text-2xl font-black text-gray-900">{m.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Live Activity Feed
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {ACTIVITY_FEED.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.text}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 2: KYC APPROVALS
   ══════════════════════════════════════════════════════════════════ */

function KycTab() {
  const [requests, setRequests] = useState(INITIAL_KYC);

  const handleAction = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">KYC Approvals</h2>
        <p className="text-sm text-gray-500">Review agent-registered shops. Approval releases ₹50 commission.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Shop Name</th>
                <th className="px-6 py-4">Agent Name</th>
                <th className="px-6 py-4">Aadhaar</th>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No pending KYC requests. All caught up! 🎉
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{req.shopName}</p>
                      <p className="text-xs text-gray-500">{req.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-800">{req.agentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600 tracking-wider bg-gray-100 px-2 py-1 rounded">
                        {req.aadhaar}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                        <ImageIcon className="w-4 h-4" />
                        View Photo
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleAction(req.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 3: AGENT PAYOUTS
   ══════════════════════════════════════════════════════════════════ */

function PayoutsTab() {
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);

  const handlePay = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "paid" } : p))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Agent Payouts</h2>
        <p className="text-sm text-gray-500">Settle commissions for agents who crossed the minimum withdrawal limit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payouts.map((payout) => (
          <div key={payout.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">{payout.agentName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">ID: {payout.id}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Earned</p>
              <p className="text-2xl font-black text-gray-900">₹{payout.totalEarned}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 mb-1">UPI ID</p>
              <p className="text-sm font-medium text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded inline-block">{payout.upiId}</p>
            </div>

            {payout.status === "pending" ? (
              <button
                onClick={() => handlePay(payout.id)}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
              >
                <ArrowRightCircle className="w-4 h-4" />
                Pay via Razorpay
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Paid & Settled
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function AdminGodModePage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar setIsOpen={setIsSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "kyc" && <KycTab />}
            {activeTab === "payouts" && <PayoutsTab />}
            {activeTab === "settings" && (
              <div className="text-center py-20 text-gray-500 animate-fade-in-up">
                Settings panel under construction.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
