import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useUIStore } from "./store/uiStore";
import { SignupModal } from "./components/SignupModal";
import { CustomCursor } from "./components/CustomCursor";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { useAuthStore, setupAuthListener } from "./store/authStore";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Product = lazy(() => import("./pages/Product").then(m => ({ default: m.Product })));
const Features = lazy(() => import("./pages/Features").then(m => ({ default: m.Features })));
const Pricing = lazy(() => import("./pages/Pricing").then(m => ({ default: m.Pricing })));
const Resources = lazy(() => import("./pages/Resources").then(m => ({ default: m.Resources })));
const PresentationViewer = lazy(() => import("./pages/PresentationViewer").then(m => ({ default: m.PresentationViewer })));
const ArticleViewer = lazy(() => import("./pages/ArticleViewer").then(m => ({ default: m.ArticleViewer })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Privacy = lazy(() => import("./pages/Privacy").then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import("./pages/Terms").then(m => ({ default: m.Terms })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminSetup = lazy(() => import("./pages/AdminSetup").then(m => ({ default: m.AdminSetup })));
const AdminLogin = lazy(() => import("./pages/AdminLogin").then(m => ({ default: m.AdminLogin })));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const isSignupOpen = useUIStore((state) => state.isSignupOpen);
  const closeSignup = useUIStore((state) => state.closeSignup);
  const theme = useUIStore((state) => state.theme);
  const initSession = useAuthStore((state) => state.initSession);

  // Initialize Supabase auth session on app mount
  useEffect(() => {
    initSession();
    const cleanup = setupAuthListener();
    return cleanup;
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen text-white font-sans overflow-hidden bg-black">
        <CustomCursor />
        <Navbar />
        <main className="relative z-10">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product" element={<Product />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/:deckId" element={<PresentationViewer />} />
              <Route path="/resources/articles/:articleSlug" element={<ArticleViewer />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/setup" element={<AdminSetup />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      <AnimatePresence>
        {isSignupOpen && (
          <SignupModal onClose={closeSignup} />
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}
