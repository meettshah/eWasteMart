"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  BadgeCheck, 
  Building2, 
  Factory, 
  Mail, 
  Recycle, 
  ShieldCheck, 
  UserRound, 
  ArrowRight, 
  Settings, 
  Package, 
  Truck, 
  ExternalLink 
} from "lucide-react";
import { motion } from "framer-motion";

const roleMeta = {
  user: {
    label: "Individual Seller",
    icon: UserRound,
    color: "emerald",
    capability: "Create e-waste listings with AI valuation, upload device photos, and accept recycler bids.",
    statusBadge: "Verified Seller",
  },
  bulk_seller: {
    label: "Bulk IT Seller",
    icon: Building2,
    color: "sky",
    capability: "Publish bulk e-waste inventory for enterprises, offices, schools, and institutional facilities.",
    statusBadge: "Bulk Commercial Verified",
  },
  recycler: {
    label: "Authorized Recycler",
    icon: Factory,
    color: "emerald",
    capability: "Bid on open e-waste lots, coordinate logistics, and submit certified recycling manifests.",
    statusBadge: "CPCB 2022 Certified",
  },
  enterprise: {
    label: "Enterprise Brand",
    icon: BadgeCheck,
    color: "purple",
    capability: "Execute Extended Producer Responsibility (EPR) mandates, audit trails, and bulk takeback.",
    statusBadge: "Enterprise EPR Partner",
  },
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const meta = roleMeta[user?.role] || roleMeta.user;

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-8 text-slate-900 dark:bg-[#090D14] dark:text-white md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Profile Hero Card */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card relative overflow-hidden rounded-3xl p-8 md:p-10"
        >
          {/* Subtle decorative glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/10" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
                <meta.icon className="h-10 w-10" />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md dark:bg-slate-900 dark:text-emerald-400">
                  <BadgeCheck className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {meta.statusBadge}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    ID: {user?.id ? user.id.slice(0, 8) : "EW-PRO"}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">
                  {user?.name || "Active Member"}
                </h1>
                
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="h-4 w-4 text-slate-400" /> {user?.email || "user@ewastemart.org"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href="/settings" 
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Settings className="h-4 w-4" /> Edit Profile
              </Link>
              <Link 
                href="/marketplace" 
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 hover:shadow-lg"
              >
                Marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* 3 Overview Cards */}
        <section className="grid gap-5 md:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-bold text-slate-950 dark:text-white">Account Tier & Role</h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Assigned privilege level: <strong className="text-slate-900 dark:text-white">{meta.label}</strong>. Full bidding, dispatch, and compliance permissions active.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400">
              <Recycle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-bold text-slate-950 dark:text-white">Primary Capability</h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {meta.capability}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-bold text-slate-950 dark:text-white">CPCB Compliance</h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Compliant with Ministry of Environment, Forest & Climate Change (MoEFCC) E-Waste Management Rules 2022.
            </p>
          </motion.div>
        </section>

        {/* Quick Launchpad */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Workspace Operations</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Jump directly to active trading lots, courier tracking, and settlement records.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-700"
              >
                <Package className="h-4 w-4 text-emerald-500" />
                Live Lots
              </Link>
              <Link
                href="/pickups"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-700"
              >
                <Truck className="h-4 w-4 text-sky-500" />
                Dispatches
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

