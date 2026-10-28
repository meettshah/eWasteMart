"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@nextui-org/react";
import { BadgeCheck, Building2, Eye, EyeOff, Factory, LockKeyhole, Mail, UserRound } from "lucide-react";

const roles = [
  {
    value: "user",
    title: "Individual Seller",
    text: "Sell household e-waste lots with doorstep OTP pickups.",
    icon: UserRound,
  },
  {
    value: "bulk_seller",
    title: "Bulk IT Disposer",
    text: "List decommissioned pallets for corporate assets.",
    icon: Building2,
  },
  {
    value: "recycler",
    title: "Certified Recycler",
    text: "Bid on lots matching your processing capabilities.",
    icon: Factory,
  },
  {
    value: "enterprise",
    title: "Enterprise / EPR",
    text: "Run brand take-back & download ESG audit reports.",
    icon: BadgeCheck,
  },
];

const RegisterForm = () => {
  const { register, handleSubmit, setError, watch, formState: { errors }, reset } = useForm({
    defaultValues: { role: "user" },
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/register", data);

      if (res.status === 201) {
        reset();
        router.push("/login");
      }
    } catch (error) {
      setError("formError", { type: "manual", message: error.response?.data?.message || "Registration failed. Please try again." });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
      {/* Full Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Full Name / Organization
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            id="name"
            autoComplete="name"
            placeholder="Kanishk Chaudhary"
            className="w-full pl-10 text-xs"
            suppressHydrationWarning
          />
        </div>
        {errors.name && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name.message}</p>}
      </div>

      {/* Role Selection Grid */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select Your Platform Role
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.value;
            return (
              <label
                key={r.value}
                className={`relative flex cursor-pointer items-start gap-2.5 rounded-2xl border p-3 transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500/40 dark:border-emerald-500 dark:bg-emerald-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <input
                  {...register("role", { required: "Role is required" })}
                  type="radio"
                  value={r.value}
                  className="sr-only"
                  suppressHydrationWarning
                />
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  isSelected 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {r.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {r.text}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
        {errors.role && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.role.message}</p>}
      </div>

      {/* Email Address */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Work or Personal Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Enter a valid email address" },
            })}
            type="email"
            id="email"
            autoComplete="email"
            placeholder="you@domain.com"
            className="w-full pl-10 text-xs"
            suppressHydrationWarning
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="w-full pl-10 pr-10 text-xs"
            suppressHydrationWarning
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
            suppressHydrationWarning
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>}
      </div>

      {/* Terms Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            {...register("terms", { required: "You must agree to the Terms & Conditions" })}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            suppressHydrationWarning
          />
          <span>
            I agree to the{" "}
            <a href="/terms" className="text-emerald-600 font-semibold hover:underline dark:text-emerald-400" target="_blank">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-emerald-600 font-semibold hover:underline dark:text-emerald-400" target="_blank">
              Privacy Policy
            </a>.
          </span>
        </label>
        {errors.terms && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.terms.message}</p>}
      </div>

      {errors.formError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {errors.formError.message}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-98 disabled:opacity-50"
        suppressHydrationWarning
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Creating account...</span>
          </div>
        ) : (
          "Complete Registration"
        )}
      </button>

      {/* Google OAuth Alternative */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        <span className="shrink-0 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          or sign up with
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors active:scale-98"
        suppressHydrationWarning
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Register with Google
      </button>
    </form>
  );
};

export default RegisterForm;
