"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, CheckCircle2, HelpCircle, LockKeyhole, Mail, Recycle, Settings, Shield, User } from "lucide-react";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: LockKeyhole },
  { id: "workflow", label: "Role workflow", icon: Recycle },
  { id: "support", label: "Support", icon: HelpCircle },
];

const roleText = {
  user: "You can create individual listings and approve bids from recyclers or enterprises.",
  bulk_seller: "You can create bulk listings for larger organizations and approve the best buyer bid.",
  recycler: "You can browse open listings and place bids with pickup or recycling notes.",
  enterprise: "You can create programme listings and bid on lots that fit your recovery process.",
};

export default function SettingsPane() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("account");
  const user = session?.user;

  const active = tabs.find((tab) => tab.id === activeTab);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Review your account, role and platform preferences.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <nav className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium ${
                  activeTab === tab.id ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              {active && <active.icon className="h-6 w-6 text-primary" />}
              {active?.label}
            </h2>

            {activeTab === "account" && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input value={user?.name || ""} readOnly className="w-full bg-gray-50 dark:bg-gray-950" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input value={user?.email || ""} readOnly className="w-full bg-gray-50 dark:bg-gray-950" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Role</label>
                  <input value={user?.role || ""} readOnly className="w-full bg-gray-50 dark:bg-gray-950" />
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-md border border-gray-200 p-4 dark:border-gray-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Marketplace activity</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Notify me when bids are placed, approved or rejected.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border border-gray-200 p-4 dark:border-gray-800">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email updates</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Email delivery is ready to connect when a transactional email provider is added.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="mt-6 rounded-md border border-gray-200 p-4 dark:border-gray-800">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">Password authentication</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Accounts use hashed passwords through NextAuth credentials. Add password reset and 2FA before onboarding real production users.
                </p>
              </div>
            )}

            {activeTab === "workflow" && (
              <div className="mt-6 rounded-md bg-gray-50 p-5 dark:bg-gray-950">
                <h3 className="font-semibold">Current role capabilities</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{roleText[user?.role] || roleText.user}</p>
              </div>
            )}

            {activeTab === "support" && (
              <div className="mt-6 space-y-3 text-gray-600 dark:text-gray-300">
                <p>For prototype support, contact support@ewastemart.com.</p>
                <p>Common next production steps: email notifications, payment settlement, audit logs and admin verification.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
