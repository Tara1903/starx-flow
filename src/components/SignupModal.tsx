import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Loader2, CheckCircle, ChevronDown } from "lucide-react";

interface SignupModalProps {
  onClose: () => void;
}

export function SignupModal({ onClose }: SignupModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    monthlyOrders: "",
    ownerName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, loading]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (
      !formData.businessName.trim() ||
      formData.businessName.trim().length < 2
    ) {
      newErrors.businessName = "Business name must be at least 2 characters";
    }
    if (!formData.businessType) {
      newErrors.businessType = "Please select a business type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    // Optional field, no strict validation needed but returning true allows advancing
    return true;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.ownerName.trim() || formData.ownerName.trim().length < 2) {
      newErrors.ownerName = "Owner name must be at least 2 characters";
    }
    if (
      !formData.email.trim() ||
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^\+?[0-9\s\-()\.]{7,20}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (min. 7 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(4); // Success step
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!loading) onClose();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#050505] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/10 flex flex-col"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {step === 4 ? "Request Received" : "Start Free Trial"}
            </h2>
            {step < 4 && (
              <p className="text-sm text-zinc-400 mt-1">Step {step} of 3</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar (if not success) */}
        {step < 4 && (
          <div className="w-full h-1 bg-zinc-900 absolute top-[77px] left-0">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Body */}
        <div className="p-6 relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        businessName: e.target.value,
                      });
                      if (errors.businessName)
                        setErrors({ ...errors, businessName: "" });
                    }}
                    placeholder="E.g. Acme Local"
                    className="w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors"
                    style={{
                      borderColor: errors.businessName
                        ? "rgb(239 68 68 / 0.5)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {errors.businessName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Business Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.businessType}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          businessType: e.target.value,
                        });
                        if (errors.businessType)
                          setErrors({ ...errors, businessType: "" });
                      }}
                      className="w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white appearance-none transition-colors"
                      style={{
                        borderColor: errors.businessType
                          ? "rgb(239 68 68 / 0.5)"
                          : "rgba(255,255,255,0.1)",
                        color:
                          formData.businessType === "" ? "#71717a" : "white",
                      }}
                    >
                      <option value="" disabled>
                        Select a business type
                      </option>
                      <option value="Restaurant">
                        Restaurant (e.g., Cafe, Pizzeria)
                      </option>
                      <option value="Salon">
                        Salon (e.g., Hair, Nails, Spa)
                      </option>
                      <option value="Gym">
                        Gym (e.g., Fitness Center, Yoga)
                      </option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  {errors.businessType && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.businessType}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Monthly Orders (optional)
                  </label>
                  <div className="relative">
                    <select
                      value={formData.monthlyOrders}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyOrders: e.target.value,
                        })
                      }
                      className="w-full bg-[#111] border border-white/10 focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white appearance-none transition-colors"
                      style={{
                        color:
                          formData.monthlyOrders === "" ? "#71717a" : "white",
                      }}
                    >
                      <option value="" disabled>
                        Select approximate monthly orders
                      </option>
                      <option value="0-50">0–50</option>
                      <option value="50-200">50–200</option>
                      <option value="200+">200+</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerName: e.target.value });
                      if (errors.ownerName)
                        setErrors({ ...errors, ownerName: "" });
                    }}
                    placeholder="Full Name"
                    className="w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors"
                    style={{
                      borderColor: errors.ownerName
                        ? "rgb(239 68 68 / 0.5)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {errors.ownerName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.ownerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="you@company.com"
                    className="w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors"
                    style={{
                      borderColor: errors.email
                        ? "rgb(239 68 68 / 0.5)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    placeholder="+44 123 456 7890"
                    className="w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors"
                    style={{
                      borderColor: errors.phone
                        ? "rgb(239 68 68 / 0.5)"
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <CheckCircle className="text-emerald-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  You're all set.
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-8">
                  We'll contact you shortly to activate your system.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold rounded-full py-4 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="p-6 pt-2 border-t border-white/5 relative z-10 flex gap-4 mt-2">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-full text-zinc-400 hover:text-white font-medium hover:bg-white/5 transition-colors"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full py-3 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 disabled:hover:bg-emerald-500 text-black font-bold rounded-full py-3 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Start My Free Trial"
                )}
              </button>
            )}
          </div>
        )}

        {step < 4 && (
          <p className="text-center text-xs text-zinc-500 pb-4">
            No credit card required
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
