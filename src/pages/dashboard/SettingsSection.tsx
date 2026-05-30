import React, { useState } from "react";
import { User, Building, Mail, ShieldAlert, Check, RefreshCw, Key, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

export function SettingsSection() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [businessType, setBusinessType] = useState(user?.businessType || "Salon");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    // Simulate saving profile data
    await new Promise((r) => setTimeout(r, 1000));
    
    // Update local store state
    if (user) {
      useAuthStore.setState({
        user: {
          ...user,
          name,
          businessName,
          businessType
        }
      });
    }

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="max-w-3xl space-y-6 select-none animate-[fade-in_0.4s_ease-out]">
      {/* Header Info */}
      <div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          Command Center Settings
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Configure business details, administrative profiles, and automation parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form Editor */}
        <div className="md:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="glass-card rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-500" />
              <span>Business Profile</span>
            </h3>

            {/* Profile fields */}
            <div className="space-y-4 select-text">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Account Email</label>
                <div className="relative flex items-center bg-white/[0.01] border border-white/5 rounded-xl px-3.5 py-3 text-zinc-500 cursor-not-allowed">
                  <Mail className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <span className="text-xs font-semibold">{user?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Owner / Contact Name</label>
                  <div className="relative flex items-center bg-white/[0.01] border border-white/10 rounded-xl px-3.5 focus-within:border-emerald-500/30 transition-colors">
                    <User className="w-4 h-4 text-zinc-500 mr-2.5 flex-shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border-none text-xs text-white outline-none py-3.5 w-full font-semibold placeholder-zinc-600"
                      placeholder="E.g. Sarah Jenkins"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Business Name</label>
                  <div className="relative flex items-center bg-white/[0.01] border border-white/10 rounded-xl px-3.5 focus-within:border-emerald-500/30 transition-colors">
                    <Building className="w-4 h-4 text-zinc-500 mr-2.5 flex-shrink-0" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-transparent border-none text-xs text-white outline-none py-3.5 w-full font-semibold placeholder-zinc-600"
                      placeholder="E.g. Zenith Hair Lounge"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Business Niche / Category</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-xs font-semibold text-white rounded-xl px-3.5 py-3.5 outline-none focus:border-emerald-500/30 transition-all select-none"
                >
                  <option value="Salon">Hair & Beauty Salon</option>
                  <option value="Spa">Wellness Spa & Massage</option>
                  <option value="Clinic">Medical Clinic / Dental</option>
                  <option value="Consulting">Professional Consulting</option>
                  <option value="Retail">Retail & Booking Services</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "w-full font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-wider select-none flex items-center justify-center gap-1.5 border mt-4",
                saved
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              )}
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Building className="w-3.5 h-3.5" />
              )}
              <span>{saving ? "Updating Profile..." : saved ? "Changes Saved!" : "Save Changes"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Platform Security Cards */}
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-zinc-500" />
              <span>Platform Safety</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-normal mb-3">
              Your communications operate behind a secure sandbox using row-level authorization models.
            </p>
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[10px] font-bold text-emerald-400 w-fit">
              <span>RLS Model Enforcement</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-red-500/10 bg-red-500/[0.01]">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Danger Zone</span>
            </h3>
            <p className="text-[11px] text-zinc-600 leading-normal mb-4">
              Once you delete your organization, all automated triages, connected sandboxes, and messaging logs will be lost.
            </p>
            <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors">
              Delete Organization
            </button>
          </div>

          {/* Logout Card */}
          <div className="glass-card rounded-xl p-5 border border-zinc-800 bg-black/40">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-zinc-500" />
              <span>Session</span>
            </h3>
            <p className="text-[11px] text-zinc-500 leading-normal mb-4">
              Log out of your administrative session securely.
            </p>
            <button 
              onClick={handleLogout}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
