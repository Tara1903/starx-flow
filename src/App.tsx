import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Lock,
  TrendingUp,
  Users,
  Zap,
  Globe,
  Shield,
  RefreshCcw,
  PlayCircle,
  Home as HomeIcon,
  ShoppingCart,
  Package,
  BarChart2,
  Megaphone,
  Settings,
  ChevronDown,
  Mouse,
  X,
} from "lucide-react";
import Spline from "@splinetool/react-spline";
import React, { useState, useEffect, createContext, useContext } from "react";
import { SignupModal } from "./components/SignupModal";

export const SignupContext = createContext({
  openSignup: () => {},
});

export const useSignup = () => useContext(SignupContext);

function CustomCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 400, mass: 0.5 };
  const ringXSpring = useSpring(ringX, springConfig);
  const ringYSpring = useSpring(ringY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"], .clickable')) {
        setIsHovered(true);
        setIsCardHovered(false);
      } else if (
        target.closest(
          ".bento-card, .dashboard-mockup, input, textarea, select",
        )
      ) {
        setIsCardHovered(true);
        setIsHovered(false);
      } else {
        setIsHovered(false);
        setIsCardHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    // Hide cursor when leaving window
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [dotX, dotY, ringX, ringY, isVisible]);

  return (
    <>
      <motion.div
        style={{ x: ringXSpring, y: ringYSpring }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center -ml-4 -mt-4 h-8 w-8 rounded-full mix-blend-difference"
        animate={{
          scale: isClicked ? 0.7 : isHovered ? 1.8 : isCardHovered ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-300 ${
            isHovered
              ? "bg-white border-0"
              : isCardHovered
                ? "border border-white/50 bg-white/10 backdrop-blur-sm"
                : "border-[1.5px] border-white"
          }`}
        />
      </motion.div>

      <motion.div
        style={{ x: dotX, y: dotY }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center -ml-1 -mt-1 h-2 w-2 rounded-full bg-white mix-blend-difference"
        animate={{
          scale: isClicked ? 0 : isHovered ? 0 : isCardHovered ? 0.5 : 1,
          opacity: isVisible && !isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Product from "./pages/Product";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import About from "./pages/About";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Navbar() {
  const { openSignup } = useSignup();
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
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
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400 tracking-wide">
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
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a
            href="#login"
            className="text-zinc-300 hover:text-white transition-colors hidden sm:block"
          >
            Login
          </a>
          <button
            onClick={openSignup}
            className="bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-full hover:bg-white hover:border-white hover:text-black transition-all shadow-sm flex items-center gap-2 group"
          >
            Start Free Trial{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#050505] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] ring-1 ring-white/5"
      >
        {/* Header/Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 border border-white/10 transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {/* Subtle glow behind video */}
          <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] pointer-events-none" />

          <video
            autoPlay
            muted
            controls
            className="w-full h-full object-cover relative z-10"
            src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { openSignup } = useSignup();
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 50]);

  // For words animation
  const headingWords = "Own your".split(" ");
  const headingWords2 = "customer flow.".split(" ");
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        ease: "easeOut" as const,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative pt-28 lg:pt-36 pb-10 lg:pb-20 px-6 min-h-[calc(100vh-4rem)] lg:min-h-screen flex flex-col justify-start overflow-hidden bg-black">
      {/* Premium Dark Ambient Background */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full z-0 pointer-events-none hidden md:block mix-blend-screen"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full z-0 pointer-events-none hidden md:block mix-blend-screen"
      />

      {/* Light Noise Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlRmlsdGVyKSIvPgo8L3N2Zz4=')] pointer-events-none mix-blend-overlay" />

      {/* Enhanced Premium Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden sm:block">
        {/* Subtle grid base */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent_70%)]" />

        {/* Floating light orbs */}
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[25%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_20px_4px_rgba(52,211,153,0.4)]"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -40, 0],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[60%] left-[15%] w-1.5 h-1.5 bg-teal-300 rounded-full shadow-[0_0_15px_3px_rgba(45,212,191,0.4)]"
        />
        <motion.div
          animate={{
            y: [0, -60, 0],
            x: [0, -20, 0],
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute bottom-[40%] right-[30%] w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_25px_5px_rgba(16,185,129,0.3)]"
        />

        {/* Elegant Animated SVG Lines */}
        <svg
          className="absolute w-full h-full opacity-40 mix-blend-screen"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="glowLinePremium"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="25%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.3" />
              <stop offset="75%" stopColor="#059669" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Topographic/Contour Lines */}
          <motion.path
            d="M-100,150 C300,50 600,250 1000,100 S1600,300 2000,150"
            fill="none"
            stroke="url(#glowLinePremium)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1, y: [0, -20, 0] }}
            transition={{
              pathLength: { duration: 3, ease: "easeOut" },
              y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.path
            d="M-100,180 C300,80 600,280 1000,130 S1600,330 2000,180"
            fill="none"
            stroke="url(#glowLinePremium)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5, y: [0, -25, 0] }}
            transition={{
              pathLength: { duration: 3.5, ease: "easeOut", delay: 0.2 },
              y: {
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              },
            }}
          />
          <motion.path
            d="M-100,210 C300,110 600,310 1000,160 S1600,360 2000,210"
            fill="none"
            stroke="url(#glowLinePremium)"
            strokeWidth="0.25"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3, y: [0, -30, 0] }}
            transition={{
              pathLength: { duration: 4, ease: "easeOut", delay: 0.4 },
              y: {
                duration: 24,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              },
            }}
          />

          {/* Connecting web lines */}
          <motion.line
            x1="25%"
            y1="30%"
            x2="15%"
            y2="60%"
            stroke="rgba(52,211,153,0.1)"
            strokeWidth="1"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1="25%"
            y1="30%"
            x2="70%"
            y2="60%"
            stroke="rgba(52,211,153,0.05)"
            strokeWidth="1"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left Column */}
        <div className="max-w-[600px] relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
              Direct Customer System
            </div>

            <div className="relative max-w-[650px]">
              {/* Behind-text glow */}
              <div className="absolute -inset-4 bg-emerald-500/10 blur-[50px] -z-10 rounded-full" />
              <motion.h1
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-[3rem] sm:text-5xl md:text-[4rem] lg:text-[4.5rem] tracking-tighter text-white mb-8 leading-[1.05] relative z-10 drop-shadow-lg font-bold flex flex-wrap"
              >
                {headingWords.map((word, index) => (
                  <motion.span
                    key={index}
                    variants={itemVariants}
                    className="mr-3"
                  >
                    {word}
                  </motion.span>
                ))}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 flex space-x-3">
                  {headingWords2.map((word, index) => (
                    <motion.span key={index} variants={itemVariants}>
                      {word}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="text-lg md:text-xl text-zinc-400 mb-10 leading-[1.6] font-medium max-w-[520px]"
            >
              Stop losing up to 30% in platform fees. Build your own direct
              customer system and take full control of your business.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 mb-10 lg:mb-16"
            >
              <motion.button
                onClick={openSignup}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black px-8 py-4 rounded-full text-base font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => setIsVideoOpen(true)}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/[0.03] border border-white/10 text-white px-8 py-4 rounded-full text-base font-medium transition-all flex items-center justify-center gap-3 group backdrop-blur-md shadow-sm"
              >
                <div className="w-6 h-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center group-hover:border-emerald-400 group-hover:text-emerald-400 transition-colors">
                  <PlayCircle className="w-3 h-3 text-emerald-400" />
                </div>
                View Demo
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            >
              <p className="text-[10px] font-bold tracking-[0.15em] text-zinc-500 mb-4 uppercase">
                Powering enterprise growth
              </p>
              <div className="flex gap-6 items-center flex-wrap">
                {/* Logos Mockup */}
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-emerald-400" />
                  <span className="font-black tracking-widest text-white text-sm">
                    VOLT
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white text-sm">
                    NEXORA
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Box size={14} className="text-emerald-400" />
                  <span className="font-bold tracking-widest text-zinc-300 text-sm">
                    DAWN
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCcw size={14} className="text-emerald-400" />
                  <span className="font-bold tracking-tight text-white text-sm">
                    PUREFIT
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column / UI Mockup */}
        <div className="relative w-full h-full flex justify-center lg:justify-center items-center z-10 pt-10 lg:pt-0">
          {/* Dashboard Glow */}
          <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full z-0 pointer-events-none mix-blend-screen" />

          {/* Green glowing Rings */}
          <motion.svg
            style={{ y: y2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] lg:w-[140%] lg:h-[140%] z-0 pointer-events-none opacity-60"
            viewBox="0 0 800 800"
          >
            <motion.ellipse
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              cx="400"
              cy="400"
              rx="280"
              ry="380"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeOpacity="0.3"
              style={{ transformOrigin: "center" }}
            />
            <motion.ellipse
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
              cx="400"
              cy="400"
              rx="350"
              ry="250"
              fill="none"
              stroke="#4ade80"
              strokeWidth="1"
              strokeOpacity="0.2"
              style={{ transformOrigin: "center" }}
            />
          </motion.svg>

          {/* Abstract 3D/Floating elements via Spline integration or CSS objects */}
          <motion.div
            style={{ y: y1 }}
            animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 right-20 w-16 h-16 bg-gradient-to-br from-[#1b1c1c] to-[#0d0e0e] border border-white/5 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-30"
          />
          {/* Emerald Crystal / Icosahedron mock */}
          <motion.div
            style={{ y: y3 }}
            animate={{ rotate: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 left-10 w-32 h-32 z-30"
          >
            <div className="w-full h-full bg-gradient-to-br from-emerald-500/40 to-emerald-900/40 backdrop-blur-md rounded-2xl rotate-45 border border-emerald-400/30 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-400/30" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-400/30" />
            </div>
          </motion.div>

          {/* Customer Flow Animation Illustration */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute -top-16 lg:-top-24 left-1/2 -translate-x-1/2 w-full max-w-[400px] z-30 flex flex-col items-center pointer-events-none"
          >
            <div className="flex justify-between w-full px-4 mb-4">
              {/* 3rd Party Apps */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.1)] relative"
              >
                <span className="text-red-400 font-bold text-[10px]">30%</span>
                <div className="absolute -bottom-6 left-1/2 w-0.5 h-6 bg-gradient-to-b from-red-500/50 to-emerald-500/50" />
              </motion.div>
              {/* Direct Traffic */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] relative"
              >
                <Globe size={20} className="text-emerald-400" />
                <div className="absolute -bottom-6 left-1/2 w-0.5 h-6 bg-gradient-to-b from-emerald-500/50 to-emerald-500/50" />
              </motion.div>
              {/* Social Media */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] relative"
              >
                <Users size={20} className="text-emerald-400" />
                <div className="absolute -bottom-6 left-1/2 w-0.5 h-6 bg-gradient-to-b from-emerald-500/50 to-emerald-500/50" />
              </motion.div>
            </div>
            {/* Flow lines merging into Direct platform */}
            <div className="relative w-full h-12 mb-2 flex justify-center">
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 50 0 C 50 30 200 10 200 50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  animate={{ strokeDashoffset: [-20, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                  d="M 200 0 L 200 50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  animate={{ strokeDashoffset: [-20, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                  d="M 350 0 C 350 30 200 10 200 50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  animate={{ strokeDashoffset: [-20, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>
            {/* Your Brand */}
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-6 py-2 rounded-full font-bold text-sm tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md">
              YOUR BRAND
            </div>
          </motion.div>

          {/* Dark Sphere Background */}
          <div className="absolute right-10 top-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-zinc-800 to-black shadow-[inset_-40px_-40px_80px_rgba(0,0,0,1)] z-0 opacity-80 mix-blend-multiply border border-white/5" />

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateX: 10, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateX: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="dashboard-mockup relative z-20 w-full max-w-[700px] bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex overflow-hidden ring-1 ring-white/5"
            style={{ transformPerspective: 1200 }}
          >
            {/* Sidebar */}
            <div className="w-[180px] bg-[#111111] p-4 hidden sm:flex flex-col border-r border-white/5">
              <div className="flex items-center gap-2 mb-8">
                <img
                  src="/logo.svg"
                  alt="StarX Flow Logo"
                  className="h-5 w-auto object-contain"
                />
              </div>
              <nav className="flex flex-col gap-2 flex-grow">
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 bg-white/5 text-emerald-400 rounded-lg text-xs font-medium"
                >
                  <HomeIcon size={14} /> Overview
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  <Users size={14} /> Customers
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  <ShoppingCart size={14} /> Orders
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  <Package size={14} /> Products
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  <BarChart2 size={14} /> Analytics
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white rounded-lg text-xs font-medium"
                >
                  <Megaphone size={14} /> Marketing
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white rounded-lg text-xs font-medium mt-auto"
                >
                  <Settings size={14} /> Settings
                </a>
              </nav>
            </div>

            {/* Main Dashboard Content */}
            <div className="flex-1 p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

              <header className="flex justify-between items-center mb-6">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  Overview <ChevronRight size={14} className="text-zinc-600" />
                </h2>
                <div className="flex items-center gap-3">
                  <div className="bg-[#1a1a1a] border border-white/5 px-3 py-1.5 rounded text-xs text-zinc-300 flex items-center gap-2 cursor-pointer">
                    This Month <ChevronDown size={12} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border border-white/10 overflow-hidden">
                    <img
                      src="https://i.pravatar.cc/100?img=33"
                      alt="user"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </header>

              {/* Top Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#151515] p-4 rounded-xl border border-white/5">
                  <p className="text-[11px] text-zinc-400 mb-2">
                    Total Revenue
                  </p>
                  <div className="flex items-end gap-3">
                    <span className="text-xl font-bold text-white">
                      $124,560
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      +18.2%
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-1">vs last month</p>
                </div>
                <div className="bg-[#151515] p-4 rounded-xl border border-white/5">
                  <p className="text-[11px] text-zinc-400 mb-2">
                    Total Customers
                  </p>
                  <div className="flex items-end gap-3">
                    <span className="text-xl font-bold text-white">1,243</span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      +12.4%
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-1">vs last month</p>
                </div>
                <div className="bg-[#151515] p-4 rounded-xl border border-white/5">
                  <p className="text-[11px] text-zinc-400 mb-2">Orders</p>
                  <div className="flex items-end gap-3">
                    <span className="text-xl font-bold text-white">3,456</span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      +16.7%
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-1">vs last month</p>
                </div>
              </div>

              {/* Middle row: Chart & List */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 bg-[#151515] p-4 rounded-xl border border-white/5">
                  <h3 className="text-xs font-semibold text-white mb-4">
                    Revenue Growth
                  </h3>
                  <div className="h-32 w-full relative flex items-end">
                    {/* Chart Mock */}
                    <div className="absolute inset-0 border-b border-l border-white/5" />
                    <svg
                      viewBox="0 0 100 40"
                      className="w-full h-full overflow-visible z-10"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chartGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,30 L10,25 L20,32 L30,20 L40,28 L50,15 L60,18 L70,5 L80,10 L90,2 L100,0 L100,40 L0,40 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M0,30 L10,25 L20,32 L30,20 L40,28 L50,15 L60,18 L70,5 L80,10 L90,2 L100,0"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="1.5"
                      />
                      <circle cx="100" cy="0" r="2.5" fill="#10b981" />
                    </svg>
                    <div className="absolute top-1 right-1 bg-emerald-500 text-[#0c0c0c] text-[10px] font-bold px-2 py-0.5 rounded-full z-20">
                      $124,560
                    </div>
                    {/* Axe labels */}
                    <div className="absolute left-0 top-0 text-[8px] text-zinc-600 -translate-x-full pr-1">
                      $150K
                    </div>
                    <div className="absolute left-0 bottom-0 text-[8px] text-zinc-600 -translate-x-full pr-1">
                      $0
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] text-zinc-500">
                    <span>May 1</span>
                    <span>May 8</span>
                    <span>May 15</span>
                    <span>May 22</span>
                    <span>May 28</span>
                  </div>
                </div>
                <div className="col-span-1 bg-[#151515] p-4 rounded-xl border border-white/5">
                  <h3 className="text-xs font-semibold text-white mb-4">
                    Top Products
                  </h3>
                  <div className="space-y-3">
                    {[
                      { n: "Premium Plan", v: "$45.2K" },
                      { n: "Pro Plan", v: "$32.1K" },
                      { n: "Starter Plan", v: "$18.7K" },
                      { n: "Add-ons", v: "$8.4K" },
                    ].map((item, id) => (
                      <div
                        key={id}
                        className="flex justify-between items-center bg-[#1c1c1c] p-2 rounded border border-white/5 gap-1"
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div className="min-w-[16px] h-4 bg-white/5 rounded text-[8px] flex justify-center items-center font-serif text-zinc-400">
                            A
                          </div>
                          <span className="text-[9px] text-zinc-300 truncate">
                            {item.n}
                          </span>
                        </div>
                        <span className="text-[9px] text-white font-medium whitespace-nowrap">
                          {item.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="bg-[#151515] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-semibold text-white">
                    Recent Orders
                  </h3>
                  <span className="text-[10px] text-zinc-500 cursor-pointer hover:text-white">
                    View all
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] text-zinc-500 pb-2 border-b border-white/5 mb-2">
                  <span>Order ID</span>
                  <span className="col-span-2">Customer</span>
                  <span>Amount & Status</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] items-center text-zinc-300 hover:bg-white/5 p-1 rounded">
                  <span className="text-white">#DR-2024-001</span>
                  <span className="col-span-2">James Carter</span>
                  <div className="flex items-center justify-between">
                    <span>$159.00</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[8px]">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-6 h-9 rounded-full border-2 border-zinc-600 flex justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-emerald-500 rounded-full"
          />
        </div>
        <span className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
          Scroll to explore
        </span>
        <ChevronDown size={12} className="text-zinc-600" />
      </motion.div>

      <AnimatePresence>
        {isVideoOpen && <VideoModal onClose={() => setIsVideoOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-12 border-y border-white/5 bg-black/40 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700"
      >
        <p className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          Trusted by market leaders
        </p>
        <div className="flex gap-8 md:gap-16 items-center flex-wrap justify-center">
          {["Acme Corp", "Quantum Systems", "Nexus", "Aura", "StarX Flow"].map(
            (brand) => (
              <span
                key={brand}
                className="text-xl font-bold tracking-tighter text-zinc-300"
              >
                {brand}
              </span>
            ),
          )}
        </div>
      </motion.div>
    </section>
  );
}

function Problem() {
  return (
    <section id="platform" className="py-20 lg:py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 text-white leading-tight">
              The platform tax <br className="hidden md:block" />
              <span className="text-zinc-400">is bleeding you dry.</span>
            </h2>
            <p className="text-xl text-zinc-300 leading-relaxed mb-10 max-w-lg">
              Every transaction mapped through third-party platforms strips up
              to 30% of your revenue and steals your customer relationships.
            </p>
            <ul className="space-y-6">
              {[
                {
                  title: "Margin Erosion",
                  desc: "Forfeiting 20-30% on every order to aggregators.",
                },
                {
                  title: "Lost Customers",
                  desc: "You don't own the customer contact or their behavior data.",
                },
                {
                  title: "Brand Commoditization",
                  desc: "You exist purely as a generic vendor in their network.",
                },
              ].map((item, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      {item.title}
                    </h4>
                    <p className="text-zinc-400 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />
            <div className="bento-card p-10 rounded-3xl relative z-10 border-red-500/20">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-zinc-400 font-medium mb-1">
                    Lost Revenue (YTD)
                  </p>
                  <h3 className="text-5xl font-bold text-white">€428,590</h3>
                </div>
                <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                  +12.4%
                </div>
              </div>
              <div className="h-40 w-full flex items-end gap-2 mt-10">
                {[40, 55, 45, 70, 65, 80, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-red-500/20 rounded-t-sm transition-all duration-500 hover:bg-red-500/40"
                    style={{ height: h + "%" }}
                  ></div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section id="solutions" className="py-32 px-6 relative z-10 bg-black/40">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 lg:mb-20 max-w-3xl"
        >
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-white">
            Architecture for{" "}
            <span className="text-gradient-gold">Ownership.</span>
          </h2>
          <p className="text-xl text-zinc-300 leading-relaxed">
            We provide the infrastructure to turn your brand into a direct,
            standalone platform. No aggregators, no intermediaries.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-full h-auto min-h-[600px] bento-card rounded-[40px] p-8 md:p-12 overflow-hidden relative"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[#050505] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent z-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] z-0" />

          <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8">
            {/* Left/Top: Floating UI Widgets */}
            <div className="flex-1 w-full flex flex-col gap-6 justify-center items-center lg:items-end order-2 lg:order-1 relative z-20">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-[#111] border border-white/5 p-4 rounded-2xl shadow-xl w-[280px] hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Direct Customers</p>
                    <p className="text-lg font-bold text-white">12,458</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded">
                  <TrendingUp size={12} /> +15.3% this week
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-[#111] border border-white/5 p-4 rounded-2xl shadow-xl w-[280px] hover:-translate-y-1 transition-transform lg:mr-12"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-zinc-400">Platform Margins</p>
                  <div className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">
                    Real-time
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400 font-medium">
                        StarX Flow (You)
                      </span>
                      <span className="text-white font-bold">100%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden text-emerald-500">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-400 font-medium">
                        UberEats / Doordash
                      </span>
                      <span className="text-zinc-500 font-medium">70%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden text-red-500">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-full bg-red-500/50"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Center: The App Ecosystem (Phone + Desktop snippets) */}
            <div className="relative order-1 lg:order-2 flex justify-center w-full lg:w-auto h-[500px] items-center perspective-1000">
              {/* Behind layer: Analytics Window */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotateX: 10, scale: 0.9 }}
                whileInView={{ opacity: 0.6, y: -40, rotateX: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className="absolute hidden sm:block w-[400px] h-[300px] ml-32 -mt-10 bg-[#0a0a0a] border border-white/5 rounded-xl shadow-2xl z-0 overflow-hidden"
              >
                <div className="h-8 bg-[#111] border-b border-white/5 flex items-center px-3 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="p-4 opacity-50">
                  <div className="w-1/2 h-4 bg-white/10 rounded mb-4" />
                  <div className="w-full h-32 bg-white/5 rounded flex items-end p-2 gap-2">
                    {[40, 60, 30, 80, 50, 90, 70, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-500/20 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Front layer: Phone frame */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                viewport={{ once: true }}
                className="w-[280px] h-[550px] bg-[#000] border-8 border-[#1a1a1a] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.15)] relative z-10 flex flex-col overflow-hidden ring-1 ring-white/10"
              >
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-50 flex items-center justify-between px-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-50" />
                  <div className="w-2 h-2 rounded-full border border-zinc-800" />
                </div>

                {/* App Content */}
                <div className="bg-[#050505] flex-1 pb-6 flex flex-col relative overflow-hidden">
                  {/* App Header */}
                  <div className="pt-12 px-5 pb-4 bg-gradient-to-b from-emerald-900/30 to-transparent">
                    <p className="text-xs text-emerald-400 font-bold tracking-widest mb-1 uppercase">
                      StarX Flow
                    </p>
                    <h3 className="text-2xl text-white font-semibold flex items-center gap-2">
                      Your Brand{" "}
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                    </h3>
                  </div>

                  <div className="px-5 flex-1 overflow-y-auto no-scrollbar space-y-4 relative z-10">
                    {/* Premium Card */}
                    <div className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[30px] rounded-full pointer-events-none" />
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs text-zinc-400 font-medium">
                          VIP Member
                        </span>
                        <Shield size={14} className="text-emerald-400" />
                      </div>
                      <p className="text-[10px] text-zinc-500 mb-1">
                        Points Balance
                      </p>
                      <p className="text-3xl text-white font-bold tracking-tight mb-2">
                        24,500
                      </p>
                      <div className="w-full h-1 bg-zinc-700/50 rounded-full mt-4">
                        <div className="w-2/3 h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#111] p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <ShoppingCart size={14} />
                        </div>
                        <span className="text-[10px] text-zinc-300 font-medium">
                          Order Again
                        </span>
                      </div>
                      <div className="bg-[#111] p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <Box size={14} />
                        </div>
                        <span className="text-[10px] text-zinc-300 font-medium">
                          Track Delivery
                        </span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-2">
                      <p className="text-xs text-white font-medium mb-3">
                        Recent Activity
                      </p>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="w-8 h-8 bg-[#151515] rounded-lg flex items-center justify-center">
                            <Check size={12} className="text-emerald-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-zinc-200 font-medium">
                              Order Completed
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              Today, 2:45 PM
                            </p>
                          </div>
                          <span className="text-xs text-emerald-400 font-medium">
                            +$24.00
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-t from-emerald-500/5 pointer-events-none" />
                </div>
              </motion.div>
            </div>

            {/* Right/Bottom: Live Data Feed */}
            <div className="flex-1 w-full flex flex-col gap-4 justify-center order-3 relative z-20">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-[#111] border border-emerald-500/20 p-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.05)] w-full lg:max-w-[320px]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    Live Transactions
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { n: "Sarah J.", a: "$42.50", l: "Loyalty Member" },
                    {
                      n: "Michael K.",
                      a: "$128.00",
                      l: "First Order",
                      c: "text-emerald-400",
                    },
                    { n: "Emma T.", a: "$15.20", l: "Subscription Renewal" },
                  ].map((t, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <p className="text-sm text-zinc-200 group-hover:text-white transition-colors">
                          {t.n}
                        </p>
                        <p className={`text-[10px] ${t.c || "text-zinc-500"}`}>
                          {t.l}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-white bg-white/5 px-2 py-1 rounded">
                        {t.a}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Integrate Core",
      desc: "Connect your existing operational data via our seamless enterprise APIs in minutes.",
    },
    {
      number: "02",
      title: "Deploy Platform",
      desc: "Instantly compile a white-labeled, high-converting customer application.",
    },
    {
      number: "03",
      title: "Scale Direct",
      desc: "Keep 100% of revenue and lifetime data by transitioning customers to your own system.",
    },
  ];

  return (
    <section className="py-32 px-6 relative z-10 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row gap-12 justify-between items-end mb-20"
        >
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold tracking-tighter mb-4 text-white">
              The Path to{" "}
              <span className="text-gradient-gold">Sovereignty.</span>
            </h2>
            <p className="text-xl text-zinc-300 leading-relaxed">
              Transitioning from aggregator-dependent to direct-to-consumer
              shouldn't take a development team. We automated the hard parts.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="relative p-10 rounded-3xl bg-[rgba(6,12,8,0.6)] border border-[rgba(212,175,55,0.15)] hover:bg-[rgba(6,12,8,0.9)] hover:border-[rgba(212,175,55,0.3)] transition-all group shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <div className="text-6xl font-bold text-[rgba(212,175,55,0.05)] group-hover:text-[rgba(212,175,55,0.15)] transition-colors absolute top-8 right-10 select-none">
                {step.number}
              </div>
              <div className="w-16 h-16 bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-[rgba(212,175,55,0.9)] font-bold text-lg">
                  {step.number}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                {step.title}
              </h3>
              <p className="text-zinc-300 leading-relaxed relative z-10">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const benefits = [
    {
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      title: "Data Sovereignty",
      desc: "Own your customer lists, behavioral data, and payment tokens natively.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "Margin Expansion",
      desc: "Recover 20-30% purely by removing the aggregator tax from your P&L.",
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Instant Settlement",
      desc: "Funds route directly to your merchant account. Zero holding periods.",
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: "Enterprise Grade",
      desc: "Military-grade encryption and 99.99% uptime guarantees.",
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      title: "Loyalty Engine",
      desc: "Built-in retention tools that actually increase Customer Lifetime Value.",
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-emerald-400" />,
      title: "Infinite Scalability",
      desc: "Headless architecture ready to support global volume perfectly.",
    },
  ];

  return (
    <section id="metrics" className="py-32 px-6 relative z-10">
      <div className="absolute left-[10%] top-[40%] w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-white"
        >
          Engineered for <span className="text-gradient-gold">dominance.</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bento-card p-8 rounded-3xl group cursor-pointer"
            >
              <div className="w-12 h-12 bg-[rgba(6,12,8,0.8)] border border-[rgba(212,175,55,0.2)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[rgba(212,175,55,0.1)] group-hover:border-[rgba(212,175,55,0.4)] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                {b.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{b.title}</h3>
              <p className="text-zinc-300 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      name: "Marcus von Bergen",
      role: "CEO, Vertex Operations",
      content:
        "Switching to StarX Flow gave us total control. We recovered 28% in direct margin within the first quarter without losing order volume.",
    },
    {
      name: "Sarah Lin",
      role: "VP Strategy, Nexus Global",
      content:
        "The level of control we now have over our customer journey is unprecedented. The aggregators were renting us our own customers.",
    },
  ];

  return (
    <section className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-full md:w-1/3"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-white leading-tight">
            The verdict from{" "}
            <span className="text-gradient-silver">leaders.</span>
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-8">
            Don't take our word for it. Listen to the enterprises who have
            already reclaimed their independence.
          </p>
        </motion.div>
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bento-card p-8 rounded-3xl"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Globe key={s} className="w-4 h-4 text-emerald-500" />
                ))}
              </div>
              <p className="text-lg text-zinc-200 font-medium leading-relaxed mb-8">
                "{r.content}"
              </p>
              <div>
                <p className="text-white font-bold">{r.name}</p>
                <p className="text-zinc-400 text-sm">{r.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { openSignup } = useSignup();
  return (
    <section className="py-32 px-6 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto bento-card rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8 leading-tight">
            Take full control.
          </h2>
          <p className="text-2xl text-zinc-300 mb-12 font-light tracking-tight">
            Your business is yours. Stop paying third-party fees and build your
            direct revenue channel today.
          </p>
          <motion.button
            onClick={openSignup}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 50px rgba(16, 185, 129, 0.8)",
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-emerald-500 text-black px-12 py-6 rounded-full text-xl font-bold hover:bg-emerald-400 transition-all premium-glow shadow-[0_0_60px_-10px_rgba(16,185,129,0.5)]"
          >
            Start Free Trial
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/10 bg-black relative z-10 mt-12 lg:mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="StarX Flow Logo"
            className="h-6 w-auto object-contain"
          />
        </div>
        <div className="text-sm tracking-wide text-zinc-400 font-medium flex gap-8">
          <span>&copy; {new Date().getFullYear()} StarX Flow.</span>
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Problem />
      <Demo />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <CTA />
    </>
  );
}

export default function App() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <SignupContext.Provider value={{ openSignup: () => setIsSignupOpen(true) }}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="bg-noise min-h-screen text-white font-sans overflow-hidden">
          <CustomCursor />
          <div className="fixed inset-0 bg-grid-dark pointer-events-none z-0" />
          <Navbar />
          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product" element={<Product />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <AnimatePresence>
          {isSignupOpen && (
            <SignupModal onClose={() => setIsSignupOpen(false)} />
          )}
        </AnimatePresence>
      </BrowserRouter>
    </SignupContext.Provider>
  );
}
