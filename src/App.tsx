import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useUIStore } from "./store/uiStore";
import { SignupModal } from "./components/SignupModal";
import { CustomCursor } from "./components/CustomCursor";
import { ScrollToTop } from "./components/ScrollToTop";
import { ConsentBanner } from "./components/ConsentBanner";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AmbientEnvironment } from "./components/AmbientEnvironment";
import { CommandCenter } from "./components/CommandCenter";
import { useAuthStore, setupAuthListener } from "./store/authStore";
import { useAdminStore } from "./store/adminStore";

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
const AdminLogin = lazy(() => import("./pages/AdminLogin").then(m => ({ default: m.AdminLogin })));

// Onboarding Pages
const SetupLayout = lazy(() => import("./pages/setup/SetupLayout").then(m => ({ default: m.SetupLayout })));
const WelcomeStep = lazy(() => import("./pages/setup/WelcomeStep").then(m => ({ default: m.WelcomeStep })));
const AccountStep = lazy(() => import("./pages/setup/AccountStep").then(m => ({ default: m.AccountStep })));
const WhatsAppStep = lazy(() => import("./pages/setup/WhatsAppStep").then(m => ({ default: m.WhatsAppStep })));
const InstagramStep = lazy(() => import("./pages/setup/InstagramStep").then(m => ({ default: m.InstagramStep })));
const SMSStep = lazy(() => import("./pages/setup/SMSStep").then(m => ({ default: m.SMSStep })));
const AIConfigStep = lazy(() => import("./pages/setup/AIConfigStep").then(m => ({ default: m.AIConfigStep })));
const TestStep = lazy(() => import("./pages/setup/TestStep").then(m => ({ default: m.TestStep })));
const LaunchStep = lazy(() => import("./pages/setup/LaunchStep").then(m => ({ default: m.LaunchStep })));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Route Guards
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  
  if (isLoading) return <PageLoader />;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  
  // If not onboarded and not trying to access onboarding, redirect to setup
  if (user && !user.onboardingComplete && !location.pathname.startsWith('/setup')) {
    return <Navigate to="/setup" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = useAdminStore((state) => state.isAdmin);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  if (isLoading) return <PageLoader />;
  if (!isLoggedIn || !isAdmin) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

function AppContent() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/setup') || location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden bg-black flex flex-col relative z-0">
      <AmbientEnvironment />
      <CustomCursor />
      <CommandCenter />
      {!isAppRoute && <Navbar />}
      <main className="relative z-10 flex-1">
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
            
            {/* Onboarding Setup Nested Route */}
            <Route path="/setup" element={<ProtectedRoute><SetupLayout /></ProtectedRoute>}>
              <Route path="welcome" element={<WelcomeStep />} />
              <Route path="account" element={<AccountStep />} />
              <Route path="whatsapp" element={<WhatsAppStep />} />
              <Route path="instagram" element={<InstagramStep />} />
              <Route path="sms" element={<SMSStep />} />
              <Route path="ai" element={<AIConfigStep />} />
              <Route path="test" element={<TestStep />} />
              <Route path="launch" element={<LaunchStep />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </Suspense>
      </main>
      {!isAppRoute && <Footer />}
    </div>
  );
}

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
      <AppContent />
      <AnimatePresence>
        {isSignupOpen && (
          <SignupModal onClose={closeSignup} />
        )}
      </AnimatePresence>
      <ConsentBanner />
    </BrowserRouter>
  );
}
