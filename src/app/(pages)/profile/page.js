"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BadgeCheck, Building2, Factory, Mail, Recycle, ShieldCheck, UserRound } from "lucide-react";

const roleMeta = {
  user: {
    label: "Individual seller",
    icon: UserRound,
    capability: "Create individual e-waste listings and approve buyer bids.",
  },
  bulk_seller: {
    label: "Bulk seller",
    icon: Building2,
    capability: "Publish bulk e-waste lots for organizations, schools and industries.",
  },
  recycler: {
    label: "Recycler",
    icon: Factory,
    capability: "Bid on open e-waste lots and coordinate pickup or processing notes.",
  },
  enterprise: {
    label: "Enterprise",
    icon: BadgeCheck,
    capability: "Run brand recycling programmes, list lots and bid on recoverable material.",
  },
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const meta = roleMeta[user?.role] || roleMeta.user;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <meta.icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Profile</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{user?.name}</h1>
                <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4" /> {user?.email}
                </p>
              </div>
            </div>
            <Link href="/settingtab" className="rounded-md border border-gray-300 px-5 py-3 text-center font-semibold dark:border-gray-700">
              Account settings
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h2 className="mt-4 font-semibold text-gray-950 dark:text-white">Role</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{meta.label}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <Recycle className="h-7 w-7 text-primary" />
            <h2 className="mt-4 font-semibold text-gray-950 dark:text-white">Primary workflow</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{meta.capability}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <BadgeCheck className="h-7 w-7 text-primary" />
            <h2 className="mt-4 font-semibold text-gray-950 dark:text-white">Account status</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Active and ready for marketplace actions.</p>
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-950 dark:text-white">Next best action</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Open the marketplace to {user?.role === "recycler" ? "place bids on available e-waste lots" : "create a listing or manage bids on your lots"}.
          </p>
          <Link href="/marketplace" className="mt-5 inline-flex rounded-md bg-primary px-5 py-3 font-semibold text-white">
            Go to marketplace
          </Link>
        </section>
      </div>
    </main>
  );
}
