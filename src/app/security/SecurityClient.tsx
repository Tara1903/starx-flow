"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Database, 
  FileCheck2, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  Mail,
  Sparkles,
} from "lucide-react";

export function SecurityClient() {
  const securityControls = [
    {
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      title: "PostgreSQL Row Level Security (RLS)",
      badge: "Database Engine Bound",
      description:
        "Every database query executed by staff or AI agents is bounded by PostgreSQL Row Level Security policies. Tenants cannot view or access data belonging to any other business.",
      details: [
        "Enforced at the PostgreSQL engine level, not in application middleware",
        "Role-Based Access Control (RBAC) separating owners, admins, and members",
        "All conversations, appointments, and leads carry organization isolation keys",
      ],
    },
    {
      icon: <Key className="w-6 h-6 text-emerald-400" />,
      title: "Cryptographic Webhook Verification",
      badge: "HMAC-SHA256 Signed",
      description:
        "Every incoming message payload from WhatsApp and Instagram is validated using Meta's HMAC-SHA256 signature header (x-hub-signature-256) before entering processing pipelines.",
      details: [
        "Rejects forged, tampered, or spoofed HTTP requests with HTTP 403 Forbidden",
        "Sliding-window idempotency cache (15-min TTL) eliminates duplicate event replays",
        "Cryptographic verification powered by native Web Crypto API",
      ],
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-400" />,
      title: "Database Exclusion Concurrency Locks",
      badge: "Double-Booking Prevention",
      description:
        "To mathematically prevent scheduling conflicts, appointments are constrained by PostgreSQL btree_gist exclusion constraints over timestamp ranges, locking slots at the database layer.",
      details: [
        "Rejects concurrent double-bookings before calendar writes occur",
        "Bi-directional synchronization with Google Calendar and Microsoft Outlook",
        "Atomic transaction commits guarantee calendar and database consistency",
      ],
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-emerald-400" />,
      title: "Engine-Level Immutable Audit Logs",
      badge: "Tamper-Proof Audit Trail",
      description:
        "Every administrative action and AI agent execution is recorded in an append-only audit trail protected by database triggers that prohibit UPDATE and DELETE operations.",
      details: [
        "PostgreSQL trigger tr_prevent_audit_log_mutation() blocks log tampering",
        "Captures actor type (user, ai_agent, system, api_key), timestamp, and payload",
        "Provides permanent compliance tracking for regulatory review",
      ],
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      title: "Encryption In Transit & At Rest",
      badge: "TLS 1.3 & AES-256",
      description:
        "All network traffic is encrypted using TLS 1.3 with HTTP Strict Transport Security (HSTS) enforced. Persistent data is stored in managed Supabase PostgreSQL with disk-level AES-256 encryption.",
      details: [
        "HSTS max-age=31536000 with includeSubDomains enforced on edge routing",
        "Automated SSL/TLS certificate rotation and strict HTTPS redirection",
        "Database backups and transaction logs encrypted at rest",
      ],
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "Automated GDPR Rights & Erasure",
      badge: "Articles 17 & 20 Compliant",
      description:
        "Merchants can fulfill consumer data protection requests automatically using verified programmatic endpoints for full JSON data export and permanent cascade deletion.",
      details: [
        "Structured data export endpoint (/api/gdpr/export) for data portability",
        "Permanent cascade deletion endpoint (/api/gdpr/delete) for right-to-erasure",
        "Zero data retention beyond active subscription lifecycle",
      ],
    },
  ];

  const subProcessors = [
    { name: "Supabase, Inc.", role: "Managed PostgreSQL Database & Authentication", cert: "SOC 2 Type II Certified" },
    { name: "Vercel, Inc.", role: "Edge Application Hosting & Serverless Execution", cert: "SOC 2 Type II / ISO 27001" },
    { name: "Meta Platforms, Inc.", role: "WhatsApp Cloud API & Instagram Messaging", cert: "Enterprise Privacy Shield" },
    { name: "Google LLC", role: "Google Calendar API & Gemini AI Inference", cert: "SOC 2 / ISO 27001 / HIPAA" },
    { name: "Microsoft Corporation", role: "Microsoft Graph Calendar API", cert: "SOC 2 / ISO 27001" },
    { name: "Stripe, Inc.", role: "Payment Processing & Billing Subscriptions", cert: "PCI-DSS Level 1 Service Provider" },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-28 min-h-screen relative overflow-hidden bg-[#020a07] text-[#f0f5ef]">
      {/* Background Emerald Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(40, 223, 160, 0.16) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 text-xs font-mono text-[#b8c9bd]/70 uppercase tracking-widest flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-emerald-300">Security &amp; Privacy Architecture</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Enterprise Data Governance
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.08]">
            Enterprise trust built on <br />
            <span className="text-gradient-emerald">provable engineering.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#b8c9bd] font-normal leading-relaxed max-w-3xl mx-auto">
            We don&apos;t rely on marketing slogans or unverified badges. StarX Flow protects your merchant data and client conversations through database-level isolation, cryptographic webhook verification, and immutable audit trails.
          </p>
        </div>

        {/* Direct Answer Summary Block */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl mb-20 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(40,223,160,0.12)]">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-2xl border border-emerald-400/30 text-emerald-300 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="font-editorial text-xl md:text-2xl font-bold text-white mb-2">
                Key Takeaway: The StarX Flow Security Architecture
              </h2>
              <p className="text-sm md:text-base text-[#b8c9bd] leading-relaxed font-normal">
                StarX Flow secures appointment-driven businesses through six architectural pillars: <strong>(1) PostgreSQL Row Level Security (RLS)</strong> enforcing strict tenant isolation at the database engine level; <strong>(2) HMAC-SHA256 cryptographic signature validation</strong> on all Meta WhatsApp and Instagram webhooks; <strong>(3) PostgreSQL exclusion constraints (btree_gist)</strong> preventing overlapping appointment ranges; <strong>(4) Engine-level immutable audit logging</strong> prohibiting log updates or deletions; <strong>(5) TLS 1.3 transport encryption</strong> and AES-256 storage encryption; and <strong>(6) Programmatic GDPR Article 17 and 20 endpoints</strong> for customer data export and right-to-erasure compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Security Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-24">
          {securityControls.map((ctrl) => (
            <div
              key={ctrl.title}
              className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between border-emerald-500/20"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-emerald-500/15 rounded-2xl border border-emerald-400/30 shadow-[0_0_15px_rgba(40,223,160,0.12)]">
                    {ctrl.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    {ctrl.badge}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-white mb-3 tracking-tight">
                  {ctrl.title}
                </h3>
                <p className="text-sm text-[#b8c9bd] font-normal leading-relaxed mb-6">
                  {ctrl.description}
                </p>
              </div>

              <ul className="space-y-2.5 border-t border-emerald-500/20 pt-6 text-xs text-emerald-100/90 font-medium">
                {ctrl.details.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5 shadow-[0_0_6px_#34d399]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sub-Processor Transparency Table */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-editorial text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Infrastructure &amp; Sub-Processor Transparency
            </h2>
            <p className="text-[#b8c9bd] text-base font-normal">
              We exclusively deploy on enterprise cloud infrastructure maintaining accredited security certifications.
            </p>
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-3xl overflow-x-auto border-emerald-500/20 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)]">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-emerald-500/20 text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  <th className="py-4 px-4">Sub-Processor</th>
                  <th className="py-4 px-4">Operational Role</th>
                  <th className="py-4 px-4">Accredited Standards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/15 text-[#b8c9bd] font-normal text-xs md:text-sm">
                {subProcessors.map((sp) => (
                  <tr key={sp.name} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2.5">
                      <Server size={14} className="text-emerald-400" />
                      {sp.name}
                    </td>
                    <td className="py-4 px-4">{sp.role}</td>
                    <td className="py-4 px-4 text-emerald-300 font-mono font-semibold">{sp.cert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vulnerability Disclosure & Contact */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border-emerald-400/30 text-center max-w-3xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.1)]">
          <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-300 mx-auto mb-6 border border-emerald-400/30 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
            <Mail size={24} />
          </div>
          <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">
            Security Vulnerability Disclosure
          </h2>
          <p className="text-sm md:text-base text-[#b8c9bd] font-normal leading-relaxed mb-6">
            We welcome responsible security research. If you believe you have discovered a potential vulnerability in StarX Flow, please contact our security engineering team directly. We commit to acknowledging all submissions within 24 hours.
          </p>
          <div className="inline-flex items-center gap-3 bg-[#010804] border border-emerald-500/25 px-6 py-3 rounded-full text-sm font-semibold text-white">
            <span className="text-[#b8c9bd] font-normal">Direct Security Contact:</span>
            <a href="mailto:security@starx-flow.runs-on.dev" className="text-emerald-400 hover:text-emerald-300 transition-colors font-mono">
              security@starx-flow.runs-on.dev
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
