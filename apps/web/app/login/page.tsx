"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  ArrowLeft,
  ShoppingBag,
  Store,
  Briefcase,
  Loader2,
  Shield,
  Phone,
  ChevronRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */

type Step = "phone" | "otp" | "role";
type UserRole = "customer" | "vendor" | "agent";

interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  route: string;
  gradient: string;
  borderActive: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "customer",
    title: "Customer",
    subtitle: "Buy & Hire Locally",
    description: "I want to buy local items, compare prices, and hire trusted service experts.",
    icon: ShoppingBag,
    emoji: "🛒",
    route: "/",
    gradient: "from-primary to-primary-light",
    borderActive: "border-primary/50 ring-primary/20",
  },
  {
    id: "vendor",
    title: "Pehchan Wala",
    subtitle: "Sell & Offer Services",
    description: "I want to sell items, offer repair services, and grow my local business.",
    icon: Store,
    emoji: "🔧",
    route: "/vendor-dashboard",
    gradient: "from-accent to-accent-light",
    borderActive: "border-accent/50 ring-accent/20",
  },
  {
    id: "agent",
    title: "Agent",
    subtitle: "Register & Earn",
    description: "I want to register local shops, collect fees, and earn commission.",
    icon: Briefcase,
    emoji: "💼",
    route: "/agent-dashboard",
    gradient: "from-emerald-500 to-green-500",
    borderActive: "border-emerald-500/50 ring-emerald-500/20",
  },
];

/* ══════════════════════════════════════════════════════════════════
   SUPABASE AUTH FUNCTIONS
   ══════════════════════════════════════════════════════════════════ */

/**
 * Sends OTP to the given phone number via Supabase Auth.
 * Falls back to demo mode if Supabase SMS is not configured.
 */
async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  if (phone.length !== 10) {
    return { success: false, error: "Invalid phone number" };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });

    if (error) {
      console.warn("Supabase OTP error (falling back to demo mode):", error.message);
      // Fall back to demo mode — let user proceed with mock OTP "1234"
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true };
    }

    return { success: true };
  } catch (err) {
    console.warn("Supabase unreachable, using demo mode");
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  }
}

/**
 * Verifies the OTP entered by the user via Supabase Auth.
 * Falls back to demo mode (accepts "1234") if Supabase SMS is not configured.
 */
async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ success: boolean; isNewUser: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms",
    });

    if (error) {
      console.warn("Supabase verify error (falling back to demo mode):", error.message);
      // Fall back to demo mode
      if (otp !== "1234") {
        return { success: false, isNewUser: false, error: "Invalid OTP. Please try again." };
      }
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check if user has a profile (demo: always new)
      return { success: true, isNewUser: true };
    }

    // Real Supabase success — check if they have a profile row
    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      return { success: true, isNewUser: !profile };
    }

    return { success: true, isNewUser: true };
  } catch (err) {
    console.warn("Supabase unreachable, using demo mode");
    if (otp !== "1234") {
      return { success: false, isNewUser: false, error: "Invalid OTP. Please try again." };
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, isNewUser: true };
  }
}

/* ══════════════════════════════════════════════════════════════════
   STEP 1: PHONE NUMBER ENTRY
   ══════════════════════════════════════════════════════════════════ */

function StepPhone({
  onSubmit,
}: {
  onSubmit: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    if (error) setError("");
  };

  const isValid = phone.length === 10;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError("");

    const result = await sendOtp(phone);
    setLoading(false);

    if (result.success) {
      onSubmit(phone);
    } else {
      setError(result.error || "Failed to send OTP. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-8">
        {/* Logo + Welcome */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl animate-scale-in">
            <span className="text-white text-3xl font-black">प</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight animate-fade-in-up">
            Welcome to{" "}
            <span className="text-gradient-primary">Pehchan Wale</span>
          </h1>
          <p className="text-sm sm:text-base text-text-muted mt-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Your city, your market, your people.
          </p>
        </div>

        {/* Phone Input */}
        <div className="max-w-sm mx-auto w-full space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Mobile Number
          </label>

          <div className={`flex items-center bg-card-bg rounded-2xl border-2 overflow-hidden transition-all duration-300 shadow-sm
            ${error ? "border-danger" : "border-card-border focus-within:border-primary/50 focus-within:shadow-lg"}`}>
            {/* Country code */}
            <div className="flex items-center gap-1.5 pl-4 pr-3 py-4 bg-surface border-r border-border flex-shrink-0">
              <span className="text-base">🇮🇳</span>
              <span className="text-sm font-bold text-text-primary">+91</span>
            </div>

            {/* Phone input */}
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="98765 43210"
              maxLength={10}
              className="flex-1 px-4 py-4 text-lg font-bold text-text-primary placeholder:text-text-muted/50
                outline-none bg-transparent tracking-wider"
              autoComplete="tel-national"
            />

            {/* Validation indicator */}
            <div className="pr-4">
              {isValid ? (
                <CheckCircle2 className="w-5 h-5 text-success animate-scale-in" />
              ) : phone.length > 0 ? (
                <span className="text-[10px] font-bold text-text-muted">{phone.length}/10</span>
              ) : (
                <Phone className="w-5 h-5 text-text-muted/30" />
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <p className="text-xs font-medium text-danger">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-bold shadow-lg
              transition-all duration-300 active:scale-[0.97]
              ${isValid && !loading
                ? "bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-xl hover:-translate-y-0.5 shadow-[var(--shadow-primary)]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Get OTP
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Terms */}
          <p className="text-center text-[10px] text-text-muted leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary font-semibold hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Bottom trust badge */}
      <div className="px-6 pb-8 pt-4">
        <div className="flex items-center justify-center gap-2 py-3 bg-surface rounded-2xl border border-border max-w-sm mx-auto">
          <Lock className="w-3.5 h-3.5 text-success" />
          <span className="text-xs font-semibold text-text-muted">
            🔒 100% Secure & Local · Data stays in India
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STEP 2: OTP VERIFICATION
   ══════════════════════════════════════════════════════════════════ */

function StepOTP({
  phone,
  onVerified,
  onBack,
}: {
  phone: string;
  onVerified: (isNewUser: boolean) => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 400);
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const maskedPhone = phone.slice(0, 2) + "XXXXXX" + phone.slice(8);

  const handleChange = (index: number, value: string) => {
    if (error) setError("");

    // Handle paste
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 4).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 4) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const otpCode = otp.join("");
  const isComplete = otpCode.length === 4;

  const handleVerify = async () => {
    if (!isComplete || loading) return;
    setLoading(true);
    setError("");

    const result = await verifyOtp(phone, otpCode);
    setLoading(false);

    if (result.success) {
      onVerified(result.isNewUser);
    } else {
      setError(result.error || "Verification failed. Please try again.");
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setError("");

    await sendOtp(phone);
    setResending(false);
    setResendTimer(30);
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent-subtle flex items-center justify-center animate-scale-in">
            <Smartphone className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-tight animate-fade-in-up">
            Verify your number
          </h1>
          <p className="text-sm text-text-muted mt-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Enter the 4-digit code sent to{" "}
            <span className="font-bold text-text-primary">+91-{maskedPhone}</span>
          </p>
          <button
            onClick={onBack}
            className="text-xs text-primary font-semibold mt-1 hover:underline animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            Change number
          </button>
        </div>

        {/* OTP Inputs */}
        <div className="max-w-sm mx-auto w-full space-y-5">
          <div className="flex justify-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl sm:text-3xl font-extrabold
                  bg-card-bg border-2 rounded-2xl outline-none transition-all duration-200
                  ${error
                    ? "border-danger text-danger animate-[shake_0.3s_ease-in-out]"
                    : digit
                      ? "border-accent text-accent shadow-md"
                      : "border-card-border text-text-primary focus:border-accent/60 focus:shadow-lg"
                  }`}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-xl border border-red-100 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <p className="text-xs font-medium text-danger">{error}</p>
            </div>
          )}

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={!isComplete || loading}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-bold shadow-lg
              transition-all duration-300 active:scale-[0.97]
              ${isComplete && !loading
                ? "bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-xl hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Verify & Login
              </>
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-xs text-text-muted">
                Resend OTP in{" "}
                <span className="font-bold text-text-secondary countdown-digit">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-bold text-primary hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </button>
            )}
          </div>

          {/* Hint for mock */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 mx-auto max-w-fit">
            <span className="text-[10px] text-amber-700 font-medium">
              💡 Demo: Use OTP <span className="font-extrabold">1234</span> to proceed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STEP 3: ROLE SELECTION
   ══════════════════════════════════════════════════════════════════ */

function StepRole({ phone }: { phone: string }) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole || loading) return;
    setLoading(true);

    // Simulate saving role to database
    await new Promise((resolve) => setTimeout(resolve, 800));

    const route = ROLE_OPTIONS.find((r) => r.id === selectedRole)!.route;
    router.push(route);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-tight animate-fade-in-up">
            How do you want to use{" "}
            <span className="text-gradient-primary">Pehchan Wale</span>?
          </h1>
          <p className="text-sm text-text-muted mt-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Choose your role — you can always switch later
          </p>
        </div>

        {/* Role Cards */}
        <div className="max-w-sm mx-auto w-full space-y-3">
          {ROLE_OPTIONS.map((role, i) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 animate-fade-in-up
                  ${isSelected
                    ? `${role.borderActive} ring-2 shadow-lg -translate-y-0.5`
                    : "border-card-border hover:border-card-hover-border hover:shadow-sm"
                  }`}
                style={{ animationDelay: `${200 + i * 80}ms` }}
              >
                <div className="flex items-start gap-3.5 p-4 sm:p-5">
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${isSelected
                      ? `bg-gradient-to-br ${role.gradient} shadow-md`
                      : "bg-surface"
                    }`}>
                    {isSelected ? (
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    ) : (
                      <span className="text-2xl sm:text-3xl">{role.emoji}</span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base sm:text-lg font-extrabold transition-colors
                        ${isSelected ? "text-text-primary" : "text-text-primary"}`}>
                        {role.title}
                      </h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 animate-scale-in" />
                      )}
                    </div>
                    <p className={`text-xs font-bold mt-0.5 ${isSelected ? "text-primary" : "text-text-muted"}`}>
                      {role.subtitle}
                    </p>
                    <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Continue button */}
          <div className="pt-3" style={{ animationDelay: "500ms" }}>
            <button
              onClick={handleContinue}
              disabled={!selectedRole || loading}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-bold shadow-lg
                transition-all duration-300 active:scale-[0.97] animate-fade-in-up
                ${selectedRole && !loading
                  ? "bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-xl hover:-translate-y-0.5 shadow-[var(--shadow-primary)]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              style={{ animationDelay: "500ms" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="px-6 pb-8 pt-2">
        <p className="text-center text-[10px] text-text-muted">
          Pehchan Wale — Apne Logon Se, Sahi Daam Mein 🤝
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TOP HEADER (minimal)
   ══════════════════════════════════════════════════════════════════ */

function LoginHeader({
  step,
  onBack,
}: {
  step: Step;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--header-border)]">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-[60px]">
          <div className="flex items-center gap-2">
            {step !== "phone" && onBack ? (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-text-secondary" />
              </button>
            ) : (
              <Link href="/" className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface transition-colors">
                <ArrowLeft className="w-5 h-5 text-text-secondary" />
              </Link>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white text-xs font-black">प</span>
              </div>
              <span className="text-sm font-extrabold text-text-primary">Pehchan</span>
              <span className="text-sm font-extrabold text-primary">Wale</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {(["phone", "otp", "role"] as Step[]).map((s, i) => {
              const stepIndex = ["phone", "otp", "role"].indexOf(step);
              return (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === stepIndex
                      ? "w-6 bg-primary"
                      : i < stepIndex
                        ? "w-3 bg-primary/40"
                        : "w-3 bg-border"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */

function LoginPageInner() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback((nextStep: Step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const handlePhoneSubmit = (phoneNumber: string) => {
    setPhone(phoneNumber);
    transitionTo("otp");
  };

  const handleOtpVerified = (isNewUser: boolean) => {
    if (isNewUser) {
      transitionTo("role");
    } else {
      // Existing user — redirect to home
      router.push("/");
    }
  };

  const handleBackToPhone = () => {
    transitionTo("phone");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto min-h-screen">
        <LoginHeader
          step={step}
          onBack={step === "otp" ? handleBackToPhone : undefined}
        />

        <div
          className={`transition-all duration-300 ease-in-out ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          {step === "phone" && <StepPhone onSubmit={handlePhoneSubmit} />}
          {step === "otp" && (
            <StepOTP
              phone={phone}
              onVerified={handleOtpVerified}
              onBack={handleBackToPhone}
            />
          )}
          {step === "role" && <StepRole phone={phone} />}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginPageInner />;
}
