"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

/* ─────────────────────────────────────────────────────────────────────────────
   DATA DEFINITIONS
   ───────────────────────────────────────────────────────────────────────────── */

const calendarDaysLayout: { label?: string; isHeader?: boolean; day?: number; muted?: boolean }[] = [
  { label: 'S', isHeader: true },
  { label: 'M', isHeader: true },
  { label: 'T', isHeader: true },
  { label: 'W', isHeader: true },
  { label: 'T', isHeader: true },
  { label: 'F', isHeader: true },
  { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 },
  { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 },
  { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 },
  { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 },
  { day: 30 }, { day: 31, muted: true }, { day: 1, muted: true }, { day: 2, muted: true }, { day: 3, muted: true }, { day: 4, muted: true }
];

const capabilityDetails = [
  { title: '24/7 WhatsApp Bookings', subtitle: 'Native conversational booking flow inside WhatsApp with instant slot selection and calendar locking.' },
  { title: 'No-Show Prevention', subtitle: 'Automated 24h and 2h WhatsApp reminders with one-tap confirmation or instant waitlist backfill.' },
  { title: 'Google Review Booster', subtitle: 'Automatically sends a personalized review link via WhatsApp 1 hour after appointment completion.' },
  { title: 'Staff Calendar Sync', subtitle: 'Two-way real-time sync with Google Calendar, Apple iCloud, and Outlook for every team member.' },
  { title: 'WhatsApp Intake Forms', subtitle: 'Collect client preferences, consent forms, and consultation notes right inside the chat thread.' },
  { title: 'Unified Service CRM & Audit Trail', subtitle: 'Complete chronological history of every message, booking, provider note, and visit outcome.' }
];

const workflowTabContents: Record<string, { title: string; desc: string; phoneTitle: string; phoneStatus: string; incomingText: string; promptText: string; confirmedTitle: string }> = {
  whatsapp: {
    title: '24/7 WhatsApp Bookings',
    desc: 'Turn enquiries into confirmed appointments automatically, anytime, day or night.',
    phoneTitle: 'Your Business',
    phoneStatus: 'Online',
    incomingText: 'Hi! Can I book a consultation?',
    promptText: 'Sure! Here are the available slots:',
    confirmedTitle: 'Booking Confirmed'
  },
  ai: {
    title: 'Contextual AI Understanding',
    desc: 'Understands customer intent, reschedules gracefully, and answers business queries instantly.',
    phoneTitle: 'StarX AI Concierge',
    phoneStatus: 'Active Intelligence',
    incomingText: 'Can I reschedule my appointment to Wednesday?',
    promptText: 'Checking live staff calendar availability...',
    confirmedTitle: 'Slot Updated'
  },
  scheduling: {
    title: 'Smart Calendar Synchronization',
    desc: 'Two-way sync with Google, Apple, and Outlook calendars with zero double-booking tolerance.',
    phoneTitle: 'Calendar Engine',
    phoneStatus: 'Two-Way Sync Active',
    incomingText: 'Is the 2:00 PM slot reserved for Sarah?',
    promptText: 'Locked atomically across Google & Outlook calendars:',
    confirmedTitle: 'Synchronized'
  },
  crm: {
    title: 'Customer Intelligence & History',
    desc: 'Complete client profiles, appointment history, preferences, and automated follow-ups in one place.',
    phoneTitle: 'Client CRM Profile',
    phoneStatus: 'Record #4892 Synced',
    incomingText: 'View consultation history for Elena Rostova',
    promptText: '3 previous visits • Preferred: Wed 11:00 AM:',
    confirmedTitle: 'Profile Verified'
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT IMPLEMENTATION
   ───────────────────────────────────────────────────────────────────────────── */

export function StarXFlowLanding() {

  const router = useRouter();
  const openLogin = useUIStore((s) => s.openLogin);
  const openSignup = useUIStore((s) => s.openSignup);
  const openDemo = useUIStore((s) => s.openDemo);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Interactive UI State
  const [selectedDate, setSelectedDate] = useState<number>(11);
  const [selectedSlot, setSelectedSlot] = useState<string>('Tue, 10:00 AM');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<string>('whatsapp');
  const [activeOrbitalNode, setActiveOrbitalNode] = useState<number>(0);
  const [renderMode, setRenderMode] = useState<'hybrid' | 'pure-css'>('hybrid');
  const [xrayOpacity, setXrayOpacity] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);

  // ROI Calculator State
  const [roiSessionVal, setRoiSessionVal] = useState<number>(80);
  const [roiMissedCalls, setRoiMissedCalls] = useState<number>(20);
  const roiMonthlyRecovery = Math.round(roiSessionVal * roiMissedCalls * 0.75);
  const roiHoursSaved = Math.round(roiMissedCalls * 1.5);

  // Sarah K. AI Receptionist Interactive Demo State
  const [sarahMessages, setSarahMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'user',
      text: 'Hi, do you have any slots for a deep tissue massage tomorrow?'
    },
    {
      sender: 'bot',
      text: 'Hi! We have openings at <strong>10:30 AM</strong> and <strong>2:00 PM</strong> with therapist Sarah. Want me to book one?'
    }
  ]);
  const [sarahInput, setSarahInput] = useState<string>('');
  const [sarahConfirmedText, setSarahConfirmedText] = useState<string>(
    'Appointment confirmed — Sarah K., Deep Tissue, 2:00 PM'
  );

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup' | 'capability';
    title: string;
    eyebrow: string;
    subtitle: string;
    submitText: string;
    showBizName: boolean;
    isSuccess: boolean;
  }>({
    isOpen: false,
    mode: 'signup',
    title: 'Run Your Business on One Flow',
    eyebrow: 'STARX FLOW ENVIRONMENT',
    subtitle: 'Connect your WhatsApp Business number, staff calendars, and customer CRM in under 3 minutes.',
    submitText: 'Start 14-Day Free Trial →',
    showBizName: true,
    isSuccess: false
  });

  const [bizName, setBizName] = useState('');
  const [email, setEmail] = useState('');

  // Mouse tilt tracking
  const [mousePos, setMousePos] = useState({ mx: '0.5', my: '0.5' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width).toFixed(3);
    const y = ((e.clientY - rect.top) / rect.height).toFixed(3);
    setMousePos({ mx: x, my: y });
  };

  // Toast Helper
  const showToast = (msg: string) => {
    if (toastTimeout) clearTimeout(toastTimeout);
    setToastMessage(msg);
    const t = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
    setToastTimeout(t);
  };

  const hideToast = () => {
    if (toastTimeout) clearTimeout(toastTimeout);
    setToastMessage(null);
  };

  // Time Slot Selection
  const selectTimeSlot = (slot: string) => {
    setSelectedSlot(slot);
    showToast(`Selected Slot: ${slot}`);
  };

  // Workflow Tabs
  const resetWorkflowDemo = () => {
    setActiveWorkflowTab('whatsapp');
    setSelectedSlot('Tue, 10:00 AM');
    showToast('Workflow demo reset to 24/7 WhatsApp Bookings');
  };

  const selectWorkflowTab = (tab: string) => {
    setActiveWorkflowTab(tab);
    showToast(`Switched to ${workflowTabContents[tab]?.title || tab}`);
  };

  const cycleWorkflowTab = () => {
    const tabs = ['whatsapp', 'ai', 'scheduling', 'crm'];
    const idx = tabs.indexOf(activeWorkflowTab);
    const nextTab = tabs[(idx + 1) % tabs.length];
    selectWorkflowTab(nextTab);
  };

  // Orbital Nodes
  const selectOrbitalNode = (idx: number, name: string) => {
    setActiveOrbitalNode(idx);
    showToast(`Node Connected: ${name}`);
  };

  const pulseAllNodes = () => {
    showToast('All 6 Orbital Beams Synchronized with Core');
  };

  // Challenge highlight
  const highlightChallenge = (idx: number) => {
    const labels = ['Missed Enquiries', 'Manual Bookings', 'Scheduling Conflicts', 'No-Shows'];
    showToast(`Challenge Identified: ${labels[idx]} — Resolved by StarX Flow`);
  };

  // Capability detail
  const openCapabilityDetail = (idx: number) => {
    const cap = capabilityDetails[idx];
    if (!cap) return;
    openModal('capability', cap.title, cap.subtitle);
  };

  // Smooth Scroll
  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Modal Handlers
  const openModal = (mode: 'login' | 'signup' | 'capability', planOrTitle?: string, customSubtitle?: string) => {
    if (mode === 'login') {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        openLogin();
      }
      return;
    }

    if (mode === 'signup') {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        openSignup();
      }
      return;
    }

    if (mode === 'capability') {
      setModalState({
        isOpen: true,
        mode,
        title: planOrTitle || 'StarX Flow Module',
        eyebrow: 'CORE CAPABILITY MODULE',
        subtitle: customSubtitle || 'Enterprise module specification and operational workflow configuration.',
        submitText: 'Enable This Module →',
        showBizName: true,
        isSuccess: false
      });
    } else {
      setModalState({
        isOpen: true,
        mode,
        title: 'Run Your Business on One Flow',
        eyebrow: planOrTitle ? `SELECTED: ${planOrTitle.toUpperCase()}` : 'STARX FLOW ENVIRONMENT',
        subtitle: 'Connect your WhatsApp Business number, staff calendars, and customer CRM in under 3 minutes.',
        submitText: 'Start 14-Day Free Trial →',
        showBizName: true,
        isSuccess: false
      });
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false, isSuccess: false }));
    setBizName('');
    setEmail('');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalState(prev => ({ ...prev, isSuccess: true }));
    showToast(`Request received for ${email || 'your business'}!`);
    setTimeout(() => {
      closeModal();
    }, 2400);
  };

  // Sarah K. AI Receptionist Demo Handler
  const handleSarahDemoReply = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = sarahInput.trim() || 'Book 2:00 PM please';
    setSarahInput('');

    const chosenTime = msg.includes('10:30') ? '10:30 AM' : '2:00 PM';

    setSarahMessages(prev => [
      ...prev,
      { sender: 'user', text: msg },
      {
        sender: 'bot',
        text: `Done! You are confirmed for a <strong>Deep Tissue Massage</strong> tomorrow at <strong>${chosenTime}</strong> with Sarah K. Calendar invite sent!`
      }
    ]);

    setSarahConfirmedText(`Appointment confirmed — Sarah K., Deep Tissue, ${chosenTime}`);
    showToast(`AI Receptionist confirmed slot: ${chosenTime} with Sarah K.`);
  };

  return (
    <>


  {/* MAIN PROPORTIONAL 1440x2362 FULL-SCALE WEBSITE CANVAS */}
  <div className="starx-viewport-wrapper" onMouseMove={handleMouseMove} style={{ '--mx': mousePos.mx, '--my': mousePos.my } as React.CSSProperties}>
    <main id="starx-stage" className="starx-stage mode-hybrid">
      <div className="starx-stage-inner">

        {/* ========================================================================= */}
        {/* LAYER 0A: FULL-SCALE 1440x2362 3D SANCTUARY & PEDESTAL STUDIO RENDER      */}
        {/* ========================================================================= */}
        <img
          id="studio-env-img"
          src="/assets/starx_clean_env.webp"
          alt="StarX Flow Architectural Studio Environment"
          className="pos pointer-events-none select-none transition-opacity duration-300"
          style={{
            '--x': 0,
            '--y': 0,
            '--w': 1440,
            '--h': 2362,
            zIndex: 1,
            objectFit: 'cover',
            opacity: renderMode === 'pure-css' ? 0 : 1
          } as React.CSSProperties}
        />

        {/* ========================================================================= */}
        {/* LAYER 0B: PURE CSS/SVG ARCHITECTURAL SANCTUARY ENGINE (FOR PURE CSS MODE) */}
        {/* ========================================================================= */}
        <div className="pure-css-sanctuary" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(circle at 72% 16%, #134e35 0%, #062116 32%, #020b08 70%)' } as React.CSSProperties}>
          <svg viewBox="0 0 1440 2362" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' } as React.CSSProperties}>
            <defs>
              <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.65"/>
                <stop offset="45%" stopColor="#10b981" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#020b08" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="waveEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.2"/>
                <stop offset="48%" stopColor="#a7f3d0" stopOpacity="0.95"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.25"/>
              </linearGradient>
              <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06281b"/>
                <stop offset="30%" stopColor="#6ee7b7"/>
                <stop offset="50%" stopColor="#ecfdf5"/>
                <stop offset="70%" stopColor="#34d399"/>
                <stop offset="100%" stopColor="#06281b"/>
              </linearGradient>
            </defs>
            <circle cx="1116" cy="1035" r="240" fill="url(#orbGlow)"/>
            <ellipse cx="810" cy="605" rx="360" ry="85" fill="url(#orbGlow)"/>
            <ellipse cx="730" cy="1560" rx="340" ry="120" fill="url(#orbGlow)"/>
            <path d="M600 585 V285 A135 135 0 0 1 870 285 V585" stroke="url(#waveEdge)" strokeWidth="24" strokeOpacity="0.45"/>
            <ellipse cx="785" cy="612" rx="320" ry="24" fill="url(#pedestalGrad)" opacity="0.65"/>
            <path d="M0 760 C 330 725, 560 780, 720 860 C 830 695, 1070 730, 1440 748" stroke="url(#waveEdge)" strokeWidth="3.5"/>
            <path d="M0 1215 C 270 1230, 520 1240, 635 1120 C 725 1020, 710 885, 815 815 C 930 750, 1190 785, 1440 795" stroke="url(#waveEdge)" strokeWidth="5"/>
            <circle cx="1116" cy="1035" r="66" fill="#0b3b28" stroke="#86efac" strokeWidth="3"/>
            <path d="M1116 990 L1127 1024 L1161 1035 L1127 1046 L1116 1080 L1105 1046 L1071 1035 L1105 1024 Z" fill="#a7f3d0"/>
            <path d="M0 1250 C 440 1228, 940 1228, 1440 1252" stroke="url(#waveEdge)" strokeWidth="2.5"/>
            <polygon points="482,1378 812,1382 952,1688 578,1702" fill="#071d14" stroke="#86efac" strokeWidth="5" opacity="0.9"/>
            <path d="M0 1672 C 300 1655, 480 1705, 730 1712 C 980 1720, 1150 1640, 1320 1740" stroke="url(#waveEdge)" strokeWidth="4"/>
            <path d="M0 1965 L1440 1965" stroke="url(#waveEdge)" strokeWidth="2.5"/>
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 1: TOP NAVIGATION BAR (Positioned cleanly at top of 100vh Hero)     */}
        {/* ========================================================================= */}
        <header id="top-nav" style={{ position: 'relative', zIndex: 20 } as React.CSSProperties}>
          {/* Brand Logo (72, 26) */}
          <a
            href="#hero-section"
            className="pos-auto flex items-center group"
            style={{ '--x': 72, '--y': 26, gap: 'calc(10 * var(--u))', textDecoration: 'none', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            <svg style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))', filter: 'drop-shadow(0 0 calc(8 * var(--u)) rgba(110, 231, 183, 0.85))' } as React.CSSProperties} viewBox="0 0 32 32" fill="none">
              <path d="M16 2L19.4 12.6L30 16L19.4 19.4L16 30L12.6 19.4L2 16L12.6 12.6L16 2Z" fill="url(#logoStarGrad)"/>
              <path d="M16 6L18.2 13.8L26 16L18.2 18.2L16 26L13.8 18.2L6 16L13.8 13.8L16 6Z" fill="#ecfdf5"/>
              <defs>
                <linearGradient id="logoStarGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a7f3d0"/>
                  <stop offset="1" stopColor="#10b981"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontSize: 'calc(19.5 * var(--u))', fontWeight: 600, letterSpacing: 'calc(-0.3 * var(--u))', color: '#ffffff' } as React.CSSProperties} className="group-hover:text-emerald-300 transition-colors">
              StarX Flow
            </span>
          </a>

          {/* Center Navigation Links */}
          <nav aria-label="Main Navigation">
            <a
              href="#hero-section"
              className="pos-auto hover:text-emerald-300 transition-colors"
              style={{ '--x': 464, '--y': 35, fontSize: 'calc(15.5 * var(--u))', fontWeight: 500, color: 'rgba(236, 253, 245, 0.9)', textDecoration: 'none' } as React.CSSProperties}
            >Product</a>
            <a
              href="#challenge-section"
              className="pos-auto hover:text-emerald-300 transition-colors"
              style={{ '--x': 566, '--y': 35, fontSize: 'calc(15.5 * var(--u))', fontWeight: 500, color: 'rgba(236, 253, 245, 0.9)', textDecoration: 'none' } as React.CSSProperties}
            >Solutions</a>
            <a
              href="#pricing-section"
              className="pos-auto hover:text-emerald-300 transition-colors"
              style={{ '--x': 673, '--y': 35, fontSize: 'calc(15.5 * var(--u))', fontWeight: 500, color: 'rgba(236, 253, 245, 0.9)', textDecoration: 'none' } as React.CSSProperties}
            >Pricing</a>
            <a
              href="#capabilities-section"
              className="pos-auto hover:text-emerald-300 transition-colors"
              style={{ '--x': 768, '--y': 35, fontSize: 'calc(15.5 * var(--u))', fontWeight: 500, color: 'rgba(236, 253, 245, 0.9)', textDecoration: 'none' } as React.CSSProperties}
            >Resources</a>
          </nav>

          {/* Right Action Buttons */}
          <button
            id="btn-nav-login"
            type="button"
            onClick={() => openModal('login')}
            className="pos btn-glass-pill flex items-center justify-center rounded-full"
            style={{ '--x': 1126, '--y': 22, '--w': 96, '--h': 42, fontSize: 'calc(15 * var(--u))', fontWeight: 500 } as React.CSSProperties}
          >
            Log in
          </button>

          <button
            id="btn-nav-get-started"
            type="button"
            onClick={() => openModal('signup', 'Growth Trial')}
            className="pos btn-mint-pill flex items-center justify-center rounded-full"
            style={{ '--x': 1238, '--y': 22, '--w': 146, '--h': 42, fontSize: 'calc(15 * var(--u))', gap: 'calc(6 * var(--u))' } as React.CSSProperties}
          >
            <span>Get Started</span>
            <span style={{ fontSize: 'calc(16 * var(--u))', lineHeight: '1' } as React.CSSProperties}>→</span>
          </button>
        </header>

        {/* ========================================================================= */}
        {/* SECTION 1: FULL-VIEWPORT HERO (y: 0..756 = 100vh on standard laptop)      */}
        {/* ========================================================================= */}
        <section id="hero-section" style={{ position: 'relative', zIndex: 15 } as React.CSSProperties}>
          {/* Eyebrow */}
          <div
            id="hero-eyebrow"
            className="pos-auto uppercase"
            style={{ '--x': 72, '--y': 174, fontSize: 'calc(12.6 * var(--u))', fontWeight: 600, letterSpacing: 'calc(2 * var(--u))', color: '#6ee7a8', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            THE INTELLIGENT BUSINESS ENVIRONMENT
          </div>

          {/* Editorial Main Headline */}
          <h1
            className="pos-auto font-editorial m-0"
            style={{ '--x': 70, '--y': 198, fontSize: 'calc(74 * var(--u))', fontWeight: 400, lineHeight: '0.94', letterSpacing: 'calc(-0.8 * var(--u))', color: '#f3fbf7', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            <span style={{ display: 'block' } as React.CSSProperties}>Run Your Business</span>
            <span style={{ display: 'block', marginTop: 'calc(4 * var(--u))' } as React.CSSProperties}>
              on <strong style={{ fontWeight: 600, color: '#ffffff' } as React.CSSProperties}>One Flow</strong>
            </span>
          </h1>

          {/* Hero Subheadline */}
          <p
            className="pos-auto m-0"
            style={{ '--x': 72, '--y': 368, fontSize: 'calc(18.2 * var(--u))', lineHeight: '1.45', fontWeight: 400, color: 'rgba(216, 236, 225, 0.88)' } as React.CSSProperties}
          >
            AI-powered communication, bookings, and operations<br/>
            — connected in one intelligent environment.
          </p>

          {/* Hero Primary CTA & Secondary CTA */}
          <button
            id="btn-hero-get-started"
            type="button"
            onClick={() => openModal('signup', 'Full Suite')}
            className="pos btn-mint-pill flex items-center justify-center rounded-full"
            style={{ '--x': 69, '--y': 454, '--w': 158, '--h': 56, fontSize: 'calc(16.8 * var(--u))', gap: 'calc(7 * var(--u))' } as React.CSSProperties}
          >
            <span>Get Started</span>
            <span style={{ fontSize: 'calc(18 * var(--u))' } as React.CSSProperties}>→</span>
          </button>

          <button
            id="btn-hero-see-action"
            type="button"
            onClick={() => scrollToSection('action-section')}
            className="pos btn-glass-pill flex items-center justify-center rounded-full"
            style={{ '--x': 245, '--y': 454, '--w': 188, '--h': 56, fontSize: 'calc(16.5 * var(--u))', fontWeight: 500, gap: 'calc(9 * var(--u))' } as React.CSSProperties}
          >
            <span>See It in Action</span>
            <svg style={{ width: 'calc(21 * var(--u))', height: 'calc(21 * var(--u))', opacity: 0.92, flexShrink: 0 } as React.CSSProperties} viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="#86efac" strokeWidth="1.3" strokeOpacity="0.7"/>
              <path d="M8.5 7L13 10L8.5 13V7Z" fill="#ecfdf5"/>
            </svg>
          </button>

          {/* Hero Bottom Feature Strip */}
          <div
            className="pos-auto flex items-center"
            style={{ '--x': 72, '--y': 558, gap: 'calc(28 * var(--u))', fontSize: 'calc(15 * var(--u))', fontWeight: 500, color: 'rgba(230, 246, 238, 0.92)', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            <button type="button" onClick={() => { selectWorkflowTab('whatsapp'); scrollToSection('action-section'); }} className="flex items-center hover:text-emerald-300 transition-colors bg-transparent border-0 p-0 cursor-pointer text-inherit" style={{ gap: 'calc(7.5 * var(--u))' } as React.CSSProperties}>
              <svg style={{ width: 'calc(19 * var(--u))', height: 'calc(19 * var(--u))', color: '#4ade80' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <span>WhatsApp Bookings</span>
            </button>

            <button type="button" onClick={() => { selectWorkflowTab('scheduling'); scrollToSection('action-section'); }} className="flex items-center hover:text-emerald-300 transition-colors bg-transparent border-0 p-0 cursor-pointer text-inherit" style={{ gap: 'calc(7.5 * var(--u))' } as React.CSSProperties}>
              <svg style={{ width: 'calc(19 * var(--u))', height: 'calc(19 * var(--u))', color: '#4ade80' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Scheduling</span>
            </button>

            <button type="button" onClick={() => { selectWorkflowTab('crm'); scrollToSection('action-section'); }} className="flex items-center hover:text-emerald-300 transition-colors bg-transparent border-0 p-0 cursor-pointer text-inherit" style={{ gap: 'calc(7.5 * var(--u))' } as React.CSSProperties}>
              <svg style={{ width: 'calc(20 * var(--u))', height: 'calc(20 * var(--u))', color: '#4ade80' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Customer CRM</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* HERO RIGHT: 3D FLOATING GLASS HUB CARDS                               */}
          {/* ===================================================================== */}

          {/* 1) BACK TABLET: BOOKINGS CALENDAR (left: 896, top: 171, w: 289, h: 348) */}
          <div
            id="hero-bookings-tablet"
            className="pos"
            style={{ '--x': 896, '--y': 171, '--w': 289, '--h': 348, pointerEvents: 'auto' } as React.CSSProperties}
          >
            {/* Small left sidebar icon on tablet */}
            <div
              className="pos-auto flex flex-col items-center"
              style={{ '--x': 10, '--y': 54, gap: 'calc(4 * var(--u))', opacity: 0.82 } as React.CSSProperties}
            >
              <div style={{ width: 'calc(21 * var(--u))', height: 'calc(21 * var(--u))', borderRadius: 'calc(5 * var(--u))', border: 'calc(1.2 * var(--u)) solid rgba(167, 243, 208, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties}>
                <svg style={{ width: 'calc(12 * var(--u))', height: 'calc(12 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
                </svg>
              </div>
              <span style={{ fontSize: 'calc(9 * var(--u))', color: 'rgba(190, 230, 210, 0.72)' } as React.CSSProperties}>10:00</span>
            </div>

            {/* Bookings Tablet Header */}
            <div
              className="pos-auto flex items-center"
              style={{ '--x': 74, '--y': 58, gap: 'calc(8 * var(--u))', transform: 'rotate(-4.5deg)', whiteSpace: 'nowrap' } as React.CSSProperties}
            >
              <div style={{ width: 'calc(25 * var(--u))', height: 'calc(25 * var(--u))', borderRadius: 'calc(6 * var(--u))', background: 'rgba(52, 211, 153, 0.22)', border: 'calc(1.2 * var(--u)) solid rgba(110, 231, 183, 0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties}>
                <svg style={{ width: 'calc(15 * var(--u))', height: 'calc(15 * var(--u))', color: '#86efac' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span style={{ fontSize: 'calc(17 * var(--u))', fontWeight: 600, color: '#ffffff', letterSpacing: 'calc(-0.2 * var(--u))' } as React.CSSProperties}>
                Bookings
              </span>
            </div>

            {/* Calendar Month Label */}
            <div
              className="pos-auto"
              style={{ '--x': 154, '--y': 112, fontSize: 'calc(12.5 * var(--u))', fontWeight: 500, color: 'rgba(195, 232, 212, 0.82)', transform: 'rotate(-2deg)' } as React.CSSProperties}
            >
              November
            </div>

            {/* Interactive Calendar Grid */}
            <div
              id="hero-calendar-grid"
              className="pos"
              style={{ '--x': 113, '--y': 138, '--w': 154, '--h': 180, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'center', justifyItems: 'center', fontSize: 'calc(11.6 * var(--u))' } as React.CSSProperties}
            >{calendarDaysLayout.map((item, idx) => {
                if (item.isHeader) {
                  return (
                    <div
                      key={`hdr-${idx}`}
                      style={{ fontSize: 'calc(10 * var(--u))', color: 'rgba(167, 243, 208, 0.6)', fontWeight: 600 } as React.CSSProperties}
                    >
                      {item.label}
                    </div>
                  );
                }
                const isActive = item.day === selectedDate && !item.muted;
                return (
                  <button
                    key={`day-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.day!);
                      showToast(`Selected November ${item.day} • ${selectedSlot}`);
                    }}
                    className={`cal-day border-0 bg-transparent p-0 ${isActive ? 'active' : ''}`}
                    style={{
                      width: 'calc(23 * var(--u))',
                      height: 'calc(23 * var(--u))',
                      fontSize: 'calc(11.4 * var(--u))',
                      opacity: item.muted ? 0.32 : 1
                    } as React.CSSProperties}
                  >
                    {item.day}
                  </button>
                );
              })}</div>
          </div>

          {/* 2) FRONT-LEFT CARD: WHATSAPP FLOATING GLASS CARD (left: 742, top: 274, w: 262, h: 317) */}
          <div
            id="hero-whatsapp-card"
            className="pos glass-shell"
            style={{ '--x': 742, '--y': 274, '--w': 262, '--h': 317, borderRadius: 'calc(24 * var(--u))', padding: 'calc(20 * var(--u))' } as React.CSSProperties}
          >
            {/* WhatsApp Card Header */}
            <div className="flex items-center" style={{ gap: 'calc(11 * var(--u))', marginTop: 'calc(2 * var(--u))' } as React.CSSProperties}>
              <div style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))', borderRadius: '999px', background: 'radial-gradient(circle at 30% 30%, #6ee7b7 0%, #22c55e 65%, #15803d 100%)', boxShadow: '0 0 calc(14 * var(--u)) rgba(74, 222, 128, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } as React.CSSProperties}>
                <svg style={{ width: 'calc(18 * var(--u))', height: 'calc(18 * var(--u))', color: '#ffffff' } as React.CSSProperties} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
                </svg>
              </div>
              <span style={{ fontSize: 'calc(17 * var(--u))', fontWeight: 600, color: '#ffffff' } as React.CSSProperties}>WhatsApp</span>
            </div>

            {/* Incoming Message Bubble */}
            <div
              style={{ marginTop: 'calc(16 * var(--u))', width: 'calc(210 * var(--u))', background: 'rgba(7, 24, 17, 0.62)', border: 'calc(1.1 * var(--u)) solid rgba(110, 231, 183, 0.22)', borderRadius: 'calc(12 * var(--u))', padding: 'calc(9.5 * var(--u)) calc(12 * var(--u))' } as React.CSSProperties}
            >
              <div style={{ fontSize: 'calc(13.4 * var(--u))', lineHeight: '1.32', color: 'rgba(236, 253, 245, 0.95)' } as React.CSSProperties}>
                Hi! Can I book an<br/>appointment for this week?
              </div>
            </div>

            {/* Outgoing Reply Bubble + Interactive Slot Pills (fitted cleanly inside card) */}
            <div
              style={{ marginTop: 'calc(9 * var(--u))', marginLeft: 'calc(36 * var(--u))', width: 'calc(184 * var(--u))', background: 'rgba(14, 44, 32, 0.6)', border: 'calc(1.1 * var(--u)) solid rgba(110, 231, 183, 0.28)', borderRadius: 'calc(14 * var(--u))', padding: 'calc(9 * var(--u)) calc(12 * var(--u))' } as React.CSSProperties}
            >
              <div style={{ fontSize: 'calc(13.2 * var(--u))', lineHeight: '1.28', fontWeight: 500, color: '#ffffff', marginBottom: 'calc(9 * var(--u))' } as React.CSSProperties}>
                Sure! Here are the available slots:
              </div>

              {/* 3 Slot Buttons */}
              <div className="flex flex-col" style={{ gap: 'calc(6.5 * var(--u))' } as React.CSSProperties}>
                <button
                  type="button"
                  data-slot="Tue, 10:00 AM"
                  onClick={() => selectTimeSlot('Tue, 10:00 AM')}
                  className="wa-slot-pill hero-slot-btn active flex items-center rounded-full"
                  style={{ height: 'calc(27 * var(--u))', padding: '0 calc(11 * var(--u))', fontSize: 'calc(12.2 * var(--u))', fontWeight: 500, gap: 'calc(7 * var(--u))' } as React.CSSProperties}
                >
                  <span style={{ width: 'calc(6 * var(--u))', height: 'calc(6 * var(--u))', borderRadius: '999px', background: '#86efac', display: 'inline-block', flexShrink: 0 } as React.CSSProperties}></span>
                  <span>Tue, 10:00 AM</span>
                </button>

                <button
                  type="button"
                  data-slot="Tue, 2:00 PM"
                  onClick={() => selectTimeSlot('Tue, 2:00 PM')}
                  className="wa-slot-pill hero-slot-btn flex items-center rounded-full"
                  style={{ height: 'calc(27 * var(--u))', padding: '0 calc(11 * var(--u))', fontSize: 'calc(12.2 * var(--u))', fontWeight: 500, gap: 'calc(7 * var(--u))' } as React.CSSProperties}
                >
                  <span style={{ width: 'calc(6 * var(--u))', height: 'calc(6 * var(--u))', borderRadius: '999px', background: '#86efac', display: 'inline-block', flexShrink: 0 } as React.CSSProperties}></span>
                  <span>Tue, 2:00 PM</span>
                </button>

                <button
                  type="button"
                  data-slot="Wed, 11:00 AM"
                  onClick={() => selectTimeSlot('Wed, 11:00 AM')}
                  className="wa-slot-pill hero-slot-btn flex items-center rounded-full"
                  style={{ height: 'calc(27 * var(--u))', padding: '0 calc(11 * var(--u))', fontSize: 'calc(12.2 * var(--u))', fontWeight: 500, gap: 'calc(7 * var(--u))' } as React.CSSProperties}
                >
                  <span style={{ width: 'calc(6 * var(--u))', height: 'calc(6 * var(--u))', borderRadius: '999px', background: '#86efac', display: 'inline-block', flexShrink: 0 } as React.CSSProperties}></span>
                  <span>Wed, 11:00 AM</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3) FRONT-RIGHT TOP CARD: AI ASSISTANT (left: 1163, top: 266, w: 211, h: 160) */}
          <div
            id="hero-ai-card"
            className="pos glass-shell"
            style={{ '--x': 1163, '--y': 266, '--w': 211, '--h': 160, borderRadius: 'calc(22 * var(--u))', padding: 'calc(20 * var(--u)) calc(18 * var(--u))' } as React.CSSProperties}
          >
            <div className="flex items-center" style={{ gap: 'calc(9 * var(--u))', marginTop: 'calc(8 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
              <svg style={{ width: 'calc(20 * var(--u))', height: 'calc(20 * var(--u))', color: '#86efac', flexShrink: 0 } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span style={{ fontSize: 'calc(15 * var(--u))', fontWeight: 500, color: '#e6f9ef' } as React.CSSProperties}>AI Assistant</span>
            </div>

            {/* Compact single-line status pill so it never wraps or overlaps Customer card */}
            <div
              id="hero-ai-status-box"
              style={{ marginTop: 'calc(14 * var(--u))', background: 'rgba(7, 24, 17, 0.65)', border: 'calc(1.1 * var(--u)) solid rgba(110, 231, 183, 0.28)', borderRadius: 'calc(13 * var(--u))', padding: 'calc(9.5 * var(--u)) calc(12 * var(--u))', transform: 'rotate(-1.8deg)' } as React.CSSProperties}
            >
              <div className="flex items-center justify-between" style={{ gap: 'calc(6 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
                <span id="hero-ai-status-text" style={{ fontSize: 'calc(14 * var(--u))', fontWeight: 600, color: '#ffffff' } as React.CSSProperties}>Booking confirmed</span>
                <span style={{ width: 'calc(17 * var(--u))', height: 'calc(17 * var(--u))', borderRadius: '999px', background: '#22c55e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#042115', fontSize: 'calc(11 * var(--u))', fontWeight: 800, flexShrink: 0 } as React.CSSProperties}>✓</span>
              </div>
              <div className="flex items-center" style={{ gap: 'calc(5.5 * var(--u))', marginTop: 'calc(4.5 * var(--u))', opacity: 0.88, whiteSpace: 'nowrap' } as React.CSSProperties}>
                <span style={{ width: 'calc(9 * var(--u))', height: 'calc(9 * var(--u))', borderRadius: 'calc(2.5 * var(--u))', background: '#4ade80', display: 'inline-block', flexShrink: 0 } as React.CSSProperties}></span>
                <span style={{ fontSize: 'calc(10.4 * var(--u))', color: '#a7f3d0' } as React.CSSProperties}>Synced to Calendar &amp; CRM</span>
              </div>
            </div>
          </div>

          {/* 4) FRONT-RIGHT BOTTOM CARD: CUSTOMER (left: 1163, top: 433, w: 211, h: 145) */}
          <div
            id="hero-customer-card"
            className="pos glass-shell"
            style={{ '--x': 1163, '--y': 433, '--w': 211, '--h': 145, borderRadius: 'calc(22 * var(--u))', padding: 'calc(22 * var(--u)) calc(18 * var(--u))' } as React.CSSProperties}
          >
            <div className="flex items-start" style={{ gap: 'calc(11 * var(--u))', marginTop: 'calc(6 * var(--u))' } as React.CSSProperties}>
              <div style={{ width: 'calc(28 * var(--u))', height: 'calc(28 * var(--u))', borderRadius: '999px', background: 'radial-gradient(circle at 35% 30%, #bbf7d0 0%, #34d399 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#042115', flexShrink: 0, marginTop: 'calc(2 * var(--u))' } as React.CSSProperties}>
                <svg style={{ width: 'calc(16 * var(--u))', height: 'calc(16 * var(--u))' } as React.CSSProperties} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div style={{ whiteSpace: 'nowrap' } as React.CSSProperties}>
                <div style={{ fontSize: 'calc(15.8 * var(--u))', fontWeight: 600, color: '#ffffff', lineHeight: '1.15' } as React.CSSProperties}>Customer</div>
                <div style={{ fontSize: 'calc(14 * var(--u))', fontWeight: 400, color: 'rgba(226, 248, 236, 0.92)', marginTop: 'calc(5 * var(--u))' } as React.CSSProperties}>New appointment</div>
                <div className="flex items-center" style={{ gap: 'calc(5 * var(--u))', marginTop: 'calc(5 * var(--u))', fontSize: 'calc(13.5 * var(--u))', color: '#86efac', fontWeight: 500 } as React.CSSProperties}>
                  <span>•</span>
                  <span id="hero-customer-slot-label">Tue, 10:00 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* SCROLL TO EXPLORE INDICATOR (Single-line centered at bottom of 100vh Hero: y: 668) */}
          <button
            id="btn-scroll-explore"
            type="button"
            onClick={() => scrollToSection('challenge-section')}
            className="pos-auto flex flex-col items-center bg-transparent border-0 cursor-pointer group"
            style={{ '--x': 720, '--y': 668, transform: 'translateX(-50%)', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            <span className="group-hover:text-emerald-300 transition-colors" style={{ fontSize: 'calc(11.6 * var(--u))', fontWeight: 500, letterSpacing: 'calc(2.2 * var(--u))', color: 'rgba(198, 232, 214, 0.8)' } as React.CSSProperties}>
              SCROLL TO EXPLORE
            </span>
            <svg className="group-hover:translate-y-0.5 transition-transform" style={{ width: 'calc(16 * var(--u))', height: 'calc(16 * var(--u))', marginTop: 'calc(6 * var(--u))', color: 'rgba(167, 243, 208, 0.82)' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: THE DAILY CHALLENGE vs THE STARX FLOW WAY (y: 790..1195)       */}
        {/* ========================================================================= */}
        <section id="challenge-section" style={{ position: 'relative', zIndex: 15 } as React.CSSProperties}>
          {/* LEFT COLUMN: THE DAILY CHALLENGE */}
          <div
            className="pos-auto uppercase"
            style={{ '--x': 77, '--y': 810, fontSize: 'calc(12.2 * var(--u))', fontWeight: 600, letterSpacing: 'calc(1.9 * var(--u))', color: '#5eead4', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            THE DAILY CHALLENGE
          </div>

          <h2
            className="pos-auto font-editorial m-0"
            style={{ '--x': 77, '--y': 830, fontSize: 'calc(46.5 * var(--u))', fontWeight: 400, lineHeight: '1.03', letterSpacing: 'calc(-0.4 * var(--u))', color: '#f4fbf7', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            Running a business<br/>
            shouldn’t feel fragmented.
          </h2>

          {/* 4 TILTED FRAGMENTED GLASS CARDS */}
          {/* Card 1: Missed enquiries */}
          <button
            type="button"
            onClick={() => highlightChallenge(0)}
            id="challenge-card-0"
            className="pos challenge-card glass-shell flex flex-col items-center justify-center text-center"
            style={{ '--x': 37, '--y': 965, '--w': 130, '--h': 139, borderRadius: 'calc(19 * var(--u))', transform: 'rotate(-10deg)' } as React.CSSProperties}
          >
            <svg style={{ width: 'calc(33 * var(--u))', height: 'calc(33 * var(--u))', color: 'rgba(215, 240, 228, 0.9)', marginBottom: 'calc(10 * var(--u))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              <circle cx="9.5" cy="11.5" r="0.8" fill="currentColor"/>
              <circle cx="12.5" cy="11.5" r="0.8" fill="currentColor"/>
              <circle cx="15.5" cy="11.5" r="0.8" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: 'calc(14.8 * var(--u))', lineHeight: '1.2', fontWeight: 500, color: 'rgba(235, 248, 242, 0.94)' } as React.CSSProperties}>
              Missed<br/>enquiries
            </span>
          </button>

          {/* Card 2: Manual bookings */}
          <button
            type="button"
            onClick={() => highlightChallenge(1)}
            id="challenge-card-1"
            className="pos challenge-card glass-shell flex flex-col items-center justify-center text-center"
            style={{ '--x': 208, '--y': 956, '--w': 130, '--h': 139, borderRadius: 'calc(19 * var(--u))', transform: 'rotate(9deg)' } as React.CSSProperties}
          >
            <svg style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))', color: 'rgba(215, 240, 228, 0.9)', marginBottom: 'calc(10 * var(--u))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: 'calc(14.8 * var(--u))', lineHeight: '1.2', fontWeight: 500, color: 'rgba(235, 248, 242, 0.94)' } as React.CSSProperties}>
              Manual<br/>bookings
            </span>
          </button>

          {/* Card 3: Scheduling conflicts */}
          <button
            type="button"
            onClick={() => highlightChallenge(2)}
            id="challenge-card-2"
            className="pos challenge-card glass-shell flex flex-col items-center justify-center text-center"
            style={{ '--x': 359, '--y': 1018, '--w': 131, '--h': 139, borderRadius: 'calc(19 * var(--u))', transform: 'rotate(-1deg)' } as React.CSSProperties}
          >
            <svg style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))', color: 'rgba(215, 240, 228, 0.9)', marginBottom: 'calc(10 * var(--u))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 12 12 17 22 12"/>
              <polyline points="2 17 12 22 22 17"/>
            </svg>
            <span style={{ fontSize: 'calc(14.5 * var(--u))', lineHeight: '1.2', fontWeight: 500, color: 'rgba(235, 248, 242, 0.94)' } as React.CSSProperties}>
              Scheduling<br/>conflicts
            </span>
          </button>

          {/* Card 4: No-shows */}
          <button
            type="button"
            onClick={() => highlightChallenge(3)}
            id="challenge-card-3"
            className="pos challenge-card glass-shell flex flex-col items-center justify-center text-center"
            style={{ '--x': 505, '--y': 968, '--w': 110, '--h': 121, borderRadius: 'calc(18 * var(--u))', transform: 'rotate(2.5deg)' } as React.CSSProperties}
          >
            <svg style={{ width: 'calc(30 * var(--u))', height: 'calc(30 * var(--u))', color: 'rgba(215, 240, 228, 0.9)', marginBottom: 'calc(9 * var(--u))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ fontSize: 'calc(14.5 * var(--u))', lineHeight: '1.2', fontWeight: 500, color: 'rgba(235, 248, 242, 0.94)' } as React.CSSProperties}>
              No-shows
            </span>
          </button>

          {/* RIGHT COLUMN: THE STARX FLOW WAY */}
          <div
            className="pos-auto uppercase"
            style={{ '--x': 926, '--y': 792, fontSize: 'calc(12.2 * var(--u))', fontWeight: 600, letterSpacing: 'calc(1.9 * var(--u))', color: '#6ee7a8', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            THE STARX FLOW WAY
          </div>

          <h2
            className="pos-auto font-editorial m-0"
            style={{ '--x': 926, '--y': 812, fontSize: 'calc(46.5 * var(--u))', fontWeight: 400, lineHeight: '1.03', letterSpacing: 'calc(-0.4 * var(--u))', color: '#f4fbf7', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            From scattered tasks to<br/>
            a <span style={{ color: '#6ee7a8' } as React.CSSProperties}>connected</span> operation.
          </h2>

          {/* SVG Orbital Connection Arcs around the Central Star Sphere (1116.5, 1034.7) */}
          <svg
            className="pos pointer-events-none"
            style={{ '--x': 820, '--y': 900, '--w': 590, '--h': 290 } as React.CSSProperties}
            viewBox="820 900 590 290"
            fill="none"
          >
            <ellipse cx="1116" cy="1038" rx="232" ry="88" stroke="#4ade80" strokeOpacity="0.25" strokeWidth="1.6" strokeDasharray="5 5"/>
            <ellipse cx="1116" cy="1038" rx="164" ry="104" stroke="#6ee7b7" strokeOpacity="0.28" strokeWidth="1.6"/>
            <line id="orb-beam-0" x1="995" y1="941" x2="1116" y2="1035" stroke="#5eead4" strokeOpacity="0.38" strokeWidth="1.8"/>
            <line id="orb-beam-1" x1="1239" y1="941" x2="1116" y2="1035" stroke="#5eead4" strokeOpacity="0.38" strokeWidth="1.8"/>
            <line id="orb-beam-2" x1="885" y1="1026" x2="1116" y2="1035" stroke="#5eead4" strokeOpacity="0.38" strokeWidth="1.8"/>
            <line id="orb-beam-3" x1="1348" y1="1026" x2="1116" y2="1035" stroke="#5eead4" strokeOpacity="0.38" strokeWidth="1.8"/>
            <line id="orb-beam-4" x1="969" y1="1130" x2="1116" y2="1035" stroke="#5eead4" strokeOpacity="0.38" strokeWidth="1.8"/>
            <line id="orb-beam-5" x1="1265" y1="1130" x2="1116" y2="1035" stroke="#5eead4" strokeOpacity="0.38" strokeWidth="1.8"/>
          </svg>

          {/* Center Star Sphere Interactive Trigger */}
          <button
            id="btn-center-orb"
            type="button"
            onClick={pulseAllNodes}
            aria-label="StarX Flow Core Intelligence"
            className="pos rounded-full bg-transparent border-0 cursor-pointer group"
            style={{ '--x': 1049, '--y': 962, '--w': 135, '--h': 148 } as React.CSSProperties}
            title="Click to synchronize all connected operations"
          >
            <span className="block w-full h-full rounded-full group-hover:shadow-[0_0_45px_rgba(110,231,183,0.7)] transition-shadow"></span>
          </button>

          {/* 6 ORBITAL NODES */}
          {/* Node 0: Bookings (center 995.3, 940.8) */}
          <div className="pos-auto flex flex-col items-center" style={{ '--x': 995, '--y': 913, transform: 'translateX(-50%)', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <button
              type="button"
              id="orbital-node-0"
              onClick={() => selectOrbitalNode(0, 'Bookings')}
              className="orbital-node-btn active rounded-full flex items-center justify-center"
              style={{ width: 'calc(56 * var(--u))', height: 'calc(56 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(25 * var(--u))', height: 'calc(25 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
            <span style={{ marginTop: 'calc(6 * var(--u))', fontSize: 'calc(13.8 * var(--u))', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>Bookings</span>
          </div>

          {/* Node 1: Customers (center 1239.0, 940.8) */}
          <div className="pos-auto flex flex-col items-center" style={{ '--x': 1239, '--y': 913, transform: 'translateX(-50%)', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <button
              type="button"
              id="orbital-node-1"
              onClick={() => selectOrbitalNode(1, 'Customers')}
              className="orbital-node-btn rounded-full flex items-center justify-center"
              style={{ width: 'calc(56 * var(--u))', height: 'calc(56 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(25 * var(--u))', height: 'calc(25 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </button>
            <span style={{ marginTop: 'calc(6 * var(--u))', fontSize: 'calc(13.8 * var(--u))', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>Customers</span>
          </div>

          {/* Node 2: Communication (center 885.2, 1025.6) */}
          <div className="pos-auto flex flex-col items-center" style={{ '--x': 885, '--y': 998, transform: 'translateX(-50%)', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <button
              type="button"
              id="orbital-node-2"
              onClick={() => selectOrbitalNode(2, 'Communication')}
              className="orbital-node-btn rounded-full flex items-center justify-center"
              style={{ width: 'calc(56 * var(--u))', height: 'calc(56 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(25 * var(--u))', height: 'calc(25 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </button>
            <span style={{ marginTop: 'calc(6 * var(--u))', fontSize: 'calc(13.8 * var(--u))', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>Communication</span>
          </div>

          {/* Node 3: Operations (center 1347.8, 1025.6) */}
          <div className="pos-auto flex flex-col items-center" style={{ '--x': 1348, '--y': 998, transform: 'translateX(-50%)', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <button
              type="button"
              id="orbital-node-3"
              onClick={() => selectOrbitalNode(3, 'Operations')}
              className="orbital-node-btn rounded-full flex items-center justify-center"
              style={{ width: 'calc(56 * var(--u))', height: 'calc(56 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(25 * var(--u))', height: 'calc(25 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </button>
            <span style={{ marginTop: 'calc(6 * var(--u))', fontSize: 'calc(13.8 * var(--u))', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>Operations</span>
          </div>

          {/* Node 4: Scheduling (center 969.2, 1130.1) */}
          <div className="pos-auto flex flex-col items-center" style={{ '--x': 969, '--y': 1102, transform: 'translateX(-50%)', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <button
              type="button"
              id="orbital-node-4"
              onClick={() => selectOrbitalNode(4, 'Scheduling')}
              className="orbital-node-btn rounded-full flex items-center justify-center"
              style={{ width: 'calc(56 * var(--u))', height: 'calc(56 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(25 * var(--u))', height: 'calc(25 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/>
              </svg>
            </button>
            <span style={{ marginTop: 'calc(6 * var(--u))', fontSize: 'calc(13.8 * var(--u))', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>Scheduling</span>
          </div>

          {/* Node 5: Automation (center 1265.2, 1130.1) */}
          <div className="pos-auto flex flex-col items-center" style={{ '--x': 1265, '--y': 1102, transform: 'translateX(-50%)', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <button
              type="button"
              id="orbital-node-5"
              onClick={() => selectOrbitalNode(5, 'Automation')}
              className="orbital-node-btn rounded-full flex items-center justify-center"
              style={{ width: 'calc(56 * var(--u))', height: 'calc(56 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(25 * var(--u))', height: 'calc(25 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <span style={{ marginTop: 'calc(6 * var(--u))', fontSize: 'calc(13.8 * var(--u))', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>Automation</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: SEE IT IN ACTION ("Real workflows. Real business impact.")     */}
        {/* ========================================================================= */}
        <section id="action-section" style={{ position: 'relative', zIndex: 15 } as React.CSSProperties}>
          {/* Left Eyebrow & Heading */}
          <div
            className="pos-auto uppercase"
            style={{ '--x': 85, '--y': 1305, fontSize: 'calc(12.2 * var(--u))', fontWeight: 600, letterSpacing: 'calc(1.9 * var(--u))', color: '#6ee7a8', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            SEE IT IN ACTION
          </div>

          <h2
            className="pos-auto font-editorial m-0"
            style={{ '--x': 85, '--y': 1326, fontSize: 'calc(48 * var(--u))', fontWeight: 400, lineHeight: '1.03', letterSpacing: 'calc(-0.4 * var(--u))', color: '#f4fbf7', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            Real workflows.<br/>
            Real business impact.
          </h2>

          {/* Left Dynamic Feature Copy */}
          <div className="pos-auto" style={{ '--x': 85, '--y': 1484 } as React.CSSProperties}>
            <span style={{ fontSize: 'calc(18 * var(--u))', color: 'rgba(110, 231, 183, 0.48)' } as React.CSSProperties}>→</span>
          </div>

          <div className="pos-auto" style={{ '--x': 160, '--y': 1479, width: 'calc(265 * var(--u))' } as React.CSSProperties}>
            <h3 id="workflow-side-title" className="m-0" style={{ fontSize: 'calc(19.8 * var(--u))', fontWeight: 600, color: '#ffffff', letterSpacing: 'calc(-0.2 * var(--u))' } as React.CSSProperties}>
              {workflowTabContents[activeWorkflowTab]?.title || '24/7 WhatsApp Bookings'}
            </h3>
            <p id="workflow-side-desc" className="m-0" style={{ marginTop: 'calc(11 * var(--u))', fontSize: 'calc(15.2 * var(--u))', lineHeight: '1.45', color: 'rgba(210, 234, 222, 0.85)' } as React.CSSProperties}>
              {workflowTabContents[activeWorkflowTab]?.desc || 'Turn enquiries into confirmed appointments automatically, anytime, day or night.'}
            </p>
            <button
              id="btn-explore-workflow"
              type="button"
              onClick={cycleWorkflowTab}
              className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer group"
              style={{ marginTop: 'calc(22 * var(--u))', fontSize: 'calc(15 * var(--u))', fontWeight: 500, color: '#a7f3d0', borderBottom: 'calc(1.2 * var(--u)) solid rgba(134, 239, 172, 0.48)', paddingBottom: 'calc(3 * var(--u))', gap: 'calc(7 * var(--u))' } as React.CSSProperties}
            >
              <span>Explore the Workflow</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Top-Right 4 Workflow Pill Tabs (left: 599, top: 1308, w: 760, h: 55) */}
          <div
            className="pos flex items-center justify-between rounded-full"
            style={{ '--x': 599, '--y': 1308, '--w': 760, '--h': 55, padding: 'calc(4.5 * var(--u))', background: 'rgba(7, 24, 17, 0.68)', border: 'calc(1.2 * var(--u)) solid rgba(110, 231, 183, 0.26)', backdropFilter: 'blur(8px)' } as React.CSSProperties}
          >
            <button
              type="button"
              id="tab-btn-whatsapp"
              onClick={() => selectWorkflowTab('whatsapp')}
              className={`workflow-tab flex items-center justify-center rounded-full h-full ${activeWorkflowTab === 'whatsapp' ? 'active' : ''}`}
              style={{ padding: '0 calc(20 * var(--u))', fontSize: 'calc(14.5 * var(--u))', fontWeight: 500, gap: 'calc(8 * var(--u))' } as React.CSSProperties}
            >
              <span style={{ width: 'calc(21 * var(--u))', height: 'calc(21 * var(--u))', borderRadius: '999px', background: '#22c55e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#042115', flexShrink: 0 } as React.CSSProperties}>
                <svg style={{ width: 'calc(13 * var(--u))', height: 'calc(13 * var(--u))' } as React.CSSProperties} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.45 17.5 2 12.04 2Z"/>
                </svg>
              </span>
              <span>WhatsApp Bookings</span>
            </button>

            <button
              type="button"
              id="tab-btn-ai"
              onClick={() => selectWorkflowTab('ai')}
              className={`workflow-tab flex items-center justify-center rounded-full h-full ${activeWorkflowTab === 'ai' ? 'active' : ''}`}
              style={{ padding: '0 calc(19 * var(--u))', fontSize: 'calc(14.5 * var(--u))', fontWeight: 500, gap: 'calc(8 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(18 * var(--u))', height: 'calc(18 * var(--u))', color: '#6ee7b7', flexShrink: 0 } as React.CSSProperties} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z"/>
              </svg>
              <span>AI Communication</span>
            </button>

            <button
              type="button"
              id="tab-btn-scheduling"
              onClick={() => selectWorkflowTab('scheduling')}
              className={`workflow-tab flex items-center justify-center rounded-full h-full ${activeWorkflowTab === 'scheduling' ? 'active' : ''}`}
              style={{ padding: '0 calc(19 * var(--u))', fontSize: 'calc(14.5 * var(--u))', fontWeight: 500, gap: 'calc(8 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(18 * var(--u))', height: 'calc(18 * var(--u))', color: '#6ee7b7', flexShrink: 0 } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Scheduling</span>
            </button>

            <button
              type="button"
              id="tab-btn-crm"
              onClick={() => selectWorkflowTab('crm')}
              className={`workflow-tab flex items-center justify-center rounded-full h-full ${activeWorkflowTab === 'crm' ? 'active' : ''}`}
              style={{ padding: '0 calc(19 * var(--u))', fontSize: 'calc(14.5 * var(--u))', fontWeight: 500, gap: 'calc(8 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(18 * var(--u))', height: 'calc(18 * var(--u))', color: '#6ee7b7', flexShrink: 0 } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>
              </svg>
              <span>CRM &amp; History</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* CENTER 3D PERSPECTIVE SMARTPHONE SCREEN UI (left: 507, top: 1382)     */}
          {/* ===================================================================== */}
          <div
            id="phone-3d-screen"
            className="pos"
            style={{ '--x': 507, '--y': 1382, '--w': 306, '--h': 302, transformOrigin: 'top left', transform: 'skewX(19.2deg) rotate(-1.1deg)', padding: 'calc(9 * var(--u)) calc(16 * var(--u))' } as React.CSSProperties}
          >
            {/* Phone Status Bar */}
            <div className="flex items-center justify-between" style={{ fontSize: 'calc(11 * var(--u))', fontWeight: 600, color: 'rgba(215, 240, 228, 0.8)', padding: '0 calc(6 * var(--u))' } as React.CSSProperties}>
              <span>9:41</span>
              <div className="flex items-center" style={{ gap: 'calc(6 * var(--u))' } as React.CSSProperties}>
                <span>•••</span>
                <span>WiFi</span>
                <span>100%</span>
              </div>
            </div>

            {/* WhatsApp Business Header inside Phone */}
            <div className="flex items-center" style={{ marginTop: 'calc(8 * var(--u))', gap: 'calc(9 * var(--u))' } as React.CSSProperties}>
              <span style={{ fontSize: 'calc(15 * var(--u))', color: 'rgba(215, 240, 228, 0.85)' } as React.CSSProperties}>‹</span>
              <div style={{ width: 'calc(29 * var(--u))', height: 'calc(29 * var(--u))', borderRadius: '999px', background: 'linear-gradient(135deg, #4ade80, #15803d)', border: 'calc(1.2 * var(--u)) solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#042115', fontSize: 'calc(12.5 * var(--u))', fontWeight: 700, flexShrink: 0 } as React.CSSProperties}>
                ✦
              </div>
              <div style={{ whiteSpace: 'nowrap' } as React.CSSProperties}>
                <div id="phone-header-title" style={{ fontSize: 'calc(14.2 * var(--u))', fontWeight: 600, color: '#ffffff', lineHeight: '1.15' } as React.CSSProperties}>{workflowTabContents[activeWorkflowTab]?.phoneTitle || 'Your Business'}</div>
                <div className="flex items-center" style={{ gap: 'calc(6 * var(--u))' } as React.CSSProperties}>
                  <span id="phone-header-status" style={{ fontSize: 'calc(11.2 * var(--u))', color: '#6ee7a8', lineHeight: '1.15' } as React.CSSProperties}>{workflowTabContents[activeWorkflowTab]?.phoneStatus || 'Online'}</span>
                  <button type="button" onClick={resetWorkflowDemo} className="hover:text-emerald-300 transition-colors cursor-pointer bg-transparent border-0 p-0" title="Reset Demo Flow" style={{ fontSize: 'calc(10.5 * var(--u))', color: 'rgba(167, 243, 208, 0.65)' } as React.CSSProperties}>↺</button>
                </div>
              </div>
            </div>

            {/* Incoming Consultation Message Bubble */}
            <div
              id="phone-incoming-bubble"
              className="flex items-baseline justify-between"
              style={{ marginTop: 'calc(13 * var(--u))', marginLeft: 'calc(22 * var(--u))', width: 'calc(248 * var(--u))', background: 'linear-gradient(90deg, rgba(220, 242, 231, 0.95) 0%, rgba(182, 218, 200, 0.93) 100%)', color: '#052316', borderRadius: 'calc(12 * var(--u))', padding: 'calc(8 * var(--u)) calc(12 * var(--u))', boxShadow: '0 calc(5 * var(--u)) calc(16 * var(--u)) rgba(0,0,0,0.38)', whiteSpace: 'nowrap' } as React.CSSProperties}
            >
              <span id="phone-incoming-text" style={{ fontSize: 'calc(12.8 * var(--u))', fontWeight: 600 } as React.CSSProperties}>{workflowTabContents[activeWorkflowTab]?.incomingText || 'Hi! Can I book a consultation?'}</span>
              <span style={{ fontSize: 'calc(9.5 * var(--u))', color: 'rgba(5, 35, 22, 0.7)', marginLeft: 'calc(6 * var(--u))', flexShrink: 0 } as React.CSSProperties}>9:42 AM</span>
            </div>

            {/* Outgoing Slot Selection Card inside Phone */}
            <div
              style={{ marginTop: 'calc(11 * var(--u))', width: 'calc(272 * var(--u))', background: 'rgba(9, 34, 24, 0.84)', border: 'calc(1.2 * var(--u)) solid rgba(110, 231, 183, 0.4)', borderRadius: 'calc(15 * var(--u))', padding: 'calc(10 * var(--u)) calc(14 * var(--u))', boxShadow: '0 0 calc(24 * var(--u)) rgba(52, 211, 153, 0.22)' } as React.CSSProperties}
            >
              <div id="phone-bot-prompt" style={{ fontSize: 'calc(13.4 * var(--u))', fontWeight: 600, color: '#ffffff', marginBottom: 'calc(9 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
                {workflowTabContents[activeWorkflowTab]?.promptText || 'Sure! Here are the available slots:'}
              </div>

              <div className="flex flex-col" style={{ gap: 'calc(6.5 * var(--u))' } as React.CSSProperties}>
                <button
                  type="button"
                  data-slot="Tue, 10:00 AM"
                  onClick={() => selectTimeSlot('Tue, 10:00 AM')}
                  className={`wa-slot-pill phone-slot-btn flex items-center justify-center rounded-full ${selectedSlot === 'Tue, 10:00 AM' ? 'active' : ''}`}
                  style={{ height: 'calc(28 * var(--u))', fontSize: 'calc(12.8 * var(--u))', fontWeight: 500 } as React.CSSProperties}
                >
                  Tue, 10:00 AM
                </button>
                <button
                  type="button"
                  data-slot="Tue, 2:00 PM"
                  onClick={() => selectTimeSlot('Tue, 2:00 PM')}
                  className={`wa-slot-pill phone-slot-btn flex items-center justify-center rounded-full ${selectedSlot === 'Tue, 2:00 PM' ? 'active' : ''}`}
                  style={{ height: 'calc(28 * var(--u))', fontSize: 'calc(12.8 * var(--u))', fontWeight: 500 } as React.CSSProperties}
                >
                  Tue, 2:00 PM
                </button>
                <button
                  type="button"
                  data-slot="Wed, 11:00 AM"
                  onClick={() => selectTimeSlot('Wed, 11:00 AM')}
                  className={`wa-slot-pill phone-slot-btn flex items-center justify-center rounded-full ${selectedSlot === 'Wed, 11:00 AM' ? 'active' : ''}`}
                  style={{ height: 'calc(28 * var(--u))', fontSize: 'calc(12.8 * var(--u))', fontWeight: 500 } as React.CSSProperties}
                >
                  Wed, 11:00 AM
                </button>
              </div>
            </div>
          </div>

          {/* Glowing Energy Connector Beam from Phone to Booking Confirmed Card */}
          <svg
            className="pos pointer-events-none animate-pulse-glow"
            style={{ '--x': 862, '--y': 1522, '--w': 172, '--h': 146 } as React.CSSProperties}
            viewBox="862 1522 172 146"
            fill="none"
          >
            <path d="M868 1628 C 925 1628, 952 1551, 1024 1551" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="1024" cy="1551" r="4.5" fill="#bbf7d0"/>
          </svg>

          {/* RIGHT FLOATING CARD: BOOKING CONFIRMED (left: 1023, top: 1460, w: 285, h: 182) */}
          <div
            id="action-confirmed-card"
            className="pos glass-shell flex flex-col items-center justify-center text-center"
            style={{ '--x': 1023, '--y': 1460, '--w': 285, '--h': 182, borderRadius: 'calc(22 * var(--u))', padding: 'calc(20 * var(--u))' } as React.CSSProperties}
          >
            {/* Glowing Checkmark Circle */}
            <div
              style={{ width: 'calc(48 * var(--u))', height: 'calc(48 * var(--u))', borderRadius: '999px', background: 'radial-gradient(circle at 35% 30%, rgba(74, 222, 128, 0.45) 0%, rgba(16, 185, 129, 0.2) 100%)', border: 'calc(2 * var(--u)) solid #6ee7b7', boxShadow: '0 0 calc(22 * var(--u)) rgba(74, 222, 128, 0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'calc(12 * var(--u))' } as React.CSSProperties}
            >
              <svg style={{ width: 'calc(24 * var(--u))', height: 'calc(24 * var(--u))', color: '#a7f3d0' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div id="confirmed-card-title" style={{ fontSize: 'calc(20 * var(--u))', fontWeight: 600, color: '#ffffff', letterSpacing: 'calc(-0.3 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
              {workflowTabContents[activeWorkflowTab]?.confirmedTitle || 'Booking Confirmed'}
            </div>

            <div className="flex items-center justify-center" style={{ marginTop: 'calc(8 * var(--u))', gap: 'calc(7 * var(--u))', fontSize: 'calc(15 * var(--u))', color: 'rgba(205, 238, 220, 0.9)', whiteSpace: 'nowrap' } as React.CSSProperties}>
              <svg style={{ width: 'calc(16 * var(--u))', height: 'calc(16 * var(--u))', color: '#6ee7b7' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span id="confirmed-card-slot">{selectedSlot}</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: CORE CAPABILITIES ("Everything you need, working together.")   */}
        {/* ========================================================================= */}
        <section id="capabilities-section" style={{ position: 'relative', zIndex: 15 } as React.CSSProperties}>
          <div
            className="pos-auto uppercase"
            style={{ '--x': 85, '--y': 1706, fontSize: 'calc(12.2 * var(--u))', fontWeight: 600, letterSpacing: 'calc(1.9 * var(--u))', color: '#6ee7a8', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            CORE CAPABILITIES
          </div>

          <h2
            className="pos-auto font-editorial m-0"
            style={{ '--x': 85, '--y': 1726, fontSize: 'calc(39 * var(--u))', fontWeight: 400, lineHeight: '1.08', color: '#f4fbf7', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            Everything you need, working together.
          </h2>

          {/* 6 CORE CAPABILITY GLASS CARDS ON GLOWING PEDESTALS */}
          {/* Cap 1: 24/7 WhatsApp Bookings */}
          <button
            type="button"
            onClick={() => openCapabilityDetail(0)}
            className="pos glass-shell flex flex-col items-center justify-center text-center cursor-pointer group"
            style={{ '--x': 129, '--y': 1787, '--w': 162.5, '--h': 125, borderRadius: 'calc(16 * var(--u))', padding: 'calc(12 * var(--u))' } as React.CSSProperties}
          >
            <svg className="group-hover:scale-110 transition-transform" style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))', color: '#6ee7b7', marginBottom: 'calc(9 * var(--u))', filter: 'drop-shadow(0 0 calc(8 * var(--u)) rgba(74,222,128,0.5))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              <path d="M9.5 9.5c.3.8 1.1 1.8 2.1 2.3.4.2.8.1 1-.2l.5-.6c.2-.2.5-.3.8-.1l1.2.6c.3.2.4.5.3.8-.2.8-.9 1.3-1.7 1.3-2.4 0-5.2-2.7-5.2-5.1 0-.8.5-1.5 1.3-1.7.3-.1.6 0 .8.3l.6 1.2c.1.3.1.6-.1.8l-.6.4z" fill="currentColor" stroke="none"/>
            </svg>
            <span style={{ fontSize: 'calc(13.6 * var(--u))', lineHeight: '1.24', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>
              24/7 WhatsApp<br/>Bookings
            </span>
          </button>

          {/* Cap 2: No-Show Prevention */}
          <button
            type="button"
            onClick={() => openCapabilityDetail(1)}
            className="pos glass-shell flex flex-col items-center justify-center text-center cursor-pointer group"
            style={{ '--x': 336, '--y': 1787, '--w': 162.5, '--h': 125, borderRadius: 'calc(16 * var(--u))', padding: 'calc(12 * var(--u))' } as React.CSSProperties}
          >
            <svg className="group-hover:scale-110 transition-transform" style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))', color: '#6ee7b7', marginBottom: 'calc(9 * var(--u))', filter: 'drop-shadow(0 0 calc(8 * var(--u)) rgba(74,222,128,0.5))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{ fontSize: 'calc(13.6 * var(--u))', lineHeight: '1.24', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>
              No-Show<br/>Prevention
            </span>
          </button>

          {/* Cap 3: Google Review Booster */}
          <button
            type="button"
            onClick={() => openCapabilityDetail(2)}
            className="pos glass-shell flex flex-col items-center justify-center text-center cursor-pointer group"
            style={{ '--x': 544, '--y': 1787, '--w': 162.5, '--h': 125, borderRadius: 'calc(16 * var(--u))', padding: 'calc(12 * var(--u))' } as React.CSSProperties}
          >
            <svg className="group-hover:scale-110 transition-transform" style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))', color: '#6ee7b7', marginBottom: 'calc(9 * var(--u))', filter: 'drop-shadow(0 0 calc(8 * var(--u)) rgba(74,222,128,0.5))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize: 'calc(13.6 * var(--u))', lineHeight: '1.24', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>
              Google<br/>Review Booster
            </span>
          </button>

          {/* Cap 4: Staff Calendar Sync */}
          <button
            type="button"
            onClick={() => openCapabilityDetail(3)}
            className="pos glass-shell flex flex-col items-center justify-center text-center cursor-pointer group"
            style={{ '--x': 752, '--y': 1787, '--w': 162.5, '--h': 125, borderRadius: 'calc(16 * var(--u))', padding: 'calc(12 * var(--u))' } as React.CSSProperties}
          >
            <svg className="group-hover:scale-110 transition-transform" style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))', color: '#6ee7b7', marginBottom: 'calc(9 * var(--u))', filter: 'drop-shadow(0 0 calc(8 * var(--u)) rgba(74,222,128,0.5))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              <circle cx="9" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: 'calc(13.6 * var(--u))', lineHeight: '1.24', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>
              Staff<br/>Calendar Sync
            </span>
          </button>

          {/* Cap 5: WhatsApp Intake Forms */}
          <button
            type="button"
            onClick={() => openCapabilityDetail(4)}
            className="pos glass-shell flex flex-col items-center justify-center text-center cursor-pointer group"
            style={{ '--x': 958, '--y': 1787, '--w': 162.5, '--h': 125, borderRadius: 'calc(16 * var(--u))', padding: 'calc(12 * var(--u))' } as React.CSSProperties}
          >
            <svg className="group-hover:scale-110 transition-transform" style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))', color: '#6ee7b7', marginBottom: 'calc(9 * var(--u))', filter: 'drop-shadow(0 0 calc(8 * var(--u)) rgba(74,222,128,0.5))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span style={{ fontSize: 'calc(13.6 * var(--u))', lineHeight: '1.24', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>
              WhatsApp<br/>Intake Forms
            </span>
          </button>

          {/* Cap 6: Unified Service CRM & Audit Trail */}
          <button
            type="button"
            onClick={() => openCapabilityDetail(5)}
            className="pos glass-shell flex flex-col items-center justify-center text-center cursor-pointer group"
            style={{ '--x': 1165, '--y': 1787, '--w': 162.5, '--h': 125, borderRadius: 'calc(16 * var(--u))', padding: 'calc(12 * var(--u))' } as React.CSSProperties}
          >
            <svg className="group-hover:scale-110 transition-transform" style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))', color: '#6ee7b7', marginBottom: 'calc(9 * var(--u))', filter: 'drop-shadow(0 0 calc(8 * var(--u)) rgba(74,222,128,0.5))' } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 12 12 17 22 12"/>
              <polyline points="2 17 12 22 22 17"/>
            </svg>
            <span style={{ fontSize: 'calc(13.2 * var(--u))', lineHeight: '1.24', fontWeight: 500, color: '#f0fdf6' } as React.CSSProperties}>
              Unified Service<br/>CRM &amp; Audit Trail
            </span>
          </button>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: SIMPLE, PREDICTABLE PRICING (y: 2010..2310)                    */}
        {/* ========================================================================= */}
        <section id="pricing-section" style={{ position: 'relative', zIndex: 15 } as React.CSSProperties}>
          {/* Left Eyebrow & Heading */}
          <div
            className="pos-auto uppercase"
            style={{ '--x': 88, '--y': 2040, fontSize: 'calc(12.2 * var(--u))', fontWeight: 600, letterSpacing: 'calc(1.9 * var(--u))', color: '#6ee7a8', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            SIMPLE, PREDICTABLE PRICING
          </div>

          <h2
            className="pos-auto font-editorial m-0"
            style={{ '--x': 88, '--y': 2062, fontSize: 'calc(44 * var(--u))', fontWeight: 400, lineHeight: '1.05', color: '#f4fbf7', whiteSpace: 'nowrap' } as React.CSSProperties}
          >
            Choose the right plan<br/>
            for your business.
          </h2>

          {/* Bottom Left 3 Trust Badges (top: 2236) */}
          {/* Trust Badge 1 */}
          <div className="pos-auto flex items-center" style={{ '--x': 88, '--y': 2236, gap: 'calc(11 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <svg style={{ width: 'calc(30 * var(--u))', height: 'calc(30 * var(--u))', color: '#6ee7b7', flexShrink: 0 } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <span style={{ fontSize: 'calc(12.8 * var(--u))', lineHeight: '1.26', fontWeight: 500, color: 'rgba(226, 246, 236, 0.92)' } as React.CSSProperties}>
              Zero Double-Booking<br/>Guarantee
            </span>
          </div>

          {/* Trust Badge 2 */}
          <div className="pos-auto flex items-center" style={{ '--x': 285, '--y': 2236, gap: 'calc(11 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <svg style={{ width: 'calc(31 * var(--u))', height: 'calc(31 * var(--u))', color: '#6ee7b7', flexShrink: 0 } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontSize: 'calc(12.8 * var(--u))', lineHeight: '1.26', fontWeight: 500, color: 'rgba(226, 246, 236, 0.92)' } as React.CSSProperties}>
              100% Direct<br/>Client Ownership
            </span>
          </div>

          {/* Trust Badge 3 */}
          <div className="pos-auto flex items-center" style={{ '--x': 469, '--y': 2236, gap: 'calc(11 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
            <svg style={{ width: 'calc(30 * var(--u))', height: 'calc(30 * var(--u))', color: '#6ee7b7', flexShrink: 0 } as React.CSSProperties} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 12 12 17 22 12"/>
              <polyline points="2 17 12 22 22 17"/>
            </svg>
            <span style={{ fontSize: 'calc(12.8 * var(--u))', lineHeight: '1.26', fontWeight: 500, color: 'rgba(226, 246, 236, 0.92)' } as React.CSSProperties}>
              Predictable<br/>Flat-Rate Pricing
            </span>
          </div>

          {/* PRICING CARD 1: SOLO / SMALL BUSINESS (left: 647, top: 2014, w: 336, h: 270) */}
          <div
            id="pricing-card-solo"
            className="pos glass-shell"
            style={{ '--x': 647, '--y': 2014, '--w': 336, '--h': 270, borderRadius: 'calc(24 * var(--u))', padding: 'calc(28 * var(--u)) calc(32 * var(--u))' } as React.CSSProperties}
          >
            <div style={{ fontSize: 'calc(18.5 * var(--u))', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' } as React.CSSProperties}>
              Solo / Small Business
            </div>

            <div className="flex items-baseline" style={{ marginTop: 'calc(12 * var(--u))', gap: 'calc(6 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
              <span style={{ fontSize: 'calc(42 * var(--u))', fontWeight: 700, color: '#ffffff', letterSpacing: 'calc(-1 * var(--u))', lineHeight: '1' } as React.CSSProperties}>$29</span>
              <span style={{ fontSize: 'calc(15 * var(--u))', color: 'rgba(190, 228, 208, 0.88)' } as React.CSSProperties}>/ month</span>
            </div>

            <p className="m-0" style={{ marginTop: 'calc(14 * var(--u))', fontSize: 'calc(14 * var(--u))', lineHeight: '1.42', color: 'rgba(210, 234, 222, 0.85)' } as React.CSSProperties}>
              Everything you need to run bookings, customers, and operations in one place.
            </p>

            <button
              id="btn-plan-solo"
              type="button"
              onClick={() => openModal('signup', 'Solo / Small Business — $29/mo')}
              className="btn-mint-pill flex items-center justify-center rounded-full"
              style={{ marginTop: 'calc(22 * var(--u))', width: 'calc(184 * var(--u))', height: 'calc(44 * var(--u))', fontSize: 'calc(15 * var(--u))', gap: 'calc(7 * var(--u))' } as React.CSSProperties}
            >
              <span>Get Started</span>
              <span>→</span>
            </button>
          </div>

          {/* PRICING CARD 2: MULTI-PROVIDER GROUP (left: 1015, top: 2014, w: 336, h: 270) */}
          <div
            id="pricing-card-group"
            className="pos glass-shell"
            style={{ '--x': 1015, '--y': 2014, '--w': 336, '--h': 270, borderRadius: 'calc(24 * var(--u))', padding: 'calc(28 * var(--u)) calc(32 * var(--u))' } as React.CSSProperties}
          >
            <div style={{ fontSize: 'calc(18.5 * var(--u))', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' } as React.CSSProperties}>
              Multi-Provider Group
            </div>

            <div className="flex items-baseline" style={{ marginTop: 'calc(12 * var(--u))', gap: 'calc(6 * var(--u))', whiteSpace: 'nowrap' } as React.CSSProperties}>
              <span style={{ fontSize: 'calc(42 * var(--u))', fontWeight: 700, color: '#ffffff', letterSpacing: 'calc(-1 * var(--u))', lineHeight: '1' } as React.CSSProperties}>$99</span>
              <span style={{ fontSize: 'calc(15 * var(--u))', color: 'rgba(190, 228, 208, 0.88)' } as React.CSSProperties}>/ month</span>
            </div>

            <p className="m-0" style={{ marginTop: 'calc(14 * var(--u))', fontSize: 'calc(14 * var(--u))', lineHeight: '1.42', color: 'rgba(210, 234, 222, 0.85)' } as React.CSSProperties}>
              Built for teams with multiple providers, calendars, and higher booking volume.
            </p>

            <button
              id="btn-plan-group"
              type="button"
              onClick={() => openModal('signup', 'Multi-Provider Group — $99/mo')}
              className="btn-mint-pill flex items-center justify-center rounded-full"
              style={{ marginTop: 'calc(22 * var(--u))', width: 'calc(184 * var(--u))', height: 'calc(44 * var(--u))', fontSize: 'calc(15 * var(--u))', gap: 'calc(7 * var(--u))' } as React.CSSProperties}
            >
              <span>Get Started</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LAYER 30: X-RAY REFERENCE OVERLAY (FOR PIXEL-PERFECT VERIFICATION)        */}
        {/* ========================================================================= */}
        <img
          id="xray-ref-img"
          src="/assets/starx_ref_orig.webp"
          alt="Design Reference X-Ray Layer"
          className="pos pointer-events-none select-none transition-opacity duration-200"
          style={{
            '--x': 0,
            '--y': 0,
            '--w': 1440,
            '--h': 2362,
            zIndex: 2,
            objectFit: 'cover',
            opacity: renderMode === 'hybrid' ? (xrayOpacity / 100) : 0,
            pointerEvents: 'none'
          } as React.CSSProperties}
        />

      </div>
    </main>
  </div>

  {/* =========================================================================== */}
  {/* EXPANDED 12-SCENE LEGACY CONTENT RESTORATION IN EMERALD LIQUID GLASS        */}
  {/* Preserves 100% of verified copy from https://starx-flow.runs-on.dev         */}
  {/* =========================================================================== */}
  <div id="starx-extended-scenes" className="emerald-sanctuary-ext text-emerald-50">

    {/* Sticky Scene Jump Bar for Rapid Inspection of All 12 Restored Scenes */}
    <div className="sticky top-0 z-40 border-b border-emerald-500/20 bg-[#020c08]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-emerald-300 uppercase tracking-wider">12-Scene Complete Product Story:</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a href="#hero-section" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">01 Hero</a>
          <a href="#scene-legacy-hero-bridge" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">01B Autopilot &amp; Integrations</a>
          <a href="#scene-revenue-leakage" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">02 $48,590 Leakage &amp; ROI</a>
          <a href="#challenge-section" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">03 Connected Hub</a>
          <a href="#scene-onboarding" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">04 10-Min Onboarding</a>
          <a href="#action-section" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">05 Live Workflows</a>
          <a href="#scene-operational-excellence" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">06 Operational Excellence</a>
          <a href="#scene-customer-segments" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">07 Solo vs. Groups</a>
          <a href="#scene-guarantees" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">08 &amp; 10 Guarantees</a>
          <a href="#scene-pricing-comparison" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">09 Full Pricing ($29/$59/$99)</a>
          <a href="#scene-faq" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">11 FAQ</a>
          <a href="#scene-final-cta-footer" className="px-2.5 py-1 rounded-full hover:bg-emerald-500/20 text-emerald-100/85 hover:text-white transition-colors">12 Footer</a>
        </div>
      </div>
    </div>

    {/* ========================================================================= */}
    {/* SCENE 01B & 01C: LEGACY HERO POSITIONING, SARAH K. DEMO & INTEGRATIONS    */}
    {/* ========================================================================= */}
    <section id="scene-legacy-hero-bridge" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Restored Legacy Hero Messaging & Social Proof */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-400/35 bg-emerald-950/60 text-xs font-semibold text-emerald-300 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Autonomous Front Desk</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-[1.02] tracking-tight">
            Your front desk,<br/>
            <span className="text-emerald-300 font-semibold">now on autopilot.</span>
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/85 leading-relaxed max-w-xl">
            Automate bookings, capture leads, and reply to every customer instantly — 24/7 on WhatsApp.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => openModal('signup', '14-Day Free Trial')}
              className="px-7 py-3.5 rounded-full font-semibold text-sm text-emerald-950 transition-transform hover:scale-105 cursor-pointer"
              style={{ background: 'linear-gradient(180deg, #bcf8db 0%, #68d89b 50%, #44b87d 100%)', boxShadow: '0 0 28px rgba(74, 222, 128, 0.45)' } as React.CSSProperties}
            >
              Start Free Trial →
            </button>
            <a
              href="#scene-onboarding"
              className="px-6 py-3.5 rounded-full font-medium text-sm text-emerald-100 border border-emerald-400/35 bg-emerald-950/40 hover:border-emerald-300 transition-colors"
            >
              See 10-Minute Setup
            </a>
          </div>

          {/* Social Proof Strip: Trusted by 3,000+ service businesses */}
          <div className="flex items-center gap-3.5 pt-3">
            <div className="flex -space-x-2.5">
              <div className="w-9 h-9 rounded-full border-2 border-[#03120c] bg-gradient-to-br from-emerald-300 to-emerald-700 flex items-center justify-center text-xs font-bold text-emerald-950">SK</div>
              <div className="w-9 h-9 rounded-full border-2 border-[#03120c] bg-gradient-to-br from-teal-200 to-teal-600 flex items-center justify-center text-xs font-bold text-emerald-950">MR</div>
              <div className="w-9 h-9 rounded-full border-2 border-[#03120c] bg-gradient-to-br from-green-300 to-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-950">AL</div>
              <div className="w-9 h-9 rounded-full border-2 border-[#03120c] bg-gradient-to-br from-emerald-200 to-green-600 flex items-center justify-center text-xs font-bold text-emerald-950">JD</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Trusted by 3,000+ service businesses</div>
              <div className="text-xs text-emerald-300/80">Clinics, salons, gyms, spas &amp; solo practitioners worldwide</div>
            </div>
          </div>
        </div>

        {/* Right: Restored AI Receptionist Massage Demo Widget */}
        <div className="lg:col-span-6">
          <div className="spatial-glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 flex items-center justify-center text-emerald-950 font-bold text-sm shadow-[0_0_16px_rgba(74,222,128,0.6)]">
                  AI
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">AI Receptionist</div>
                  <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Online • Operating normally</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                Sub-2s Response
              </span>
            </div>

            {/* Conversation Thread */}
            <div id="sarah-demo-thread" className="space-y-3.5 my-5 text-sm">
              {sarahMessages.map((msg, idx) => (
                <div
                  key={`sarah-msg-${idx}`}
                  className={
                    msg.sender === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-tl-sm bg-[#061c14]/90 border border-emerald-500/25 px-4 py-3 text-emerald-50 text-xs sm:text-sm'
                      : 'max-w-[88%] ml-auto rounded-2xl rounded-tr-sm bg-emerald-900/50 border border-emerald-400/40 px-4 py-3 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] text-xs sm:text-sm'
                  }
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              ))}
            </div>

            {/* Interactive Reply Simulation Input */}
            <form id="sarah-demo-form" onSubmit={handleSarahDemoReply} className="flex items-center gap-2 mt-3">
              <input
                id="sarah-demo-input"
                type="text"
                value={sarahInput}
                onChange={(e) => setSarahInput(e.target.value)}
                placeholder="Message AI Receptionist... (e.g. Book 2:00 PM please)"
                className="flex-1 rounded-full bg-[#04150f]/90 border border-emerald-500/30 px-4 py-2.5 text-xs text-white placeholder-emerald-200/45 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer shrink-0"
              >
                Send
              </button>
            </form>

            {/* Confirmed Appointment Toast Strip inside Widget */}
            <div
              id="sarah-demo-confirmed-banner"
              className="mt-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/45 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-100"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 font-bold inline-flex items-center justify-center">✓</span>
                <span id="sarah-demo-confirmed-text" className="font-semibold">{sarahConfirmedText}</span>
              </div>
              <span className="text-[11px] text-emerald-300 font-mono">Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 01C: Verified Platform Integrations & Security Architecture Bar */}
      <div id="scene-integrations" className="mt-14 spatial-glass-card rounded-3xl p-6 sm:p-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow-emerald">Engineered for Independent Service &amp; Appointment Businesses</div>
          <p className="text-sm text-emerald-100/80 mt-2">
            Verified platform integrations include Meta WhatsApp Cloud API, Google Calendar, Microsoft Graph Calendar, Instagram Graph API, Stripe, and Supabase.
          </p>
        </div>

        {/* 6 Verified Integration Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="rounded-xl bg-[#041610]/80 border border-emerald-500/25 px-3.5 py-2.5 text-center text-xs font-medium text-emerald-100">Meta WhatsApp Cloud API</div>
          <div className="rounded-xl bg-[#041610]/80 border border-emerald-500/25 px-3.5 py-2.5 text-center text-xs font-medium text-emerald-100">Google Calendar API</div>
          <div className="rounded-xl bg-[#041610]/80 border border-emerald-500/25 px-3.5 py-2.5 text-center text-xs font-medium text-emerald-100">Microsoft Graph Calendar</div>
          <div className="rounded-xl bg-[#041610]/80 border border-emerald-500/25 px-3.5 py-2.5 text-center text-xs font-medium text-emerald-100">Instagram Graph API</div>
          <div className="rounded-xl bg-[#041610]/80 border border-emerald-500/25 px-3.5 py-2.5 text-center text-xs font-medium text-emerald-100">Stripe Hosted Checkout</div>
          <div className="rounded-xl bg-[#041610]/80 border border-emerald-500/25 px-3.5 py-2.5 text-center text-xs font-medium text-emerald-100">Supabase Row Level Security</div>
        </div>

        {/* 4 Core Security & Commercial Trust Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-500/20">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300">
            <span>✦</span><span>0% Booking Commission</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300">
            <span>✦</span><span>Concurrency Exclusion Locks</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300">
            <span>✦</span><span>100% Direct Client Ownership</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300">
            <span>✦</span><span>TLS 1.3 &amp; At-Rest Encryption</span>
          </div>
        </div>
      </div>
    </section>

    <div className="spatial-pedestal-line max-w-5xl mx-auto"></div>

    {/* ========================================================================= */}
    {/* SCENE 02B: BUSINESS PROBLEMS, $48,590 REVENUE LEAKAGE & ROI CALCULATOR    */}
    {/* ========================================================================= */}
    <section id="scene-revenue-leakage" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Your front desk is leaking revenue + 3 Numbered Problems */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="eyebrow-emerald">The Daily Revenue Drain</div>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white mt-2 leading-tight">
              Your front desk is leaking revenue.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
              When you are treating a patient, teaching a class, or styling hair, unanswered calls and late text replies go straight to your competitors.
            </p>
          </div>

          <div className="space-y-4">
            <div className="spatial-glass-card rounded-2xl p-5 flex items-start gap-4">
              <span className="font-editorial text-3xl font-semibold text-emerald-400 leading-none shrink-0">01</span>
              <div>
                <h3 className="text-base font-semibold text-white">Missed Bookings</h3>
                <p className="text-sm text-emerald-100/80 mt-1 leading-relaxed">
                  Over 62% of calls to local businesses go unanswered during busy hours or after-hours, leading directly to lost clients.
                </p>
              </div>
            </div>

            <div className="spatial-glass-card rounded-2xl p-5 flex items-start gap-4">
              <span className="font-editorial text-3xl font-semibold text-emerald-400 leading-none shrink-0">02</span>
              <div>
                <h3 className="text-base font-semibold text-white">Juggling Admin Tasks</h3>
                <p className="text-sm text-emerald-100/80 mt-1 leading-relaxed">
                  Manually managing booking links, reminder texts, calendar syncs, and intake forms wastes hours of high-value staff time.
                </p>
              </div>
            </div>

            <div className="spatial-glass-card rounded-2xl p-5 flex items-start gap-4">
              <span className="font-editorial text-3xl font-semibold text-emerald-400 leading-none shrink-0">03</span>
              <div>
                <h3 className="text-base font-semibold text-white">Leaked Leads</h3>
                <p className="text-sm text-emerald-100/80 mt-1 leading-relaxed">
                  No automated follow-ups to convert class trial signups, rescue no-shows, or consistently gather 5-star Google reviews.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: $48,590 Monument Card + Interactive ROI Recovery Calculator */}
        <div className="lg:col-span-5 space-y-6">
          {/* $48,590 Verified Statistic Monument */}
          <div className="spatial-glass-card rounded-3xl p-7 text-center border-emerald-400/45 relative overflow-hidden">
            <div className="eyebrow-emerald">Verified Industry Impact</div>
            <div className="font-editorial text-6xl sm:text-7xl font-bold text-white mt-2 tracking-tight drop-shadow-[0_0_25px_rgba(74,222,128,0.45)]">
              $48,590
            </div>
            <p className="text-sm text-emerald-200/90 mt-2 font-medium">
              Average annual revenue lost to missed calls and no-shows
            </p>
          </div>

          {/* Interactive Lead & Time Recovery ROI Calculator (from /pricing) */}
          <div className="spatial-glass-card rounded-3xl p-6 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Lead &amp; Time Recovery ROI Calculator</div>
              <p className="text-xs text-emerald-100/75 mt-1">
                Estimate how much revenue and admin time StarX Flow will reclaim for you.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <label htmlFor="roi-session-val" className="text-emerald-100">Average Session Value</label>
                <span id="roi-session-readout" className="text-emerald-300 font-bold">{`${roiSessionVal}`}</span>
              </div>
              <input
                id="roi-session-val"
                type="range"
                min={30}
                max={300}
                step={5}
                value={roiSessionVal}
                onChange={(e) => setRoiSessionVal(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-emerald-200/60">
                <span>$30</span><span>$150</span><span>$300</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <label htmlFor="roi-missed-calls" className="text-emerald-100">Est. Missed Calls / Month</label>
                <span id="roi-missed-readout" className="text-emerald-300 font-bold">{`${roiMissedCalls} inquiries`}</span>
              </div>
              <input
                id="roi-missed-calls"
                type="range"
                min={5}
                max={100}
                step={1}
                value={roiMissedCalls}
                onChange={(e) => setRoiMissedCalls(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-emerald-200/60">
                <span>5 leads</span><span>50 leads</span><span>100 leads</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl bg-[#041710]/90 border border-emerald-400/35 p-3.5">
                <div className="text-[11px] text-emerald-300">Est. Monthly Recovery</div>
                <div id="roi-monthly-recovery" className="font-editorial text-2xl font-semibold text-emerald-300">{`${roiMonthlyRecovery.toLocaleString()}`}</div>
                <div className="text-[10px] text-emerald-200/70 mt-1">Conservative 75% capture rate via WhatsApp AI assistant.</div>
              </div>
              <div className="rounded-2xl bg-[#041710]/90 border border-emerald-400/35 p-3.5">
                <div className="text-[11px] text-emerald-300">Staff Hours Saved</div>
                <div id="roi-hours-saved" className="font-editorial text-2xl font-semibold text-emerald-300">{`${roiHoursSaved} hrs`}</div>
                <div className="text-[10px] text-emerald-200/70 mt-1">Saves 1.5 hours of reminders &amp; callbacks per lead.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div className="spatial-pedestal-line max-w-5xl mx-auto"></div>

    {/* ========================================================================= */}
    {/* SCENE 04: THREE-STAGE ARCHITECTURAL GLASS ONBOARDING (< 10 MINUTES)       */}
    {/* ========================================================================= */}
    <section id="scene-onboarding" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="eyebrow-emerald">Onboarding Setup</div>
        <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white mt-2">
          Launch in under 10 minutes.
        </h2>
        <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
          You don't need an engineering team to automate your front desk. We've built an operational workflow that integrates directly into your day-to-day.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {/* Step 01 */}
        <div className="spatial-glass-card rounded-3xl p-7 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="font-editorial text-5xl font-semibold text-emerald-400/90">01</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">2 Clicks</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Connect Your Calendars</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Sync Google Calendar, Outlook, and your POS systems in just two clicks. Keep your staff availability synchronized in real-time.
          </p>
        </div>

        {/* Step 02 */}
        <div className="spatial-glass-card rounded-3xl p-7 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="font-editorial text-5xl font-semibold text-emerald-400/90">02</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">&lt; 5 Minutes</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Configure Services</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Input your service menus, pricing, team rosters, and common questions. Our AI trains on your exact operational rules in under 5 minutes.
          </p>
        </div>

        {/* Step 03 */}
        <div className="spatial-glass-card rounded-3xl p-7 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="font-editorial text-5xl font-semibold text-emerald-400/90">03</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">24/7 Live</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Activate AI Receptionist</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Launch your custom 24/7 WhatsApp AI receptionist. Instantly capture incoming leads, schedule appointments, and follow up.
          </p>
        </div>
      </div>
    </section>

    <div className="spatial-pedestal-line max-w-5xl mx-auto"></div>

    {/* ========================================================================= */}
    {/* SCENE 06B: ENGINEERED FOR OPERATIONAL EXCELLENCE (FULL EXPLANATIONS)      */}
    {/* ========================================================================= */}
    <section id="scene-operational-excellence" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="eyebrow-emerald">Core Capabilities — Complete Specification</div>
        <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white mt-2">
          Engineered for Operational Excellence.
        </h2>
        <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
          Stop losing leads to manual administration. Let AI and native automation scale your booking capacity and drive repeat visits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <div className="spatial-glass-card rounded-3xl p-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 font-bold mb-4">01</div>
          <h3 className="text-lg font-semibold text-white">24/7 WhatsApp Bookings</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Enable clients to schedule, reschedule, or cancel slots late at night when your front desk is closed.
          </p>
        </div>

        <div className="spatial-glass-card rounded-3xl p-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 font-bold mb-4">02</div>
          <h3 className="text-lg font-semibold text-white">No-Show Prevention</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Auto-send smart confirmation invites and 24-hour reminders directly over WhatsApp to secure bookings.
          </p>
        </div>

        <div className="spatial-glass-card rounded-3xl p-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 font-bold mb-4">03</div>
          <h3 className="text-lg font-semibold text-white">Google Review Booster</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Automatically follow up with clients post-session to request 5-star reviews and increase search rankings.
          </p>
        </div>

        <div className="spatial-glass-card rounded-3xl p-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 font-bold mb-4">04</div>
          <h3 className="text-lg font-semibold text-white">Staff Calendar Sync</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Real-time, two-way sync with Google Calendar and Microsoft Outlook across all staff members.
          </p>
        </div>

        <div className="spatial-glass-card rounded-3xl p-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 font-bold mb-4">05</div>
          <h3 className="text-lg font-semibold text-white">WhatsApp Intake Forms</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Deliver digital waiver links, health questionnaires, and gym registration forms automatically prior to visits.
          </p>
        </div>

        <div className="spatial-glass-card rounded-3xl p-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 font-bold mb-4">06</div>
          <h3 className="text-lg font-semibold text-white">Unified Service CRM</h3>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            Aggregate client session histories, staff notes, and scheduling labels in a beautiful unified dashboard.
          </p>
        </div>
      </div>
    </section>

    <div className="spatial-pedestal-line max-w-5xl mx-auto"></div>

    {/* ========================================================================= */}
    {/* SCENE 07: CUSTOMER SEGMENTS & USE CASES (SOLO VS. GROWING PRACTICES)      */}
    {/* ========================================================================= */}
    <section id="scene-customer-segments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="eyebrow-emerald">Purpose-Built For Your Scale</div>
        <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white mt-2">
          Engineered for Solo Operators and Growing Practices
        </h2>
        <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
          Whether you operate a solo clinic chair or coordinate a multi-staff wellness center, StarX-Flow provides the exact operational infrastructure you need without commission markups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Segment 1: Small Businesses & Solo Practices */}
        <div className="spatial-glass-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">
              Dentists, Salons, Coaches, Solo Therapists
            </div>
            <h3 className="font-editorial text-3xl font-normal text-white mt-3">
              Small Businesses &amp; Solo Practices
            </h3>
            <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
              Eliminate missed appointments when you are busy treating clients. StarX-Flow acts as your full-time digital front desk with zero setup complexity.
            </p>

            <ul className="space-y-3.5 mt-6 text-sm text-emerald-100/90">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">5-Minute Plug-and-Play Setup:</strong> Connect your Google Calendar, paste your services and FAQs, and go live instantly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">0% Booking Commission:</strong> Flat subscription pricing. You keep 100% of your service revenue with zero per-booking penalties.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Direct Chat Booking:</strong> Clients book in seconds on WhatsApp and Instagram without downloading specialized marketplace apps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">24/7 After-Hours Coverage:</strong> Never lose an evening or weekend lead. AI captures and confirms slots while your front office is closed.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-medium text-emerald-200">Starter plan from $29/mo (€29/mo) • 14-day free trial</span>
            <button
              type="button"
              onClick={() => openModal('signup', 'Starter Plan — $29/mo')}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
            >
              Start Free Trial →
            </button>
          </div>
        </div>

        {/* Segment 2: Multi-Provider & Growing Groups */}
        <div className="spatial-glass-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">
              Clinics, Studios, Multi-Location Practices
            </div>
            <h3 className="font-editorial text-3xl font-normal text-white mt-3">
              Multi-Provider &amp; Growing Groups
            </h3>
            <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
              Coordinate complex team schedules, manage room resources, and maintain enterprise data privacy with deterministic concurrency safeguards.
            </p>

            <ul className="space-y-3.5 mt-6 text-sm text-emerald-100/90">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Zero Double-Booking Guarantee:</strong> Database-level PostgreSQL exclusion constraints serialize simultaneous booking requests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">PostgreSQL Row-Level Security:</strong> Cryptographically isolated multi-tenant architecture on Supabase with GDPR export endpoints.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Multi-Staff Roster Synchronization:</strong> Real-time two-way synchronization with Google Calendar and Microsoft Outlook across all team members.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Deterministic Human Escalation:</strong> Intent triggers instantly flag high-priority inquiries and notify human desk staff with full conversation telemetry.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-medium text-emerald-200">Pro plan from $99/mo (€97/mo) • Enterprise RLS security</span>
            <a
              href="#scene-guarantees"
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-emerald-100 border border-emerald-400/45 hover:bg-emerald-500/20 transition-colors"
            >
              Inspect Architecture →
            </a>
          </div>
        </div>
      </div>
    </section>

    <div className="spatial-pedestal-line max-w-5xl mx-auto"></div>

    {/* ========================================================================= */}
    {/* SCENE 08 & 10: PLATFORM GUARANTEES & OPERATIONAL INDEPENDENCE             */}
    {/* ========================================================================= */}
    <section id="scene-guarantees" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="eyebrow-emerald">Platform Guarantees</div>
        <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white mt-2">
          Engineered for trust. Built for operational independence.
        </h2>
        <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
          Independent service businesses depend on precision booking and client trust. Here are the core technical guarantees built into StarX-Flow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {/* Guarantee 1 */}
        <div className="spatial-glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">
              Concurrency Locked
            </span>
            <h3 className="text-xl font-semibold text-white mt-4">Zero Double-Booking Guarantee</h3>
            <p className="text-sm text-emerald-100/80 mt-2.5 leading-relaxed">
              Real-time two-way synchronization with Google Calendar and Microsoft Outlook, reinforced with PostgreSQL exclusion constraint locks at the database engine level to mathematically prevent overlapping slot bookings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal('capability', 'Zero Double-Booking Architecture', 'PostgreSQL GIST exclusion constraints serialize concurrent slot reservations at the database kernel level alongside two-way Google & Outlook calendar webhooks.')}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-transparent border-0 p-0 cursor-pointer"
          >
            <span>View Calendar Architecture</span><span>→</span>
          </button>
        </div>

        {/* Guarantee 2 */}
        <div className="spatial-glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">
              Zero Marketplace Lock-in
            </span>
            <h3 className="text-xl font-semibold text-white mt-4">100% Direct Client Ownership</h3>
            <p className="text-sm text-emerald-100/80 mt-2.5 leading-relaxed">
              Unlike marketplace directories that pool your clients into public aggregators and cross-sell competitors, StarX-Flow stores your contacts, conversations, and appointments in your private tenant database with Row Level Security.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal('capability', 'Tenant-Isolated Security Architecture', 'Every tenant workspace is isolated via Supabase PostgreSQL Row-Level Security [RLS], TLS 1.3 transport encryption, at-rest encryption, and instant GDPR export endpoints.')}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-transparent border-0 p-0 cursor-pointer"
          >
            <span>View Security Architecture</span><span>→</span>
          </button>
        </div>

        {/* Guarantee 3 */}
        <div className="spatial-glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">
              0% Commission Deductions
            </span>
            <h3 className="text-xl font-semibold text-white mt-4">Predictable Flat-Rate Pricing</h3>
            <p className="text-sm text-emerald-100/80 mt-2.5 leading-relaxed">
              StarX-Flow charges a flat monthly software subscription [$29 to $99/mo] with no per-booking fees or hidden percentages. When your clinic, gym, or salon grows, your software bill remains flat and predictable.
            </p>
          </div>
          <a
            href="#scene-pricing-comparison"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white"
          >
            <span>View Transparent Pricing</span><span>→</span>
          </a>
        </div>
      </div>
    </section>

    <div className="spatial-pedestal-line max-w-5xl mx-auto"></div>

    {/* ========================================================================= */}
    {/* SCENE 09B: COMPLETE 3-TIER PRICING COMPARISON ($29 / $59 / $99)           */}
    {/* ========================================================================= */}
    <section id="scene-pricing-comparison" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="eyebrow-emerald">Transparent Pricing — Full Plan Specifications</div>
        <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white mt-2">
          Flat subscriptions. No booking commissions.
        </h2>
        <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
          Choose a plan that matches your booking volume. Save time, recover missed calls, and run a modern front desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {/* Tier 1: Starter ($29/mo) */}
        <div className="spatial-glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Starter (Solo / Small Business)</div>
            <p className="text-xs text-emerald-200/80 mt-1">Ideal for solo wellness, coaching, or beauty practitioners.</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-editorial text-5xl font-bold text-white">$29</span>
              <span className="text-xs text-emerald-200/80">/month • Billed monthly</span>
            </div>
            <ul className="space-y-2.5 mt-6 text-xs text-emerald-100/90">
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>1 WhatsApp AI Receptionist</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Up to 150 bookings/month</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Google Calendar &amp; Outlook Sync</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Standard WhatsApp intake forms</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Basic CRM dashboards</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Email support</span></li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => openModal('signup', 'Starter — $29/month')}
            className="mt-7 w-full py-3 rounded-full text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
          >
            Start 14-Day Trial →
          </button>
        </div>

        {/* Tier 2: Growth ($59/mo - Most Popular) */}
        <div className="spatial-glass-card rounded-3xl p-7 flex flex-col justify-between border-emerald-400/60 relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Growth</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-emerald-950">Most Popular</span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">Best for established gyms, clinics, and multi-staff salons/spas.</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-editorial text-5xl font-bold text-white">$59</span>
              <span className="text-xs text-emerald-200/80">/month • Billed monthly</span>
            </div>
            <ul className="space-y-2.5 mt-6 text-xs text-emerald-100/90">
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>3 WhatsApp AI Receptionists</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Unlimited bookings/month</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Square &amp; Clover POS syncs</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Google Review Booster automation</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Staff calendar utilization logs</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Priority email support</span></li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => openModal('signup', 'Growth — $59/month')}
            className="mt-7 w-full py-3 rounded-full text-xs font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer shadow-[0_0_24px_rgba(74,222,128,0.4)]"
          >
            Start 14-Day Trial →
          </button>
        </div>

        {/* Tier 3: Pro / Multi-Provider Group ($99/mo) */}
        <div className="spatial-glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Pro (Multi-Provider Group)</div>
            <p className="text-xs text-emerald-200/80 mt-1">Best for local franchises and multi-location service groups.</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-editorial text-5xl font-bold text-white">$99</span>
              <span className="text-xs text-emerald-200/80">/month • Billed monthly</span>
            </div>
            <ul className="space-y-2.5 mt-6 text-xs text-emerald-100/90">
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Unlimited AI Receptionists</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Multi-location routing rules</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Dedicated WhatsApp numbers</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>Custom database CRM integrations</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>White-label calendar widgets</span></li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>24/7 dedicated manager support</span></li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => openModal('signup', 'Pro — $99/month')}
            className="mt-7 w-full py-3 rounded-full text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
          >
            Start 14-Day Trial →
          </button>
        </div>
      </div>
    </section>

    <div className="spatial-pedestal-line max-w-5xl mx-auto"></div>

    {/* ========================================================================= */}
    {/* SCENE 11: COMPREHENSIVE GLASS FAQ & 5 CORE DIFFERENTIATORS                */}
    {/* ========================================================================= */}
    <section id="scene-faq" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="eyebrow-emerald">Product Intelligence &amp; FAQs</div>
        <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white mt-2">
          Everything you need to know about StarX-Flow.
        </h2>
      </div>

      <div className="space-y-4 mt-10">
        {/* FAQ 1 */}
        <div className="spatial-glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white">What is StarX-Flow?</h3>
          <p className="text-sm text-emerald-100/85 mt-2 leading-relaxed">
            StarX-Flow is an AI-powered workflow automation platform built for local service businesses. It provides a 24/7 WhatsApp AI receptionist that handles bookings, scheduling, client intake, and customer support automatically — replacing the need for traditional front-desk staff. StarX-Flow integrates with Google Calendar, Outlook, Square POS, and Clover POS for real-time calendar synchronization.
          </p>
        </div>

        {/* FAQ 2 */}
        <div className="spatial-glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white">Who is StarX-Flow designed for?</h3>
          <p className="text-sm text-emerald-100/85 mt-2">
            StarX-Flow is purpose-built for appointment-driven local service businesses, including:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-emerald-200">
            <li className="flex items-center gap-2"><span className="text-emerald-400">•</span><span>Gyms, fitness studios, and personal trainers</span></li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">•</span><span>Medical clinics, dental offices, and physiotherapy practices</span></li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">•</span><span>Hair salons, barber shops, and beauty studios</span></li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">•</span><span>Spas, wellness centers, and pilates/yoga studios</span></li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">•</span><span>Coaching, tutoring, and consulting practices</span></li>
          </ul>
        </div>

        {/* FAQ 3 */}
        <div className="spatial-glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white">How does StarX-Flow work?</h3>
          <p className="text-sm text-emerald-100/85 mt-2">StarX-Flow works in three simple steps:</p>
          <ol className="space-y-2 mt-3 text-xs text-emerald-100/90 list-decimal list-inside">
            <li><strong className="text-white">Connect your calendar</strong> — Sync Google Calendar, Outlook, Square, or Clover in one click.</li>
            <li><strong className="text-white">Configure your AI receptionist</strong> — Enter your services, staff schedule, pricing, and FAQs into the dashboard.</li>
            <li><strong className="text-white">Go live on WhatsApp</strong> — Clients message your WhatsApp number. The AI checks availability, books the slot, collects intake details, and sends calendar confirmations — all in under 2 seconds.</li>
          </ol>
        </div>

        {/* FAQ 4 */}
        <div className="spatial-glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white">Why use StarX-Flow instead of traditional booking systems?</h3>
          <p className="text-sm text-emerald-100/85 mt-2 leading-relaxed">
            Traditional booking systems require clients to visit external websites, create accounts, and navigate complex calendars — leading to high drop-off rates. StarX-Flow eliminates this friction by meeting clients on WhatsApp, the messaging app they already use daily. With flat monthly pricing (no booking commissions), sub-2-second AI response times, and full client data ownership, StarX-Flow helps businesses recover an estimated 75% of previously missed leads while saving 30+ hours per month on admin tasks.
          </p>
        </div>

        {/* FAQ 5 */}
        <div className="spatial-glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white">What makes StarX-Flow different from competitors?</h3>
          <p className="text-sm text-emerald-100/85 mt-2">StarX-Flow stands apart through five key differentiators:</p>
          <ul className="space-y-2 mt-3 text-xs text-emerald-100/90">
            <li><strong className="text-emerald-300">WhatsApp-native:</strong> No app downloads or account creation required for clients</li>
            <li><strong className="text-emerald-300">Zero commissions:</strong> Flat subscription pricing — you keep 100% of your service revenue</li>
            <li><strong className="text-emerald-300">Sub-2-second response:</strong> AI engages leads at peak intent before they move to competitors</li>
            <li><strong className="text-emerald-300">Direct client ownership:</strong> Full CRM with booking history, unlike marketplace aggregators</li>
            <li><strong className="text-emerald-300">Enterprise features for SMBs:</strong> Multi-calendar sync, POS integration, and HIPAA compliance</li>
          </ul>
        </div>

        {/* FAQ 6 (from /pricing) */}
        <div className="spatial-glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white">Do you charge a fee per booking?</h3>
          <p className="text-sm text-emerald-100/85 mt-2 leading-relaxed">
            No. Unlike marketplace schedulers that charge fees or commissions per client booked, we charge a simple flat monthly subscription. You keep 100% of your service revenue.
          </p>
        </div>
      </div>
    </section>

    {/* ========================================================================= */}
    {/* SCENE 12: FINAL CONVERSION CALL & COMPLETE MULTI-COLUMN FOOTER            */}
    {/* ========================================================================= */}
    <section id="scene-final-cta-footer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Final Conversion Banner */}
      <div className="spatial-glass-card rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto border-emerald-400/45">
        <div className="eyebrow-emerald">Final Call</div>
        <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-white mt-2 leading-tight">
          Stop losing clients to<br/>
          <span className="text-emerald-300">unanswered calls.</span>
        </h2>
        <p className="text-sm sm:text-base text-emerald-100/85 mt-3 max-w-xl mx-auto">
          Deploy your AI receptionist in 5 minutes and capture every lead, 24/7.
        </p>
        <button
          type="button"
          onClick={() => openModal('signup', 'Claim Your Free AI Receptionist')}
          className="mt-7 px-8 py-4 rounded-full font-semibold text-sm text-emerald-950 transition-transform hover:scale-105 cursor-pointer"
          style={{ background: 'linear-gradient(180deg, #bcf8db 0%, #68d89b 50%, #44b87d 100%)', boxShadow: '0 0 32px rgba(74, 222, 128, 0.5)' } as React.CSSProperties}
        >
          Claim Your Free AI Receptionist →
        </button>
      </div>

      {/* Explore StarX-Flow Quick Links Strip */}
      <div className="mt-14 pt-8 border-t border-emerald-500/20 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-emerald-200/85">
        <span className="text-emerald-400 uppercase tracking-wider font-semibold">Explore StarX-Flow:</span>
        <a href="#hero-section" className="hover:text-white transition-colors">Product Overview</a>
        <a href="#scene-operational-excellence" className="hover:text-white transition-colors">All Features</a>
        <a href="#scene-pricing-comparison" className="hover:text-white transition-colors">Pricing Plans</a>
        <a href="#scene-faq" className="hover:text-white transition-colors">Resources &amp; Guides</a>
        <a href="#scene-legacy-hero-bridge" className="hover:text-white transition-colors">Our Story</a>
        <a href="#scene-customer-segments" className="hover:text-white transition-colors">Comparisons</a>
      </div>

      {/* Complete 4-Column Footer */}
      <footer className="mt-12 pt-10 border-t border-emerald-500/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-400 text-lg">✦</span>
            <span className="text-base font-semibold text-white">StarX Flow</span>
          </div>
          <p className="text-emerald-100/75 leading-relaxed max-w-sm">
            The premier AI Operating System and WhatsApp Automation Platform for Local Service &amp; Appointment-Driven Businesses. Put your front desk on autopilot with zero booking commissions.
          </p>
          <div className="pt-1 text-emerald-300 font-medium">
            Official Support: <a href="mailto:support@starxflow.com" className="underline hover:text-white">support@starxflow.com</a>
          </div>
        </div>

        <div>
          <div className="font-semibold text-white uppercase tracking-wider mb-3">Industries</div>
          <ul className="space-y-2 text-emerald-100/75">
            <li><a href="#scene-customer-segments" className="hover:text-white transition-colors">Gyms &amp; Fitness</a></li>
            <li><a href="#scene-customer-segments" className="hover:text-white transition-colors">Dental &amp; Clinics</a></li>
            <li><a href="#scene-customer-segments" className="hover:text-white transition-colors">Salons &amp; Beauty</a></li>
            <li><a href="#scene-customer-segments" className="hover:text-white transition-colors">Spas &amp; Wellness</a></li>
            <li><a href="#scene-customer-segments" className="hover:text-white transition-colors">Education &amp; Tutors</a></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-white uppercase tracking-wider mb-3">Architecture</div>
          <ul className="space-y-2 text-emerald-100/75">
            <li><a href="#scene-onboarding" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#scene-guarantees" className="hover:text-white transition-colors">Security &amp; Privacy</a></li>
            <li><a href="#scene-integrations" className="hover:text-white transition-colors">Verified Integrations</a></li>
            <li><a href="#hero-section" className="hover:text-white transition-colors">Product Overview</a></li>
            <li><a href="#scene-operational-excellence" className="hover:text-white transition-colors">Features Directory</a></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-white uppercase tracking-wider mb-3">Company</div>
          <ul className="space-y-2 text-emerald-100/75">
            <li><a href="#scene-legacy-hero-bridge" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#scene-pricing-comparison" className="hover:text-white transition-colors">Pricing &amp; Plans</a></li>
            <li><a href="#scene-faq" className="hover:text-white transition-colors">Resources</a></li>
            <li><button type="button" onClick={() => openModal('capability', 'Privacy Policy & GDPR Architecture', 'StarX Flow isolates tenant data with PostgreSQL Row-Level Security [RLS] and provides full GDPR export and deletion endpoints.')} className="hover:text-white transition-colors bg-transparent border-0 p-0 text-inherit cursor-pointer">Privacy Policy</button></li>
            <li><button type="button" onClick={() => openModal('capability', 'Terms of Service', 'Flat-rate monthly software subscription [$29 to $99/mo] with 0% booking commissions and 100% direct client ownership.')} className="hover:text-white transition-colors bg-transparent border-0 p-0 text-inherit cursor-pointer">Terms of Service</button></li>
          </ul>
        </div>
      </footer>

      {/* Legal & Encryption Bar */}
      <div className="mt-10 pt-6 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-4 text-[11px] text-emerald-200/65">
        <div>© 2026 StarX Flow (StarX Alpha Labs). All rights reserved.</div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => openModal('login')} className="hover:text-emerald-300 bg-transparent border-0 p-0 text-inherit cursor-pointer">Admin Login</button>
          <span>•</span>
          <span className="font-mono">Canonical Host: starx-flow.runs-on.dev</span>
          <span>•</span>
          <span className="text-emerald-300">TLS 1.3 Transport &amp; At-Rest Encryption</span>
        </div>
      </div>
    </section>
  </div>


  {/* =========================================================================== */}
  {/* FLOATING STUDIO INSPECTOR BAR (Mode Switcher & X-Ray Reference Diff Slider) */}
  {/* =========================================================================== */}
  <div
    id="studio-inspector-bar"
    className="fixed bottom-3 right-3 z-50 flex flex-wrap items-center gap-2 rounded-full px-3.5 py-2 text-xs shadow-2xl"
    style={{ background: 'rgba(4, 20, 14, 0.9)', border: '1px solid rgba(110, 231, 183, 0.4)', backdropFilter: 'blur(12px)' } as React.CSSProperties}
  >
    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span>StarX Studio:</span>
    </span>

    <button
      id="mode-btn-hybrid"
      type="button"
      onClick={() => setRenderMode('hybrid')}
      className="px-2.5 py-1 rounded-full font-medium transition-colors bg-emerald-500/25 text-emerald-200 border border-emerald-400/50"
    >
      3D Sanctuary + Live DOM
    </button>

    <button
      id="mode-btn-pure"
      type="button"
      onClick={() => setRenderMode('pure-css')}
      className="px-2.5 py-1 rounded-full font-medium transition-colors text-emerald-100/75 hover:text-white border border-transparent"
    >
      Pure CSS/SVG
    </button>

    <div className="flex items-center gap-1.5 pl-2 border-l border-emerald-500/30">
      <label htmlFor="xray-slider" className="text-emerald-200/80 cursor-pointer">Compare Original:</label>
      <input
        id="xray-slider"
        type="range"
        min={0}
        max={100}
        value={xrayOpacity}
        onChange={(e) => setXrayOpacity(Number(e.target.value))}
        className="w-20 accent-emerald-400 cursor-pointer"
        title="Slide to overlay reference layout and verify alignment"
      />
      <span id="xray-pct" className="text-emerald-300 font-mono w-8 text-right">0%</span>
    </div>
  </div>

  {/* =========================================================================== */}
  {/* INTERACTIVE GLASS TOAST BANNER (FOR ORBITAL NODES & CHALLENGE CARDS)        */}
  {/* =========================================================================== */}
  {toastMessage && (
    <div
      id="live-status-toast"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full px-4 py-2 text-xs font-medium text-emerald-50 shadow-2xl transition-all"
      style={{ background: 'rgba(6, 28, 20, 0.92)', border: '1px solid rgba(110, 231, 183, 0.55)', backdropFilter: 'blur(12px)' } as React.CSSProperties}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      <span id="live-status-toast-text">{toastMessage}</span>
      <button type="button" onClick={hideToast} className="text-emerald-300/70 hover:text-white ml-1">✕</button>
    </div>
  )}

  {/* =========================================================================== */}
  {/* INTERACTIVE MODAL (FOR GET STARTED, LOGIN, AND CAPABILITY DEEP-DIVES)       */}
  {/* =========================================================================== */}
  <div
    id="starx-modal-backdrop"
    className="fixed inset-0 z-50 hidden items-center justify-center p-4"
    style={{ background: 'rgba(2, 10, 7, 0.78)', backdropFilter: 'blur(10px)' } as React.CSSProperties}
    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
  >
    <div
      className="relative w-full max-w-md rounded-2xl p-6 text-emerald-50 shadow-2xl"
      style={{ background: 'linear-gradient(155deg, rgba(16, 48, 35, 0.96) 0%, rgba(5, 18, 13, 0.98) 100%)', border: '1px solid rgba(110, 231, 183, 0.45)', boxShadow: '0 0 50px rgba(16, 185, 129, 0.25)' } as React.CSSProperties}
    >
      <button
        type="button"
        onClick={closeModal}
        aria-label="Close modal"
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-emerald-300 hover:bg-emerald-800/40 hover:text-white transition-colors"
      >
        ✕
      </button>

      <div id="modal-eyebrow" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
        STARX FLOW ENVIRONMENT
      </div>
      <h3 id="modal-title" className="font-editorial text-3xl font-normal text-white mt-1">
        Start Your Connected Flow
      </h3>
      <p id="modal-subtitle" className="text-xs text-emerald-200/80 mt-1.5 leading-relaxed">
        Connect your WhatsApp Business number, staff calendars, and customer CRM in under 3 minutes.
      </p>

      <form id="modal-form" onSubmit={handleModalSubmit} className="mt-4 space-y-3">
        <div id="modal-name-group">
          <label htmlFor="modal-business-input" className="block text-xs font-medium text-emerald-200 mb-1">Business Name</label>
          <input
            id="modal-business-input"
            type="text"
            required
            placeholder="e.g. Emerald Wellness Studio"
            className="w-full rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            style={{ background: 'rgba(6, 22, 16, 0.85)', border: '1px solid rgba(110, 231, 183, 0.3)' } as React.CSSProperties}
          />
        </div>

        <div>
          <label htmlFor="modal-email-input" className="block text-xs font-medium text-emerald-200 mb-1">Work Email or WhatsApp Number</label>
          <input
            id="modal-email-input"
            type="text"
            required
            placeholder="you@yourbusiness.com"
            className="w-full rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            style={{ background: 'rgba(6, 22, 16, 0.85)', border: '1px solid rgba(110, 231, 183, 0.3)' } as React.CSSProperties}
          />
        </div>

        <div id="modal-slot-summary" className="rounded-xl p-3 text-xs flex items-center justify-between" style={{ background: 'rgba(16, 62, 43, 0.45)', border: '1px solid rgba(110, 231, 183, 0.25)' } as React.CSSProperties}>
          <span className="text-emerald-200/90">Selected Demo Slot:</span>
          <span id="modal-selected-slot-badge" className="font-semibold text-emerald-300">Nov 11 • Tue, 10:00 AM</span>
        </div>

        <button
          type="submit"
          id="modal-submit-btn"
          className="w-full py-2.5 rounded-full text-xs font-semibold text-emerald-950 transition-transform active:scale-98 cursor-pointer"
          style={{ background: 'linear-gradient(90deg, #bbf7d0 0%, #4ade80 55%, #22c55e 100%)', boxShadow: '0 0 24px rgba(74, 222, 128, 0.45)' } as React.CSSProperties}
        >
          Launch Workspace →
        </button>
      </form>

      <div id="modal-success-box" className="hidden mt-4 rounded-xl p-4 text-center" style={{ background: 'rgba(16, 72, 48, 0.55)', border: '1px solid #4ade80' } as React.CSSProperties}>
        <div className="text-sm font-semibold text-white" id="modal-success-title">Workspace Ready!</div>
        <div className="text-xs text-emerald-200 mt-1" id="modal-success-msg">Your AI WhatsApp Flow has been provisioned and synced.</div>
      </div>
    </div>
  </div>

  {/* =========================================================================== */}
  {/* APPLICATION LOGIC & INTERACTIVE STATE ENGINE                                */}
  {/* =========================================================================== */}
  

    </>
  );
}

export default StarXFlowLanding;
