import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Mail, Lock, ArrowRight, Loader2, AlertTriangle, Key, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAdminStore } from "../store/adminStore";
import { useShield } from "../lib/shield";

export function AdminLogin() {
  const navigate = useNavigate();
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loginAdmin = useAdminStore((s) => s.loginAdmin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shield = useShield();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState(0);
  const [honeypot, setHoneypot] = useState("");

  // If already logged in as admin, show a state to proceed to dashboard
  if (isLoggedIn && user?.email === 'admin@starxflow.com') {
    return (
      <section className="min-h-screen flex items-center justify-center bg-black p-4 dash-mesh">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <div className="glass-panel rounded-2xl p-8 text-center border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-mono">Access Authorized</h2>
            <p className="text-sm text-zinc-400 mb-6">You are logged in as {user?.email}</p>
            <button
              onClick={async () => {
                setLoading(true);
                const isAuth = await loginAdmin();
                setLoading(false);
                if (isAuth) {
                  navigate("/admin");
                } else {
                  setError("Role verification failed.");
                }
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Go to Admin Dashboard
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const score = shield.getScore();
    if (score < 20) {
      setError("Access denied.");
      return;
    }

    const now = Date.now();
    if (now < lockoutEnd) {
      const remaining = Math.ceil((lockoutEnd - now) / 1000);
      setError(`Too many attempts. Try again in ${remaining}s.`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { error: signInError } = await signInWithPassword(email.trim().toLowerCase(), password);
    
    if (signInError) {
      setLoading(false);
      setError(signInError);
      setFailedAttempts(prev => {
        const next = prev + 1;
        if (next >= 5) {
          setLockoutEnd(Date.now() + 5 * 60 * 1000); // 5 min
        } else {
          setLockoutEnd(Date.now() + Math.pow(2, next) * 1000); // 2s, 4s, 8s, 16s
        }
        return next;
      });
    } else {
      // Verify admin role and login via adminStore
      const isAuth = await loginAdmin();
      setLoading(false);
      if (isAuth) {
        setFailedAttempts(0);
        navigate("/admin");
      } else {
        setError("Admin privileges verification failed.");
      }
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-black p-4 dash-mesh relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="glass-panel rounded-2xl p-8 border-amber-500/10 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-mono">Admin Portal</h1>
            <p className="text-xs text-zinc-500 mt-1">Single-account command access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="admin@starxflow.com"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-700"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-10 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs flex items-start gap-2 bg-red-500/10 p-2.5 rounded border border-red-500/20 leading-snug">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Verifying Credentials…" : "Authenticate & Sign In"}
            </button>

            <div className="pt-2 text-center">
              <span className="text-[10px] text-zinc-600 block leading-normal">
                This environment is restricted to authorized personnel. All login attempts are audited.
              </span>
            </div>
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => {
                setHoneypot(e.target.value);
                shield.setHoneypot(e.target.value.length > 0);
              }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden', opacity: 0 }}
            />
          </form>
        </div>
      </motion.div>
    </section>
  );
}
