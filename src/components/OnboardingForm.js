"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BadgeCheck, Building2, Factory, UserRound, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const roles = [
  { 
    value: "user", 
    title: "Individual Seller", 
    text: "Sell household laptops, phones & gadgets with AI pricing.", 
    icon: UserRound 
  },
  { 
    value: "bulk_seller", 
    title: "Bulk IT Seller", 
    text: "List corporate servers, monitors & decommissioned IT assets.", 
    icon: Building2 
  },
  { 
    value: "recycler", 
    title: "Authorized Recycler", 
    text: "Bid on lots, coordinate dispatches & earn green credits.", 
    icon: Factory 
  },
  { 
    value: "enterprise", 
    title: "Enterprise Brand", 
    text: "Manage EPR targets, takeback drives & audit-ready certificates.", 
    icon: BadgeCheck 
  },
];

const OnboardingForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();
  
  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await update({ role: data.role });
        router.push("/home");
        router.refresh();
      } else {
        throw new Error("Failed to set role");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-3">
        {roles.map((role) => {
          const isSelected = selectedRole === role.value;
          const Icon = role.icon;
          return (
            <label
              key={role.value}
              className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4.5 transition-all duration-200 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500/[0.08] ring-2 ring-emerald-500/20 dark:bg-emerald-500/10"
                  : "border-slate-200/80 bg-white/60 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
              }`}
            >
              <input 
                {...register("role", { required: "Please select a role to continue" })} 
                type="radio" 
                value={role.value} 
                className="sr-only" 
              />
              
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSelected 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25" 
                  : "bg-slate-100 text-slate-500 group-hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:text-white"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-bold ${isSelected ? "text-slate-950 dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>
                    {role.title}
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {role.text}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {errors.role && (
        <p className="text-xs font-semibold text-rose-500">{errors.role.message}</p>
      )}

      <button
        type="submit"
        disabled={loading || !selectedRole}
        className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Configuring Workspace...</span>
          </div>
        ) : (
          <>
            <span>Launch E-Waste Workspace</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
};

export default OnboardingForm;

