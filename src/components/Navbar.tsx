import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";

export function Navbar() {
  const openSignup = useUIStore((state) => state.openSignup);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] will-change-transform"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/header-logo.svg"
            alt="StarX Flow Header Logo"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400 tracking-wide items-center">
          <Link
            to="/product"
            className="hover:text-emerald-400 transition-colors"
          >
            Product
          </Link>
          <Link
            to="/features"
            className="hover:text-emerald-400 transition-colors"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="hover:text-emerald-400 transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/resources"
            className="hover:text-emerald-400 transition-colors"
          >
            Resources
          </Link>
          <Link
            to="/about"
            className="hover:text-emerald-400 transition-colors"
          >
            About
          </Link>
          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors flex items-center gap-1.5 ml-2"
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-zinc-400 hover:text-white transition-colors hidden sm:block"
              >
                Logout
              </button>
              <Link
                to="/dashboard"
                data-magnetic
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-5 py-2.5 rounded-full hover:bg-emerald-500 hover:border-emerald-500 hover:text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-2 group premium-glow-hover"
              >
                Command Center{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={openSignup}
                className="text-zinc-300 hover:text-white transition-colors hidden sm:block"
              >
                Login
              </button>
              <button
                onClick={openSignup}
                data-magnetic
                className="bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-full hover:bg-white hover:border-white hover:text-black transition-all shadow-sm flex items-center gap-2 group premium-glow-hover"
              >
                Start Free Trial{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
