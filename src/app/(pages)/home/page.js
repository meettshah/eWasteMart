"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Factory, ListPlus, Recycle, Scale, UserRound } from "lucide-react";

const roleGuidance = {
  user: {
    title: "Sell individual e-waste",
    body: "Create listings for phones, laptops, chargers and other household electronics.",
    action: "Create a listing",
  },
  bulk_seller: {
    title: "Move bulk lots faster",
    body: "Publish larger office, school, warehouse or industrial e-waste lots for competitive bids.",
    action: "List a bulk lot",
  },
  recycler: {
    title: "Find lots ready for recycling",
    body: "Browse open listings, place bids and win approved lots from sellers.",
    action: "Browse listings",
  },
  enterprise: {
    title: "Run a recycling programme",
    body: "List programme collections or bid on lots aligned with your brand recovery process.",
    action: "Open marketplace",
  },
};

const quickActions = [
  { title: "Marketplace", text: "Create listings, place bids and approve buyers.", href: "/marketplace", icon: Scale },
  { title: "Certified recyclers", text: "Review recycler capabilities and processing policies.", href: "/recyclers", icon: Factory },
  { title: "Enterprise partners", text: "Explore brand-led take-back and recycling programmes.", href: "/collaborators", icon: Building2 },
];

export default function HomePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "user";
  const guidance = roleGuidance[role] || roleGuidance.user;

  // Mock data for Environmental Impact (would normally fetch from DB)
  const impactData = {
    divertedKg: 1450,
    co2SavedKg: 2100,
    metalsRecoveredKg: 320,
    badges: ["🌱 Eco-Starter", "🥉 Bronze Recycler"],
  };

  return (
    <main className="min-h-screen bg-gray-50/50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Dashboard</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-950 dark:text-white">
                Welcome back, <span className="text-gradient">{session?.user?.name || "Member"}</span>.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Your role controls what you can do across the platform. Use this dashboard to jump into the right workflow.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40">
                  {guidance.action} <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/profile" className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white/50 px-6 py-3.5 font-semibold text-gray-900 transition-all hover:bg-white dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:hover:bg-gray-800">
                  View profile
                </Link>
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/80"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {role === "recycler" ? <Recycle className="h-7 w-7" /> : role === "enterprise" ? <Building2 className="h-7 w-7" /> : <UserRound className="h-7 w-7" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-950 dark:text-white">{guidance.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{guidance.body}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Environmental Impact Dashboard */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-950 dark:text-white">Your Environmental Impact</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <motion.div whileHover={{ y: -4 }} className="glass-card rounded-2xl p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Recycle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-3xl font-black text-gray-950 dark:text-white">{impactData.divertedKg} <span className="text-lg font-medium text-gray-500">kg</span></h3>
              <p className="mt-1 font-medium text-gray-600 dark:text-gray-400">E-Waste Diverted</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="glass-card rounded-2xl p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-3xl font-black text-gray-950 dark:text-white">{impactData.co2SavedKg} <span className="text-lg font-medium text-gray-500">kg</span></h3>
              <p className="mt-1 font-medium text-gray-600 dark:text-gray-400">CO₂ Emissions Saved</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="glass-card rounded-2xl p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Factory className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-3xl font-black text-gray-950 dark:text-white">{impactData.metalsRecoveredKg} <span className="text-lg font-medium text-gray-500">kg</span></h3>
              <p className="mt-1 font-medium text-gray-600 dark:text-gray-400">Toxic Metals Recovered</p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-5 md:grid-cols-3"
        >
          {quickActions.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-card h-full rounded-2xl p-6 transition-shadow hover:shadow-xl dark:hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <action.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-gray-950 dark:text-white">{action.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{action.text}</p>
              </motion.div>
            </Link>
          ))}
        </motion.section>
      </div>
    </main>
  );
}
