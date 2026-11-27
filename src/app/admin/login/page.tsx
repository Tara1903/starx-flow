"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Mail, Lock, ArrowRight, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import { useAdminStore } from "../../../store/adminStore";
import { useShield } from "../../../lib/shield";
import { CONSOLE_BTN_PRIMARY, CONSOLE_INPUT, CONSOLE_PANEL_LG } from "../../../lib/consoleSurface";
import { cn } from "../../../lib/utils";

export default function AdminLogin() {
  const router = useRouter();
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

  if (isLoggedIn && (user?.email === "admin@starxflow.com" || user?.role === "admin" || user?.role === "super_admin")) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-12 bg-[#080a09] text-[#edf0ee] p-4 font-sans">
        <div className={cn(CONSOLE_PANEL_LG, "w-full max-w-sm text-center p-7")}>
          <div className="w-11 h-11 rounded-xl bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center mx-auto mb-5 text-[#4cc38a]">
            <Shield className="w-5 h-5" strokeWidth={1.65} />
          </div>
          <h1 className="text-lg font-semibold text-[#edf0ee] mb-1.5">Access authorized</h1>
          <p className="text-xs text-[#a1aaa4] mb-6">Signed in as {user?.email}</p>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              const isAuth = await loginAdmin();
              setLoading(false);
              if (isAuth) {
                router.push("/admin");
              } else {
                setError("Role verification failed.");
              }
            }}
            className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5 text-sm")}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>Open admin console</span>
          </button>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const score = shield.getScore();
    if (score < 10) {
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
      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          setLockoutEnd(Date.now() + 5 * 60 * 1000);
        } else {
          setLockoutEnd(Date.now() + Math.pow(2, next) * 1000);
        }
        return next;
      });
    } else {
      const isAuth = await loginAdmin();
      setLoading(false);
      if (isAuth) {
        setFailedAttempts(0);
        router.push("/admin");
      } else {
        setError("Admin privileges verification failed.");
      }
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-12 bg-[#080a09] text-[#edf0ee] p-4 font-sans">
      <div className={cn(CONSOLE_PANEL_LG, "w-full max-w-sm p-7")}>
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center mb-4 text-[#edf0ee]">
            <Shield className="w-5 h-5" strokeWidth={1.65} />
          </div>
          <h1 className="text-xl font-semibold text-[#edf0ee] tracking-[-0.015em]">Admin sign in</h1>
          <p className="text-xs text-[#727c75] mt-1">Platform control access for authorized operators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
              Admin email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="admin@starxflow.com"
                className={cn(CONSOLE_INPUT, "w-full pl-9 pr-3.5 py-2.5 text-sm")}
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••••••"
                className={cn(CONSOLE_INPUT, "w-full pl-9 pr-10 py-2.5 text-sm")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727c75] hover:text-[#edf0ee] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[#f28b8e] text-xs flex items-start gap-2 bg-[#e5484d]/10 p-2.5 rounded-lg border border-[#e5484d]/25 leading-snug"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={cn(CONSOLE_BTN_PRIMARY, "w-full py-2.5 text-sm")}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? "Verifying credentials..." : "Sign in"}</span>
          </button>

          <p className="pt-2 text-center text-[11px] text-[#727c75] leading-normal">
            Restricted access. Failed attempts ({failedAttempts}) are rate-limited and audited.
          </p>

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
            style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden", opacity: 0 }}
          />
        </form>
      </div>
    </section>
  );
}
