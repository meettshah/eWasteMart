"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Dashboard</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-950 dark:text-white">
                Welcome back, {session?.user?.name || "E-WasteMart member"}.
              </h1>
              <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
                Your role controls what you can do across the platform. Use this dashboard to jump into the right workflow.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-white">
                  {guidance.action} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/profile" className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                  View profile
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {role === "recycler" ? <Recycle /> : role === "enterprise" ? <Building2 /> : <UserRound />}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-950 dark:text-white">{guidance.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{guidance.body}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="rounded-lg bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900">
              <action.icon className="h-7 w-7 text-primary" />
              <h2 className="mt-5 text-xl font-semibold text-gray-950 dark:text-white">{action.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{action.text}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex items-start gap-4">
            <ListPlus className="mt-1 h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-950 dark:text-white">Platform structure</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Sellers create listings, recyclers and enterprises submit bids, and the listing owner approves one buyer. Everything important happens in the marketplace.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
