"use client";

import React, { useState, useEffect } from "react";
import {
  User, Building, Mail, Check, RefreshCw,
  Key, LogOut, Download, Trash2, ShieldCheck, Globe, AlertTriangle,
  Calendar, Instagram, CheckCircle2, ExternalLink, Layers, Unlink, CreditCard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { useBillingStore } from "../../store/billingStore";
import { useToastStore } from "../../store/toastStore";
import { PermissionGate, GlassModal, GlassButton } from "../../components/ui";
import { cn } from "../../lib/utils";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_DANGER,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
  CONSOLE_DIVIDER,
} from "../../lib/consoleSurface";

export function SettingsSection() {
  const user = useAuthStore((s) => s.user);
  const subscription = useBillingStore((s) => s.subscription);
  const fetchSubscription = useBillingStore((s) => s.fetchSubscription);
  const openCustomerPortal = useBillingStore((s) => s.openCustomerPortal);
  const createPolarCheckout = useBillingStore((s) => s.createPolarCheckout);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [businessType, setBusinessType] = useState(user?.businessType || "Salon");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeCalendars, setActiveCalendars] = useState<any[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramPageId, setInstagramPageId] = useState("");
  const [showIgModal, setShowIgModal] = useState(false);
  const [igInputPageId, setIgInputPageId] = useState("");
  const [igInputToken, setIgInputToken] = useState("");
  const [igConnecting, setIgConnecting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const isBillingAdmin = !user?.role || user.role.toLowerCase() !== "agent";

  const notify = (type: "success" | "error" | "info", message: string) => {
    setActionNotice({ type, message });
    useToastStore.getState().pushToast({
      tone: type,
      title: type === "error" ? "Action failed" : type === "success" ? "Saved" : "Notice",
      description: message,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    const res = await openCustomerPortal();
    setPortalLoading(false);
    if (res.error) {
      notify("error", res.error);
    }
  };

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    const res = await createPolarCheckout(planId);
    setCheckoutLoading(null);
    if (res.error) {
      notify("error", res.error);
    }
  };

  const getAccessHeaders = async (): Promise<Record<string, string>> => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        if (typeof document !== "undefined") {
          const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
          document.cookie = `sb-access-token=${encodeURIComponent(token)}; Path=/; Max-Age=3600; SameSite=Lax${secureFlag}`;
        }
        return { Authorization: `Bearer ${token}` };
      }
    } catch {
      // Fall back to existing cookies
    }
    return {};
  };

  useEffect(() => {
    fetchSubscription();
    async function loadIntegrations() {
      try {
        const headers = await getAccessHeaders();
        const res = await fetch("/api/integrations/calendar", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.calendars) setActiveCalendars(data.calendars);
        }
      } catch {
        // Fallback
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const connectedProvider = params.get("connected");
        const oauthErr = params.get("error");
        if (connectedProvider) {
          notify(
            "success",
            connectedProvider === "google_calendar"
              ? "Google Calendar connected and syncing in real time."
              : connectedProvider === "microsoft_calendar"
                ? "Microsoft Outlook Calendar connected and syncing."
                : `Connected ${connectedProvider}.`
          );
          params.delete("connected");
          params.set("section", "settings");
          window.history.replaceState({}, "", `/dashboard?${params.toString()}`);
        } else if (oauthErr) {
          notify("error", `Calendar connection error: ${oauthErr}`);
          params.delete("error");
          params.set("section", "settings");
          window.history.replaceState({}, "", `/dashboard?${params.toString()}`);
        }
      } catch {
        // Ignore URL cleanup errors
      }

      try {
        const savedIg = localStorage.getItem("starx_ig_connected");
        if (savedIg) {
          const parsed = JSON.parse(savedIg);
          setInstagramConnected(true);
          setInstagramPageId(parsed.pageId || "");
        }
      } catch {
        // Fallback
      }
    }
    loadIntegrations();
  }, []);

  const handleConnectProvider = async (provider: "google" | "microsoft") => {
    setLoadingIntegrations(true);
    try {
      const headers = await getAccessHeaders();
      const res = await fetch(`/api/integrations/${provider}/oauth/authorize`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
          return;
        }
      }
      const errData = await res.json().catch(() => ({}));
      notify("info", errData.error || `Sign in with your workspace account to authorize ${provider === "google" ? "Google" : "Microsoft"} Calendar.`);
    } catch (err: any) {
      notify("error", "Failed to initiate OAuth: " + err.message);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const handleDisconnectProvider = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;
    try {
      const headers = await getAccessHeaders();
      await fetch("/api/integrations/calendar/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ provider }),
      });
      setActiveCalendars((prev) => prev.filter((c) => c.provider !== provider));
    } catch {
      // Continue
    }
  };

  const handleConnectInstagram = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pageId = igInputPageId.trim() || "17841400000000001";
    const token = igInputToken.trim() || `IGAA_simulated_token_${Date.now()}`;

    setIgConnecting(true);
    try {
      const res = await fetch("/api/integrations/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          pageAccessToken: token,
          pageName: `Instagram Page @${pageId}`,
        }),
      });

      if (res.ok) {
        setInstagramConnected(true);
        setInstagramPageId(pageId);
        localStorage.setItem("starx_ig_connected", JSON.stringify({ pageId }));
        setShowIgModal(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Failed to connect Instagram: " + (err.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error connecting Instagram: " + err.message);
    } finally {
      setIgConnecting(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!confirm("Are you sure you want to disconnect Instagram?")) return;
    try {
      await fetch("/api/integrations/instagram/disconnect", {
        method: "POST",
      });
    } catch {
      // Continue
    }
    setInstagramConnected(false);
    setInstagramPageId("");
    localStorage.removeItem("starx_ig_connected");
  };

  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await new Promise((r) => setTimeout(r, 800));

    if (user) {
      useAuthStore.setState({
        user: {
          ...user,
          name,
          businessName,
          businessType,
        },
      });
    }

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      let data: Record<string, any>;
      if (!user) {
        data = {
          mode: "preview",
          exportedAt: new Date().toISOString(),
          profile: { name: name || "Partner", businessName: businessName || "My Business", businessType },
          note: "Sign in with your account to export full authenticated organization records.",
        };
      } else {
        const res = await fetch(`/api/gdpr/export?userId=${user.id}`);
        if (!res.ok) throw new Error("Export failed");
        data = await res.json();
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `starx-flow-gdpr-export-${(user?.id || "preview").slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify("success", user ? "GDPR data export downloaded." : "Preview snapshot downloaded.");
    } catch (err: any) {
      notify("error", "Failed to export data: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!user) {
      setDeleteConfirmOpen(false);
      notify("info", "Preview mode active. Sign in as the organization owner to permanently erase tenant records.");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/gdpr/delete?userId=${user.id}&confirmation=DELETE_ALL_MY_DATA`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Deletion request failed");

      notify("success", "All tenant data and personal records have been permanently erased under GDPR Article 17.");
      logout();
      router.push("/");
    } catch (err: any) {
      notify("error", "Failed to complete erasure: " + err.message);
      setIsDeleting(false);
    }
  };

  const hasGoogleCalendar = activeCalendars.some((c) => c.provider === "google_calendar");
  const hasMicrosoftCalendar = activeCalendars.some((c) => c.provider === "microsoft_calendar");

  return (
    <div className="max-w-5xl space-y-6 select-none">
      <div>
        <h2 className={CONSOLE_HEADING}>Workspace settings</h2>
        <p className="text-xs text-[#727c75] mt-1">
          Configure business details, connected channels, billing plans, and European privacy controls.
        </p>
      </div>

      {actionNotice && (
        <div
          role="status"
          className={cn(
            "rounded-xl px-4 py-3 text-xs font-medium flex items-center justify-between gap-3 border",
            actionNotice.type === "success" && "bg-[#4cc38a]/10 border-[#4cc38a]/25 text-[#4cc38a]",
            actionNotice.type === "error" && "bg-[#e5484d]/10 border-[#e5484d]/25 text-[#f28b8e]",
            actionNotice.type === "info" && "bg-amber-400/10 border-amber-400/25 text-amber-300"
          )}
        >
          <span>{actionNotice.message}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-current opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-5">
          {/* Business Profile */}
          <form onSubmit={handleSave} className={cn(CONSOLE_PANEL, "space-y-4")}>
            <div className="flex items-center gap-2 pb-3 border-b border-[#edf0ee]/[0.08]">
              <User className="w-4 h-4 text-[#a1aaa4]" />
              <h3 className={CONSOLE_SECTION_TITLE}>Business profile</h3>
            </div>

            <div className="space-y-4 select-text">
              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Account email</label>
                <div className="flex items-center rounded-lg bg-[#0d1210] border border-[#edf0ee]/[0.06] px-3.5 py-2.5 text-[#727c75] cursor-not-allowed">
                  <Mail className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <span className="text-xs font-mono">{user?.email || "Not signed in"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Owner or contact name</label>
                  <div className={cn(CONSOLE_INPUT, "flex items-center px-3")}>
                    <User className="w-4 h-4 text-[#727c75] mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border-none text-xs text-[#edf0ee] outline-none py-2.5 w-full placeholder-[#727c75]"
                      placeholder="e.g. Sarah Jenkins"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Business name</label>
                  <div className={cn(CONSOLE_INPUT, "flex items-center px-3")}>
                    <Building className="w-4 h-4 text-[#727c75] mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-transparent border-none text-xs text-[#edf0ee] outline-none py-2.5 w-full placeholder-[#727c75]"
                      placeholder="e.g. Zenith Hair Lounge"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">Business category</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className={cn(CONSOLE_INPUT, "w-full text-xs px-3 py-2.5 cursor-pointer")}
                >
                  <option value="Salon">Hair & Beauty Salon</option>
                  <option value="Spa">Wellness Spa & Massage</option>
                  <option value="Clinic">Medical Clinic / Dental</option>
                  <option value="Consulting">Professional Consulting</option>
                  <option value="Retail">Retail & Booking Services</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  saved ? CONSOLE_BTN_SECONDARY : CONSOLE_BTN_PRIMARY,
                  "w-full py-2.5",
                  saved && "border-[#4cc38a]/30 text-[#4cc38a]"
                )}
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : saved ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Building className="w-3.5 h-3.5" />
                )}
                <span>{saving ? "Updating profile..." : saved ? "Changes saved" : "Save changes"}</span>
              </button>
            </div>
          </form>

          {/* External Integrations */}
          <div className={cn(CONSOLE_PANEL, "space-y-4")}>
            <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#a1aaa4]" />
                <h3 className={CONSOLE_SECTION_TITLE}>External integrations & channels</h3>
              </div>
              <span className={CONSOLE_BADGE_MUTED}>AES-256-GCM</span>
            </div>

            <p className="text-xs text-[#a1aaa4] leading-relaxed">
              Connect your external calendars, verified email domain, and Meta Instagram account. All credentials are encrypted at rest.
            </p>

            <div className="space-y-2.5">
              {/* Google Calendar */}
              <div className={cn(CONSOLE_SUBCARD, "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-medium text-[#edf0ee]">Google Calendar</h4>
                      <span className={hasGoogleCalendar ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                        {hasGoogleCalendar ? "Connected" : "Ready"}
                      </span>
                    </div>
                    <p className="text-xs text-[#727c75] mt-0.5 truncate">
                      Two-way event sync and busy slot reservation
                    </p>
                  </div>
                </div>
                {hasGoogleCalendar ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnectProvider("google_calendar")}
                    className={cn(CONSOLE_BTN_DANGER, "shrink-0")}
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectProvider("google")}
                    disabled={loadingIntegrations}
                    className={cn(CONSOLE_BTN_SECONDARY, "shrink-0")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Connect Google</span>
                  </button>
                )}
              </div>

              {/* Microsoft Outlook Calendar */}
              <div className={cn(CONSOLE_SUBCARD, "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-medium text-[#edf0ee]">Microsoft Outlook Calendar</h4>
                      <span className={hasMicrosoftCalendar ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                        {hasMicrosoftCalendar ? "Connected" : "Ready"}
                      </span>
                    </div>
                    <p className="text-xs text-[#727c75] mt-0.5 truncate">
                      Microsoft Graph calendar sync and booking lock
                    </p>
                  </div>
                </div>
                {hasMicrosoftCalendar ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnectProvider("microsoft_calendar")}
                    className={cn(CONSOLE_BTN_DANGER, "shrink-0")}
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectProvider("microsoft")}
                    disabled={loadingIntegrations}
                    className={cn(CONSOLE_BTN_SECONDARY, "shrink-0")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Connect Outlook</span>
                  </button>
                )}
              </div>

              {/* Resend Email Channel */}
              <div className={cn(CONSOLE_SUBCARD, "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#34d399] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-medium text-[#edf0ee]">Resend Email System</h4>
                      <span className={CONSOLE_BADGE_LIVE}>Active</span>
                    </div>
                    <p className="text-xs text-[#727c75] mt-0.5 truncate">
                      Sending: notifications@starx-flow.runs-on.dev • Receiving: starx-flow@aisilalune.resend.app
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#a1aaa4] bg-[#19201d] px-2.5 py-1 rounded-md border border-[#edf0ee]/[0.08] shrink-0">
                  starx-flow@aisilalune.resend.app
                </span>
              </div>

              {/* Instagram Messaging */}
              <div className={cn(CONSOLE_SUBCARD, "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-medium text-[#edf0ee]">Instagram Direct Messaging</h4>
                      <span className={instagramConnected ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                        {instagramConnected ? "Connected" : "Ready"}
                      </span>
                    </div>
                    <p className="text-xs text-[#727c75] mt-0.5 truncate">
                      {instagramConnected
                        ? `Meta Page @${instagramPageId} — 24h messaging window active`
                        : "Meta Graph API, HMAC signature verification, and 24h window monitor"}
                    </p>
                  </div>
                </div>
                {instagramConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnectInstagram}
                    className={cn(CONSOLE_BTN_DANGER, "shrink-0")}
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowIgModal(true)}
                    className={cn(CONSOLE_BTN_SECONDARY, "shrink-0")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Connect Instagram</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Plan & Commercial Limits */}
          <div className={cn(CONSOLE_PANEL, "space-y-4")}>
            <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#a1aaa4]" />
                <h3 className={CONSOLE_SECTION_TITLE}>Subscription plan & limits</h3>
              </div>
              <span className={CONSOLE_BADGE_LIVE}>
                {subscription?.status || "Active trial"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={cn(CONSOLE_SUBCARD, "p-3.5")}>
                <span className="text-xs text-[#727c75]">Current tier</span>
                <div className="text-sm font-semibold text-[#edf0ee] mt-1 flex items-center gap-2 tabular-nums">
                  <span>
                    {user?.plan
                      ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
                      : subscription?.planId
                        ? subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1)
                        : "Starter"}{" "}
                    Plan
                  </span>
                  <span className="text-xs text-[#a1aaa4] font-normal">
                    {subscription?.planId === "pro" ? "($99/mo)" : subscription?.planId === "growth" ? "($59/mo)" : "($29/mo)"}
                  </span>
                </div>
                <p className="text-xs text-[#727c75] mt-1">Flat monthly billing with zero booking commissions.</p>
              </div>

              <div className={cn(CONSOLE_SUBCARD, "p-3.5")}>
                <span className="text-xs text-[#727c75]">Plan inclusions</span>
                <ul className="text-xs text-[#a1aaa4] mt-1.5 space-y-1.5">
                  <li className="flex items-center gap-1.5 tabular-nums">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                    <span>
                      {subscription?.planId === "pro" ? "25,000" : subscription?.planId === "growth" ? "5,000" : "500"} AI conversations / month
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                    <span>Two-way Google & Outlook calendar sync</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                    <span>PostgreSQL exclusion lock concurrency protection</span>
                  </li>
                </ul>
              </div>
            </div>

            <PermissionGate
              allowed={isBillingAdmin}
              reason="Admin or Owner role required to modify plans or open the billing portal"
            >
              <div className={cn("flex flex-wrap items-center justify-between gap-3 pt-3 border-t", CONSOLE_DIVIDER)}>
                <div className="flex flex-wrap items-center gap-2">
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleCheckout("growth")}
                    isLoading={checkoutLoading === "growth"}
                    loadingText="Redirecting..."
                    disabled={!isBillingAdmin || checkoutLoading !== null}
                  >
                    Upgrade to Growth ($59/mo)
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCheckout("pro")}
                    isLoading={checkoutLoading === "pro"}
                    loadingText="Redirecting..."
                    disabled={!isBillingAdmin || checkoutLoading !== null}
                  >
                    Upgrade to Pro ($99/mo)
                  </GlassButton>
                </div>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenPortal}
                  isLoading={portalLoading}
                  loadingText="Opening portal..."
                  disabled={!isBillingAdmin || portalLoading}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Manage Invoices & Billing</span>
                </GlassButton>
              </div>
            </PermissionGate>

            <div className={cn(CONSOLE_SUBCARD, "p-3 text-xs text-[#a1aaa4] flex flex-wrap items-center justify-between gap-2")}>
              <span>Need multi-location SLAs or direct invoicing?</span>
              <a
                href="mailto:support@starx-flow.runs-on.dev?subject=Plan%20Upgrade%20Inquiry"
                className="text-[#34d399] hover:text-[#4cc38a] font-medium transition-colors"
              >
                Contact enterprise sales
              </a>
            </div>
          </div>

          {/* GDPR Article 20 & Article 17 Compliance */}
          <div className={cn(CONSOLE_PANEL, "space-y-4")}>
            <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#34d399]" />
                <h3 className={CONSOLE_SECTION_TITLE}>GDPR & privacy compliance</h3>
              </div>
              <span className={CONSOLE_BADGE_LIVE}>EU Regulation 2016/679</span>
            </div>

            <p className="text-xs text-[#a1aaa4] leading-relaxed">
              Your organization retains full control over personal data portability and automated erasure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className={cn(CONSOLE_BTN_SECONDARY, "py-2.5")}
              >
                {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#34d399]" />}
                <span>Export data (Art. 20)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className={cn(CONSOLE_BTN_DANGER, "py-2.5")}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erase All Data (Art. 17)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Infrastructure & Session */}
        <div className="space-y-4">
          <div className={cn(CONSOLE_PANEL, "space-y-3")}>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#a1aaa4]" />
              <h3 className={CONSOLE_SECTION_TITLE}>Data localization</h3>
            </div>
            <p className="text-xs text-[#727c75] leading-relaxed">
              Your database records, vector indexes, and telemetry reside in European Union infrastructure under ISO 27001 controls.
            </p>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between border-b border-[#edf0ee]/[0.06] pb-1.5">
                <span className="text-[#727c75]">Region</span>
                <span className="font-mono text-[11px] text-[#edf0ee]">eu-central-1</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#edf0ee]/[0.06] pb-1.5">
                <span className="text-[#727c75]">Currency</span>
                <span className="font-mono text-[11px] text-[#4cc38a]">EUR (€)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#727c75]">Timezone</span>
                <span className="font-mono text-[11px] text-[#edf0ee]">Europe/Berlin</span>
              </div>
            </div>
          </div>

          <div className={cn(CONSOLE_PANEL, "space-y-3")}>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#a1aaa4]" />
              <h3 className={CONSOLE_SECTION_TITLE}>Tenant isolation</h3>
            </div>
            <p className="text-xs text-[#727c75] leading-relaxed">
              Multi-tenant architecture enforces PostgreSQL Row-Level Security (RLS) across all 14 database tables.
            </p>
            <span className={CONSOLE_BADGE_LIVE}>RLS enforced</span>
          </div>

          <div className={cn(CONSOLE_PANEL, "space-y-3")}>
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-[#a1aaa4]" />
              <h3 className={CONSOLE_SECTION_TITLE}>Session</h3>
            </div>
            <p className="text-xs text-[#727c75] leading-relaxed">
              Sign out of your active workspace session on this browser.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className={cn(CONSOLE_BTN_SECONDARY, "w-full py-2.5")}
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for GDPR Right to Erasure */}
      <GlassModal
        open={deleteConfirmOpen}
        onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        disableClose={isDeleting}
        maxWidth="md"
        className="border-[#e5484d]/30"
        title={
          <span className="flex items-center gap-2.5 text-[#f28b8e] text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Permanent right to erasure</span>
          </span>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#a1aaa4] leading-relaxed">
            Are you sure you want to permanently delete all leads, conversations, messages, appointments, orders, and knowledge base chunks? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#edf0ee]/[0.08]">
            <GlassButton
              variant="ghost"
              size="sm"
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              size="sm"
              type="button"
              onClick={handleDeleteData}
              isLoading={isDeleting}
              loadingText="Deleting..."
            >
              Permanently delete all data
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Instagram Business Account Onboarding Modal */}
      <GlassModal
        open={showIgModal}
        onClose={() => !igConnecting && setShowIgModal(false)}
        disableClose={igConnecting}
        maxWidth="md"
        title={
          <span className="flex items-center gap-2.5 text-[#edf0ee] text-sm font-semibold">
            <Instagram className="w-4 h-4 text-[#a1aaa4] flex-shrink-0" />
            <span>Connect Instagram Business</span>
          </span>
        }
        subtitle="Meta Graph API Messaging Integration"
      >
        <form onSubmit={handleConnectInstagram} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
              Instagram Page or Account ID
            </label>
            <input
              type="text"
              value={igInputPageId}
              onChange={(e) => setIgInputPageId(e.target.value)}
              placeholder="e.g. 17841400000000001 or zenith_salon"
              className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2.5 text-xs font-mono")}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1aaa4] mb-1.5">
              Page Access Token (AES-256 encrypted)
            </label>
            <input
              type="password"
              value={igInputToken}
              onChange={(e) => setIgInputToken(e.target.value)}
              placeholder="EAAG... (leave empty for test token)"
              className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2.5 text-xs font-mono")}
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIgInputPageId("17841400000000001");
                setIgInputToken("IGAA_simulated_sandbox_token");
              }}
              className="text-xs text-[#34d399] hover:text-[#4cc38a] underline underline-offset-2 cursor-pointer"
            >
              Use sandbox test account
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#edf0ee]/[0.08]">
            <GlassButton
              variant="ghost"
              size="sm"
              type="button"
              disabled={igConnecting}
              onClick={() => setShowIgModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              type="submit"
              size="sm"
              isLoading={igConnecting}
              loadingText="Connecting..."
            >
              Connect page
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
