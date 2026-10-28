"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Building2, 
  Factory, 
  Recycle, 
  Scale, 
  UserRound, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Wallet,
  Clock,
  Layers,
  Award,
  Zap,
  Leaf
} from "lucide-react";

const roleGuidance = {
  user: {
    title: "Household & Personal Gadgets",
    body: "Create listings for used phones, laptops, chargers, and appliances with automatic AI scrap pricing and secure doorstep OTP pickups.",
    action: "Create a Listing",
    href: "/marketplace",
    badge: "Verified Individual Seller",
  },
  bulk_seller: {
    title: "Bulk IT & Decommissioning Desk",
    body: "Liquidate office, school, or warehouse e-waste lots in pallets. Invite certified recyclers to submit competitive sealed bids.",
    action: "List Pallet Lot",
    href: "/marketplace",
    badge: "Enterprise Bulk Disposer",
  },
  recycler: {
    title: "Circular Sourcing Desk",
    body: "Browse vetted e-waste streams, inspect automated MobileNet condition scans, place Mamdani-rated fair bids, and win direct pickups.",
    action: "Browse Open Bids",
    href: "/marketplace",
    badge: "CPCB Certified Recycler",
  },
  enterprise: {
    title: "EPR Brand Take-Back Console",
    body: "Run extended producer responsibility collections, audit vendor compliance, and download cryptographic ESG sustainability reports.",
    action: "Launch EPR Programme",
    href: "/marketplace",
    badge: "Corporate ESG Partner",
  },
};

const quickActions = [
  { 
    title: "Bidding Desk", 
    text: "Create listings, review Mamdani fuzzy offers, and approve certified buyers.", 
    href: "/marketplace", 
    icon: Scale,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  },
  { 
    title: "Doorstep Pickups", 
    text: "Track dispatch logistics, manage courier manifests, and verify 6-digit OTPs.", 
    href: "/pickups", 
    icon: Truck,
    color: "from-blue-500/10 to-sky-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  },
  { 
    title: "Payments & Escrow", 
    text: "Review instant bank payouts, token rewards, and transaction receipts.", 
    href: "/payments", 
    icon: Wallet,
    color: "from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
  },
  { 
    title: "Recycler Directory", 
    text: "Review licensed R2/CPCB recyclers, distance radii, and processing policies.", 
    href: "/recyclers", 
    icon: Factory,
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "user";
  const guidance = roleGuidance[role] || roleGuidance.user;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ─── Executive Welcome Banner ──────────────────────────── */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {guidance.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • Active Session
                </span>
              </div>

              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {greeting}, <span className="text-gradient">{session?.user?.name || "Member"}</span>.
              </h1>
              
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                Welcome to your circular e-waste workspace. Manage your listings, inspect bids, monitor carbon savings, and schedule compliant disposals.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link 
                  href={guidance.href} 
                  className="btn-gradient text-sm"
                >
                  {guidance.action} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="/profile" 
                  className="btn-secondary text-sm"
                >
                  View Profile & Documents
                </Link>
              </div>
            </div>

            {/* Role Context Tile */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-800/50">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {role === "recycler" ? <Recycle className="h-5 w-5" /> : role === "enterprise" ? <Building2 className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{guidance.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {guidance.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── Metric & Environmental Impact Strip ────────────────── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "E-Waste Diverted",
              value: "1,450",
              unit: "kg",
              change: "+18% this month",
              icon: Recycle,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              title: "CO₂ Mitigated",
              value: "2,100",
              unit: "kg CO₂e",
              change: "≈ 105 trees saved",
              icon: Leaf,
              color: "text-teal-600 dark:text-teal-400",
              bg: "bg-teal-500/10",
            },
            {
              title: "Precious Metals Saved",
              value: "320",
              unit: "kg",
              change: "Gold, Copper & Silicon",
              icon: Award,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              title: "Green ESG Credits",
              value: "100,000",
              unit: "tokens",
              change: "Redeemable in escrow",
              icon: Zap,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-500/10",
            },
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="metric-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {m.title}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg} ${m.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {m.value}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {m.unit}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{m.change}</span>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ─── Fast Launcher Cards ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                Workspace Modules
              </h2>
              <p className="text-xs text-slate-500">
                Direct shortcuts to active trading, logistics, and verification tools
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="group">
                  <div className="flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
                    <div>
                      <div className={`inline-flex rounded-xl border p-3 ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {action.text}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Open Module</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
