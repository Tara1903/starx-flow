import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, TrendingUp, Activity, Search, Filter,
  ChevronDown, X, Eye, Trash2,
  Shield, Clock, Zap, Star,
  ArrowUpRight, BarChart3, UserCheck, UserX,
  AlertTriangle, Mail, Calendar,
  RefreshCw, ChevronUp, Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAdminStore, type Client } from "../store/adminStore";
import { useAuthStore } from "../store/authStore";
import { GlassPanel } from "../components/ui/GlassPanel";

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Active:  { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500" },
  Trial:   { bg: "bg-blue-500/10 border-blue-500/20",       text: "text-blue-400",    dot: "bg-blue-500" },
  Inactive:{ bg: "bg-zinc-500/10 border-zinc-500/20",       text: "text-zinc-400",    dot: "bg-zinc-500" },
  Churned: { bg: "bg-red-500/10 border-red-500/20",         text: "text-red-400",     dot: "bg-red-500" },
};

const PLAN_STYLES: Record<string, string> = {
  'Free Trial':   "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  'Starter':      "text-blue-300 bg-blue-500/10 border-blue-500/20",
  'Professional': "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  'Enterprise':   "text-amber-300 bg-amber-500/10 border-amber-500/20",
};

type SortKey = 'businessName' | 'signupDate' | 'totalExecutions' | 'totalWorkflows' | 'status';
type FilterStatus = 'All' | string;
type FilterPlan = 'All' | string;

/* Removed AdminLoginGate */

/* ──────────────────────────────────────────────
   KPI CARD
   ────────────────────────────────────────────── */

function AdminKPI({ icon, label, value, sub, trend, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; trend?: string; color?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <GlassPanel tier="panel" tilt className="rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <span className={cn("opacity-60", color || "text-zinc-400")}>{icon}</span>
        {trend && (
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>}
      </GlassPanel>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   CLIENT DETAIL MODAL
   ────────────────────────────────────────────── */

function ClientDetailModal({ client, onClose, onStatusChange, onPlanChange, onDelete }: {
  client: Client;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onPlanChange: (plan: string) => void;
  onDelete: () => void;
}) {
  const s = STATUS_STYLES[client.status] || STATUS_STYLES.Trial;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg"
      >
        <GlassPanel
          tier="panel"
          className="w-full rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {client.businessName.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{client.businessName}</h3>
              <p className="text-xs text-zinc-500">{client.ownerName} · {client.businessType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto console-scroll">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-400">{client.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-400">Joined {client.signupDate}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-400">Last active: {client.lastActive}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className={cn("w-2 h-2 rounded-full", s.dot)} />
                <span className={s.text}>{client.status}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-400">Role: {client.role}</span>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{client.totalWorkflows}</p>
              <p className="text-[10px] text-zinc-500">Workflows</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-white">{client.totalExecutions.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-500">Executions</p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Admin Controls</h4>
            <div className="flex flex-wrap gap-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Status</label>
                <select
                  value={client.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="bg-[#111] border border-white/10 text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Trial">Trial</option>
                  <option value="Churned">Churned</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Plan</label>
                <select
                  value={client.plan}
                  onChange={(e) => onPlanChange(e.target.value)}
                  className="bg-[#111] border border-white/10 text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                >
                  <option value="Free Trial">Free Trial</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Client
            </button>
          </div>
        </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN ADMIN DASHBOARD
   ────────────────────────────────────────────── */

export function AdminDashboard() {
  const navigate = useNavigate();
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const isLoading = useAdminStore((s) => s.isLoading);
  const clients = useAdminStore((s) => s.clients);
  const loginAdmin = useAdminStore((s) => s.loginAdmin);
  const logoutAdmin = useAdminStore((s) => s.logoutAdmin);
  const fetchClients = useAdminStore((s) => s.fetchClients);
  const updateClientStatus = useAdminStore((s) => s.updateClientStatus);
  const updateClientPlan = useAdminStore((s) => s.updateClientPlan);
  const deleteClient = useAdminStore((s) => s.deleteClient);


  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("All");
  const [sortKey, setSortKey] = useState<SortKey>("signupDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      setIsChecking(true);
      if (!isAdmin) {
        const isAuth = await loginAdmin();
        if (!isAuth) {
          navigate('/admin/login');
          return;
        }
      }
      setIsChecking(false);
    };
    checkAdmin();
  }, [isAdmin, loginAdmin, navigate]);

  // Filter & Sort
  const filtered = useMemo(() => {
    let result = [...clients];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.businessName.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.businessType.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== "All") {
      result = result.filter((c) => c.status === filterStatus);
    }

    if (filterPlan !== "All") {
      result = result.filter((c) => c.plan === filterPlan);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'businessName': cmp = a.businessName.localeCompare(b.businessName); break;
        case 'signupDate': cmp = a.signupDate.localeCompare(b.signupDate); break;
        case 'totalExecutions': cmp = a.totalExecutions - b.totalExecutions; break;
        case 'totalWorkflows': cmp = a.totalWorkflows - b.totalWorkflows; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [clients, search, filterStatus, filterPlan, sortKey, sortAsc]);

  // If checking or loading, show spinner
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // If not admin, return null while redirecting
  if (!isAdmin) {
    return null;
  }

  // Computed KPIs
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const trialClients = clients.filter((c) => c.status === 'Trial').length;
  const churnedClients = clients.filter((c) => c.status === 'Churned').length;
  const totalWorkflows = clients.reduce((a, c) => a + c.totalWorkflows, 0);
  const totalExecutions = clients.reduce((a, c) => a + c.totalExecutions, 0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-emerald-400" /> : <ChevronDown className="w-3 h-3 text-emerald-400" />;
  };

  return (
    <section className="min-h-screen pt-24 pb-20 bg-black dash-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-amber-400 tracking-widest uppercase mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Admin Panel
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Client <span className="text-gradient-green">Management</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Monitor all registered businesses and usage metrics.</p>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <button
                onClick={() => fetchClients()}
                className="text-xs font-medium text-zinc-400 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                onClick={logoutAdmin}
                className="text-xs font-medium text-zinc-400 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-lg transition-colors"
              >
                Logout Admin
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-zinc-500">Loading clients from database…</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <AdminKPI icon={<Users className="w-5 h-5" />} label="Total Clients" value={totalClients.toString()} sub={`${activeClients} active · ${trialClients} trials`} color="text-emerald-400" />
              <AdminKPI icon={<Zap className="w-5 h-5" />} label="Total Workflows" value={totalWorkflows.toLocaleString()} color="text-blue-400" />
              <AdminKPI icon={<Activity className="w-5 h-5" />} label="Total Executions" value={totalExecutions.toLocaleString()} color="text-amber-400" />
              <AdminKPI icon={<UserX className="w-5 h-5" />} label="Churn" value={churnedClients.toString()} sub={`${totalClients > 0 ? ((churnedClients / totalClients) * 100).toFixed(1) : 0}% churn rate`} color="text-red-400" />
            </div>

            {/* Search & Filters */}
            <GlassPanel tier="panel" className="rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, owner, email, or type…"
                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/30 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-lg border transition-all",
                    showFilters
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Filter className="w-3.5 h-3.5" /> Filters
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex flex-wrap gap-3 pt-3 mt-3 border-t border-white/5">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Status</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {["All", "Active", "Trial", "Inactive", "Churned"].map((s) => (
                            <button key={s} onClick={() => setFilterStatus(s)} className={cn("text-[11px] font-medium px-3 py-1.5 rounded-md border transition-all", filterStatus === s ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300")}>{s}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Plan</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {["All", "Free Trial", "Starter", "Professional", "Enterprise"].map((p) => (
                            <button key={p} onClick={() => setFilterPlan(p)} className={cn("text-[11px] font-medium px-3 py-1.5 rounded-md border transition-all", filterPlan === p ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300")}>{p}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs text-zinc-500">
                Showing <span className="text-white font-medium">{filtered.length}</span> of {clients.length} clients
              </p>
            </div>

            {/* Client Table */}
            <GlassPanel tier="panel" className="rounded-xl overflow-hidden">
              <div className="hidden lg:grid grid-cols-10 gap-4 px-5 py-3.5 border-b border-white/5 bg-white/[0.01] text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <button onClick={() => handleSort('businessName')} className="col-span-3 flex items-center gap-1 hover:text-zinc-200 transition-colors text-left">Business <SortIcon col="businessName" /></button>
                <div className="col-span-2">Contact</div>
                <button onClick={() => handleSort('status')} className="col-span-1 flex items-center gap-1 hover:text-zinc-200 transition-colors text-left">Status <SortIcon col="status" /></button>
                <div className="col-span-1">Plan</div>
                <button onClick={() => handleSort('totalWorkflows')} className="col-span-1 flex items-center gap-1 hover:text-zinc-200 transition-colors text-left">Flows <SortIcon col="totalWorkflows" /></button>
                <button onClick={() => handleSort('signupDate')} className="col-span-1 flex items-center gap-1 hover:text-zinc-200 transition-colors text-left">Joined <SortIcon col="signupDate" /></button>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {filtered.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">{clients.length === 0 ? "No clients registered yet." : "No clients match your search."}</p>
                  </div>
                ) : (
                  filtered.map((client, i) => {
                    const st = STATUS_STYLES[client.status] || STATUS_STYLES.Trial;
                    return (
                      <motion.div
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedClient(client)}
                        className="grid grid-cols-1 lg:grid-cols-10 gap-2 lg:gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                      >
                        <div className="lg:col-span-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-white/10 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                            {client.businessName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-emerald-300 transition-colors">{client.businessName}</p>
                            <p className="text-[11px] text-zinc-500">{client.businessType}</p>
                          </div>
                        </div>
                        <div className="lg:col-span-2 flex flex-col justify-center min-w-0">
                          <p className="text-xs text-zinc-300 truncate">{client.ownerName}</p>
                          <p className="text-[11px] text-zinc-500 truncate">{client.email}</p>
                        </div>
                        <div className="lg:col-span-1 flex items-center">
                          <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border", st.bg, st.text)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />{client.status}
                          </span>
                        </div>
                        <div className="lg:col-span-1 flex items-center">
                          <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full border", PLAN_STYLES[client.plan] || PLAN_STYLES['Free Trial'])}>{client.plan}</span>
                        </div>
                        <div className="lg:col-span-1 flex items-center">
                          <span className="text-sm font-medium text-white">{client.totalWorkflows}</span>
                        </div>
                        <div className="lg:col-span-1 flex items-center">
                          <p className="text-xs text-zinc-300">{client.signupDate}</p>
                        </div>
                        <div className="lg:col-span-1 flex items-center justify-end">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </GlassPanel>

            {/* Plan & Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <GlassPanel tier="panel" tilt className="rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-400" /> Plan Distribution
                </h3>
                <div className="space-y-3">
                  {["Enterprise", "Professional", "Starter", "Free Trial"].map((plan) => {
                    const count = clients.filter((c) => c.plan === plan).length;
                    const pct = totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;
                    return (
                      <div key={plan}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", PLAN_STYLES[plan] || PLAN_STYLES['Free Trial'])}>{plan}</span>
                          <span className="text-xs text-zinc-400">{count} clients · {pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>

              <GlassPanel tier="panel" tilt className="rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-zinc-400" /> Status Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Active", "Trial", "Inactive", "Churned"].map((status) => {
                    const count = clients.filter((c) => c.status === status).length;
                    const st = STATUS_STYLES[status] || STATUS_STYLES.Trial;
                    return (
                      <div key={status} className={cn("rounded-xl p-4 border", st.bg)}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn("w-2.5 h-2.5 rounded-full", st.dot)} />
                          <span className={cn("text-xs font-medium", st.text)}>{status}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{count}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{totalClients > 0 ? ((count / totalClients) * 100).toFixed(0) : 0}% of total</p>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>
          </>
        )}
      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            onStatusChange={(status) => {
              updateClientStatus(selectedClient.id, status);
              setSelectedClient({ ...selectedClient, status });
            }}
            onPlanChange={(plan) => {
              updateClientPlan(selectedClient.id, plan);
              setSelectedClient({ ...selectedClient, plan });
            }}
            onDelete={() => {
              deleteClient(selectedClient.id);
              setSelectedClient(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
