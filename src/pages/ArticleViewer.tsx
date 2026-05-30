import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar as CalendarIcon, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle,
  Copy,
  Check
} from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { GlassPanel } from "../components/ui/GlassPanel";

interface ArticleData {
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  intro: string;
  sections: {
    heading: string;
    paragraphs: string[];
    listItems?: string[];
    snippet?: {
      title: string;
      code: string;
    };
  }[];
  metrics: {
    label: string;
    value: string;
    sub: string;
  }[];
}

const ARTICLES_DATABASE: Record<string, ArticleData> = {
  "gym-onboarding": {
    title: "How Gyms Can Automate Member Onboarding & Retention",
    category: "Member Engagement",
    readTime: "6 min read",
    date: "May 18, 2026",
    author: "StarX Growth Team",
    intro: "Boutique gyms and wellness clubs lose up to 40% of prospective members between the initial trial signup and their first physical visit. In this guide, we break down how automated WhatsApp onboarding sequences secure class bookings, collect waivers, and convert trials to long-term memberships on autopilot.",
    sections: [
      {
        heading: "1. The 'Waiver Leak' administrative bottleneck",
        paragraphs: [
          "In traditional gym operations, a prospective member signs up for a free trial online and is expected to fill out a PDF waiver, or stand in line at the front desk for 10 minutes during their first visit. This administrative friction causes drop-offs. If a client has to do paperwork before experiencing the gym, the excitement fades.",
          "By syncing your member database (Mindbody, Pike13, or Zen Planner) to StarX Flow, you can trigger an instant WhatsApp workflow the second a trial is registered. The AI assistant greets the user, answers any initial class concerns, and sends a secure signature link. Over 88% of waivers are signed within 2 hours of receipt when delivered via text, compared to just 14% via email."
        ]
      },
      {
        heading: "2. The First-Class Hook Conversation",
        paragraphs: [
          "Getting them to register is only half the battle; getting them through the front door is the real challenge. Automating class prep answers ensures they arrive confident and prepared.",
          "Our recommended dialogue model answers parking queries, locker rules, and dress codes instantly. Here is an example conversation flow handled entirely by the AI assistant:"
        ],
        snippet: {
          title: "WhatsApp Intake Template Script",
          code: `AI: "Hey Alex! Welcome to Nexus Fitness. Your 3-Class Trial is active! 🏋️

To make your first visit smooth tomorrow:
- Parking is free in the rear lot.
- Please arrive 10 minutes early so we can show you the lockers.
- Bring a water bottle; towels are provided.

Do you need help booking your slot with Coach David at 9:00 AM?"
Client: "Yes, please book me in."
AI: "Done! Slot locked. Click here to sign your first-visit liability waiver: [Secure-Link]. See you tomorrow!"`
        }
      },
      {
        heading: "3. The Day 6 Trial-to-Paid Conversion Sequence",
        paragraphs: [
          "Most gyms wait until the trial has already expired to send an email offer. By then, the client's momentum has stalled. The most effective conversion window is 24 to 48 hours before the trial ends.",
          "On Day 6 of a 7-day trial, StarX Flow automatically checks class attendance. If the client attended at least two classes, it triggers a personalized discount offer. If they attended zero, it triggers a recovery sequence to extend their trial by another 3 days, saving the lead from going cold."
        ]
      }
    ],
    metrics: [
      { label: "Waiver Completion Rate", value: "88%", sub: "vs 14% on email templates" },
      { label: "First-Class Show Rate", value: "+35%", sub: "due to automated pre-arrival FAQs" },
      { label: "Trial-to-Member Conv.", value: "28.4%", sub: "industry average is 12%" }
    ]
  },
  "spa-no-shows": {
    title: "Reducing Spa & Salon No-Shows by 90% via WhatsApp Chatbots",
    category: "Operations",
    readTime: "5 min read",
    date: "May 15, 2026",
    author: "Elena Rostova, Operations Lead",
    intro: "For high-end spas and salons, empty treatment rooms represent lost revenue that can never be recovered. When a client forgets an appointment, the therapist sits idle while overhead remains fixed. Learn how interactive double-confirmation WhatsApp threads secure calendar rosters automatically.",
    sections: [
      {
        heading: "1. The True Cost of Empty Treatment Slots",
        paragraphs: [
          "For a boutique salon or wellness spa charging an average of $110 per hour, a single daily no-show drains over $3,000 in monthly revenue. Standard email reminders are frequently ignored, marked as spam, or buried in promotions tabs.",
          "Interactive text messaging achieves a 98% open rate, with most responses arriving within 90 seconds. Moving confirmation workflows to WhatsApp bridges the communication gap instantly."
        ]
      },
      {
        heading: "2. Constructing the 24-Hour Double Confirmation Bot",
        paragraphs: [
          "Traditional systems send a passive text like: 'Your appointment is tomorrow at 2PM.' This does not guarantee the customer read it or is actually planning to attend.",
          "A double-confirmation script requires an active response, forcing the user to commit or reschedule on the spot, freeing up slots for waitlisted clients if they cancel."
        ],
        snippet: {
          title: "Double-Confirmation Flow Script",
          code: `AI: "Hi Sarah! Your 90-Minute Hot Stone Massage with Emily is scheduled for tomorrow at 2:00 PM. 🌸

Please confirm your attendance:
Reply '1' to CONFIRM
Reply '2' to RESCHEDULE (free up to 12h prior)

Which matches your schedule?"
Client: "2"
AI: "No problem! I can move that for you. Here are Emily's alternative slots this week:
- Thursday: 10:30 AM, 4:00 PM
- Friday: 1:30 PM

Reply with your preferred time to swap instantly."`
        }
      },
      {
        heading: "3. Stripe deposit hooks for high-value services",
        paragraphs: [
          "For high-ticket treatments (microblading, full-day packages, medical peels), confirmations alone aren't enough. Spas must secure slots with financial commitment.",
          "StarX Flow allows you to configure deposit triggers. First-time clients booking services over $150 automatically receive a secure, glassmorphic Stripe link inside the WhatsApp thread. The slot is temporarily held for 15 minutes and locked permanently once the deposit payment is confirmed by our API."
        ]
      }
    ],
    metrics: [
      { label: "No-Show Reduction", value: "90%", sub: "down to less than 1.5% overall" },
      { label: "Reschedule Fluidity", value: "<2m", sub: "average automated swap time" },
      { label: "Recovered Leakage", value: "$4,200", sub: "average monthly salon savings" }
    ]
  },
  "clinic-receptionist": {
    title: "The Complete Guide to 24/7 AI Receptionists for Chiropractic & Dental Clinics",
    category: "Clinical Admin",
    readTime: "8 min read",
    date: "May 12, 2026",
    author: "Dr. Marcus Vance, Healthcare Advisor",
    intro: "Private clinics face a unique challenge: they must manage heavy call volumes, reschedule recurring adjustments, and answer emergency inquiries, all while staying fully compliant with patient data privacy standards. This runbook details how to securely deploy AI receptionists in clinical offices.",
    sections: [
      {
        heading: "1. HIPAA Compliant Patient Triage Safeguards",
        paragraphs: [
          "In healthcare administrative workflows, privacy is the absolute priority. AI chatbots should never solicit or record complex medical diagnoses, sensitive medical history, or insurance details over public messaging networks.",
          "The primary function of the clinical AI is administrative logistics: scheduling appointments, checking operating hours, sharing directions, and routing clinical concerns to licensed human staff. Our template automatically detects diagnostic terms and redirects patients to secure clinic portals, ensuring data protection rules are upheld."
        ]
      },
      {
        heading: "2. The Critical Care Handoff Mechanism",
        paragraphs: [
          "A patient asking to schedule a routine dental checkup is a standard administrative task. A patient texting that they have severe, throbbing jaw pain after an extraction requires immediate clinical intervention.",
          "Our system is trained to scan incoming messages for priority keywords such as 'pain', 'emergency', 'bleeding', 'accident', or 'infection'. When a match occurs, the AI instantly pauses automated responses, alerts the office desktop with a high-priority tone, and notifies the clinic manager via SMS for manual takeover."
        ],
        snippet: {
          title: "Clinic Emergency Handover Script",
          code: `Client: "Hey, my crown fell out and my tooth is bleeding and hurts bad."
AI: "I am routing your message to our clinical staff immediately. Dr. Vance has been notified and we are reviewing your file. 

If this is a life-threatening medical emergency, please call 911. A member of our staff will text you here within 3 minutes."
[STARX ADMIN ALARM TRIGGERED: Clinical escalation for Patient Alex Jones]`
        }
      },
      {
        heading: "3. Direct EHR / EMR Calendar Synchronization",
        paragraphs: [
          "To be useful, the AI must have access to real-time provider schedules. StarX Flow connects natively with leading EMR/EHR tools (Jane App, WebPT, Dentrix, and AthenaHealth).",
          "When a patient books or changes an adjustment slot via the chatbot, the appointment is written directly into your clinic roster, keeping therapists, treatment chairs, and patient records aligned across the board."
        ]
      }
    ],
    metrics: [
      { label: "Admin Workload Red.", value: "65%", sub: "freed from routine phone calls" },
      { label: "Escalation Speed", value: "<15s", sub: "average staff notification delay" },
      { label: "EHR Sync Accuracy", value: "100%", sub: "zero calendar overlaps recorded" }
    ]
  },
  "google-reviews-seo": {
    title: "Google Reviews On Autopilot: How To Boost Your Local Service SEO",
    category: "Local SEO",
    readTime: "4 min read",
    date: "May 10, 2026",
    author: "StarX Local Search Team",
    intro: "For local service businesses (electricians, auto shops, beauty salons, HVAC), ranking in the 'Google Map Pack' (the top 3 local search results) is the single biggest driver of customer acquisition. In this guide, we show how automated post-checkout WhatsApp follow-ups double your five-star review volume on autopilot.",
    sections: [
      {
        heading: "1. The Google Local Search Algorithm",
        paragraphs: [
          "Google Maps uses three primary ranking signals to display local listings: Relevance, Distance, and Prominence. While you cannot control Distance (where the searcher is standing), you can heavily influence Prominence.",
          "Google measures Prominence by your total review volume, average rating, and the frequency (velocity) of incoming reviews. Listings with consistent, fresh five-star ratings are pushed to the top, capturing up to 450% more phone calls and booking clicks than listings positioned below slot 3."
        ]
      },
      {
        heading: "2. The Golden '2-Hour' Review Request Window",
        paragraphs: [
          "Timing is everything. If you ask for a Google review three days after a service, the client's excitement has faded, and email requests are ignored.",
          "StarX Flow monitors calendar webhooks. Exactly 2 hours after a customer checks out and their invoice is marked paid (Square, Stripe, or Clover), the AI sends a warm, personalized review prompt via WhatsApp, making it effortless to share feedback while the positive experience is top-of-mind."
        ],
        snippet: {
          title: "Automated Feedback & Review Prompts",
          code: `AI: "Hey Marcus! Thanks for stopping by Aura Spa today. We hope you loved your treatment with Sarah! 🌸

If you have 10 seconds, it would support our local staff immensely if you shared your experience on Google:
[Direct-Google-Review-Link]

Have a wonderful week!"
Client: "Done! You guys are amazing."`
        }
      },
      {
        heading: "3. Sentiment Filtering & Operations Control",
        paragraphs: [
          "Not every customer interaction is perfect. Sometimes an order is delayed, or a client leaves feeling neutral.",
          "Our system offers a 'Feedback Gate' setting. Before sending the direct Google link, the AI can ask the customer to rate their experience from 1 to 5 stars inside the chat. Ratings of 4 or 5 are instantly supplied the Google link, while scores of 3 or below are prompted for detailed feedback. This response is immediately routed to the business owner's private inbox, allowing them to resolve issues before they become public reviews."
        ]
      }
    ],
    metrics: [
      { label: "Review Volume Increase", value: "+140%", sub: "within the first 30 days" },
      { label: "Google Map Pack Rank", value: "Top 3", sub: "average result for clients" },
      { label: "Customer Response Rate", value: "32%", sub: "compared to 3% industry standard" }
    ]
  },
  "scaling-failures": {
    title: "Why Local Service Businesses Fail to Scale (And How to Fix It)",
    category: "Strategy",
    readTime: "7 min read",
    date: "May 08, 2026",
    author: "StarX Operations Board",
    intro: "Boutique wellness centers, beauty clinics, and home service providers often hit a growth ceiling. Despite high demand, revenue plateaus and administrative expenses rise. In this operational breakdown, we examine how front-office friction limits scalability and how automation unlocks growth.",
    sections: [
      {
        heading: "1. The Front-Desk Bottleneck & Administrative Drag",
        paragraphs: [
          "In a typical service business, 80% of a receptionist's day is consumed by answering simple, repetitive questions: 'How much is a haircut?', 'Do you have openings today?', 'Where is your clinic located?'. This represents administrative drag.",
          "Because your staff is busy answering routine questions, they miss incoming calls from new leads, fail to follow up on abandoned bookings, and have zero time for proactive marketing campaigns. By automating routine front-office workflows, you can redirect human resources to high-value customer service."
        ]
      },
      {
        heading: "2. The Silent Revenue Killer: Missed Phone Calls",
        paragraphs: [
          "Industry data reveals that 62% of incoming phone calls to local service businesses go unanswered. Furthermore, 85% of those callers will not leave a voicemail or call back—they simply call the next business listed on Google.",
          "StarX Flow solves this leakage with 'Missed Call Recovery'. When a call is missed, the system instantly sends an automated WhatsApp message: 'Hi! We just missed your call. How can we help you book or reschedule today?'. This recovers up to 45% of otherwise lost leads within the first 60 seconds."
        ],
        snippet: {
          title: "Missed Call Auto-Recovery Flow",
          code: `[System Event: Inbound call from +1 (555) 0199 missed at 4:15 PM]
StarX: "Hi there! Sorry we missed your call. 📞 We are currently helping other clients.

If you are looking to book an appointment or check availability, just tell me what service you need and I can share open times!"
Client: "Hey, looking to book a massage today."
StarX: "Awesome! We have a slot open with Emily at 5:30 PM. Would you like to lock it in?"`
        }
      },
      {
        heading: "3. Aligning Ratios for High-Margin Expansion",
        paragraphs: [
          "To scale efficiently, you must decouple revenue growth from administrative headcounts. In traditional models, doubling your client volume requires doubling your receptionist staff, keeping margins thin.",
          "Integrating AI front-offices allows service brands to scale capacity infinitely. The AI handles thousands of conversations simultaneously, ensuring zero delay, zero missed leads, and excellent operating leverage."
        ]
      }
    ],
    metrics: [
      { label: "Missed Call Recovery", value: "45%", sub: "converted within 60 seconds" },
      { label: "Administrative Overhead", value: "-40%", sub: "saved on hiring and training costs" },
      { label: "Lead Response Time", value: "<2s", sub: "24/7/365 coverage" }
    ]
  },
  "calendar-integration": {
    title: "Square & Clover Calendar Integration: A Guide to Roster Optimization",
    category: "Integrations",
    readTime: "5 min read",
    date: "May 05, 2026",
    author: "Tariq Mahmood, Tech Integrations Lead",
    intro: "A scheduling assistant is only as smart as the data backing it up. If your AI assistant does not have real-time calendar access, double-bookings occur, frustrating clients and staff alike. This technical guide explains how webhooks ensure seamless roster syncing.",
    sections: [
      {
        heading: "1. The Danger of 'Polling Interval' APIs",
        paragraphs: [
          "Many legacy scheduling widgets rely on polling: checking the calendar every 10 or 15 minutes for new bookings. In a high-volume salon or medical clinic, a 15-minute sync delay is a liability. Two clients can easily book the same slot, forcing staff to call and reschedule.",
          "StarX Flow uses instant 2-way Webhook triggers. When an appointment is scheduled on Square, Clover, or Google Calendar, a secure message is pushed to our database in under 200 milliseconds. The slot is locked instantly, guaranteeing double-booking protection."
        ]
      },
      {
        heading: "2. Synchronizing Employee Rosters and Buffers",
        paragraphs: [
          "Roster optimization goes beyond booking slots; it requires managing employee preferences, breaks, and shifts.",
          "StarX Flow imports active staff, service capabilities, custom buffers (e.g. 15 minutes of cleanup time between sessions), and lunch breaks. Here is a configuration snippet demonstrating active sync rules:"
        ],
        snippet: {
          title: "Calendar Webhook Rules Config",
          code: `[Roster Config: David (Senior Therapist)]
- Active Days: Monday - Friday
- Working Hours: 9:00 AM - 5:00 PM
- Service Capacity: Therapeutic Massage (60m), Hot Stone Massage (90m)
- Mandatory Cleanup Buffer: 15 minutes after session
- Google Calendar 2-Way Sync: Enabled (locks personal blockouts)`
        }
      },
      {
        heading: "3. Roster Optimization & Room Allocations",
        paragraphs: [
          "For clinics and spas with limited resources (e.g., three massage tables or two specialized chiropractic chairs), managing therapist availability is only half the battle. You must also manage physical equipment resources.",
          "Our calendar mapper associates rooms and equipment with specific services. If a therapist is free but all rooms are occupied, the AI blocks the slot, preventing staff bottlenecks and ensuring a smooth guest experience."
        ]
      }
    ],
    metrics: [
      { label: "Sync Latency Rate", value: "200ms", sub: "instant webhook trigger locks" },
      { label: "Double-Booking Incidents", value: "0", sub: "since system integration" },
      { label: "Roster Utilization Rate", value: "+22%", sub: "due to automated gap filling" }
    ]
  }
};

export function ArticleViewer() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const navigate = useNavigate();
  const openSignup = useUIStore((state) => state.openSignup);
  const [isCopied, setIsCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fetch article from local DB
  const article = articleSlug ? ARTICLES_DATABASE[articleSlug] : null;

  // Track scroll progress for reading indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!article) {
    return (
      <div className="pt-40 pb-24 min-h-screen bg-black flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Article Not Found</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          The operations runbook you are looking for does not exist or has been relocated to another slug.
        </p>
        <Link 
          to="/resources" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 lg:pt-40 pb-20 min-h-screen relative overflow-hidden bg-black text-white">
      {/* Scroll Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-emerald-500 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Atmospheric Glowing Backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] atmo-glow atmo-glow-emerald opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[400px] atmo-glow atmo-glow-soft opacity-[0.06] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-10 flex items-center justify-between">
          <Link 
            to="/resources"
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Resources</span>
          </Link>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
            <span>Resources</span>
            <ChevronRight size={12} />
            <span>Guides</span>
            <ChevronRight size={12} />
            <span className="text-emerald-400">{article.category}</span>
          </div>
        </div>

        {/* Article Title & Metadata Header */}
        <div className="border-b border-white/10 pb-10 mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6">
            <Sparkles size={10} className="text-emerald-400" />
            {article.category}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-[3.8rem] font-bold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <User size={15} className="text-zinc-500" /> {article.author}
            </span>
            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-zinc-500" /> {article.readTime}
            </span>
            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={15} className="text-zinc-500" /> {article.date}
            </span>
          </div>
        </div>

        {/* Grid Layout: Article Left / Sidebar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Article Body Column */}
          <div className="lg:col-span-8 text-left">
            <div className="prose prose-invert max-w-none text-zinc-300 font-medium text-sm md:text-base leading-relaxed flex flex-col gap-8">
              
              {/* Introduction Lead Paragraph */}
              <p className="text-lg md:text-xl text-white font-semibold leading-relaxed border-l-2 border-emerald-500 pl-4 bg-emerald-500/5 py-3 rounded-r-xl">
                {article.intro}
              </p>

              {/* Dynamic Sections rendering */}
              {article.sections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-4 mt-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight border-b border-white/5 pb-2">
                    {section.heading}
                  </h3>
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-zinc-400 font-medium leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {/* Bullet points if any */}
                  {section.listItems && (
                    <ul className="flex flex-col gap-2.5 my-2 list-none pl-1">
                      {section.listItems.map((item, lIdx) => (
                        <li key={lIdx} className="flex items-start gap-2 text-zinc-400 text-sm md:text-base">
                          <span className="text-emerald-400 font-bold mt-0.5">✔</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Script/Snippet Mock if any */}
                  {section.snippet && (
                    <div className="border border-white/10 rounded-2xl bg-zinc-950 p-4 font-mono text-xs my-4 shadow-xl overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pb-2 border-b border-white/5 mb-3 font-semibold tracking-wider uppercase">
                        <span>{section.snippet.title}</span>
                        <span>starx-flow-script</span>
                      </div>
                      <pre className="text-emerald-300 font-medium whitespace-pre-wrap text-left break-words">
                        {section.snippet.code}
                      </pre>
                    </div>
                  )}
                </div>
              ))}

              {/* Action Closing */}
              <div className="mt-10 border-t border-white/10 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:text-white transition-colors"
                >
                  {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {isCopied ? "Link Copied!" : "Copy Article Link"}
                </button>
                <span className="text-zinc-500 text-xs font-semibold">
                  Last updated May 2026. Published by StarX OS.
                </span>
              </div>

            </div>
          </div>

          {/* Sticky Widgets Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="sticky top-32 flex flex-col gap-6 text-left">
              
              {/* Strategic Metrics Widget */}
              <GlassPanel tier="panel" className="bg-zinc-950/40 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-[25px]" />
                <h4 className="text-white font-extrabold text-base mb-5 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" /> Key Target Metrics
                </h4>
                <div className="flex flex-col gap-5">
                  {article.metrics.map((metric, idx) => (
                    <div key={idx} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">
                        {metric.label}
                      </span>
                      <span className="text-2xl md:text-3xl font-black text-emerald-400 block font-mono">
                        {metric.value}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium block mt-0.5">
                        {metric.sub}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              {/* Sidebar Signup Action CTA */}
              <GlassPanel tier="panel" className="bg-gradient-to-br from-emerald-500/10 to-transparent p-6 rounded-[2rem] border border-emerald-500/20 text-center flex flex-col gap-4">
                <MessageSquare size={32} className="text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-white font-extrabold text-base mb-1.5">Put Bookings On Autopilot</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed font-semibold">
                    Implement the exact runbook triggers described in this guide for your own clinic, spa, salon, or service shop.
                  </p>
                </div>
                <button
                  onClick={openSignup}
                  className="bg-emerald-500 text-black font-black text-xs py-3.5 rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Start Free 14-Day Trial
                </button>
              </GlassPanel>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
