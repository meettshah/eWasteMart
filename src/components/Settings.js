"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import { 
  Bell, 
  Building, 
  CreditCard, 
  LockKeyhole, 
  Mail, 
  Phone, 
  MapPin, 
  Settings as SettingsIcon, 
  User, 
  Save, 
  LogOut,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { id: "account", label: "Account Profile", icon: User, desc: "Personal info & contact details" },
  { id: "security", label: "Security & Access", icon: LockKeyhole, desc: "Password & authentication" },
  { id: "organization", label: "Organization", icon: Building, desc: "Company & GST compliance", roles: ["bulk_seller", "recycler", "enterprise"] },
  { id: "payment", label: "Payment Routing", icon: CreditCard, desc: "Instant UPI & bank accounts" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Email & real-time alerts" },
];

export default function SettingsPane() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const userRole = session?.user?.role || "user";
  const visibleTabs = tabs.filter(t => !t.roles || t.roles.includes(userRole));
  const active = visibleTabs.find((tab) => tab.id === activeTab) || visibleTabs[0];

  // Forms
  const { register: regAccount, handleSubmit: handleAccount, reset: resetAccount } = useForm();
  const { register: regSecurity, handleSubmit: handleSecurity, reset: resetSecurity } = useForm();
  const { register: regOrg, handleSubmit: handleOrg, reset: resetOrg } = useForm();
  const { register: regPayment, handleSubmit: handlePayment, reset: resetPayment } = useForm();
  const { register: regNotif, handleSubmit: handleNotif, reset: resetNotif } = useForm();

  useEffect(() => {
    fetchSettings();
  }, [session]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        resetAccount({ name: data.name, phone: data.phone, address: data.address });
        resetOrg({ companyName: data.companyName, registrationNumber: data.registrationNumber });
        resetPayment({ upiId: data.paymentDetails?.upiId, bankAccount: data.paymentDetails?.bankAccount });
        resetNotif({ email: data.preferences?.email ?? true, inApp: data.preferences?.inApp ?? true });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdateSettings = async (data) => {
    setIsSaving(true);
    try {
      let payload = data;
      if (activeTab === "payment") payload = { paymentDetails: data };
      if (activeTab === "notifications") payload = { preferences: data };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success(`${active.label} updated successfully!`);
    } catch (error) {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const onUpdatePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message);
      
      toast.success("Password changed successfully!");
      resetSecurity();
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-8 text-slate-900 dark:bg-[#090D14] dark:text-white md:px-8 md:py-12">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Strip */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-card backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 shadow-sm">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings & Preferences</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Secure
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your credentials, business verification, and communication rules.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => signOut()} 
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-red-900/40 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[310px_1fr]">
          
          {/* Fluent Left Nav */}
          <nav className="flex flex-col gap-2">
            {visibleTabs.map((tab) => {
              const isCurrent = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex w-full items-center gap-3.5 rounded-2xl p-4 text-left transition-all duration-200 ${
                    isCurrent
                      ? "bg-white shadow-card ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-800"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-white"
                  }`}
                >
                  {isCurrent && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-y-2 left-0 w-1.5 rounded-r-full bg-emerald-500"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isCurrent 
                      ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" 
                      : "bg-slate-100 text-slate-500 group-hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:text-white"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold ${isCurrent ? "text-slate-950 dark:text-white" : ""}`}>
                      {tab.label}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Tab Pane */}
          <section className="glass-card min-h-[520px] rounded-3xl p-6 md:p-8">
            <div className="mb-8 border-b border-slate-100 pb-5 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <active.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {active?.label}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{active?.desc}</p>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* ACCOUNT TAB */}
                {activeTab === "account" && (
                  <form onSubmit={handleAccount(onUpdateSettings)} className="max-w-2xl space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email (Read Only)</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input 
                            value={session?.user?.email || ""} 
                            readOnly 
                            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 cursor-not-allowed" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Account Role</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input 
                            value={(session?.user?.role || "user").toUpperCase().replace('_', ' ')} 
                            readOnly 
                            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 py-3 pl-10 pr-4 text-sm font-semibold text-emerald-600 outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-emerald-400 cursor-not-allowed" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Display Name</label>
                        <input 
                          {...regAccount("name")} 
                          placeholder="Your full name"
                          className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 px-4 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:focus:border-emerald-400" 
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input 
                            {...regAccount("phone")} 
                            placeholder="+91 98765 43210" 
                            className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:focus:border-emerald-400" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Primary Pickup Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <textarea 
                            {...regAccount("address")} 
                            rows="3" 
                            placeholder="Plot 42, Electronics City Phase 1, Bengaluru, Karnataka 560100" 
                            className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:focus:border-emerald-400" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      disabled={isSaving} 
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 hover:shadow-lg disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Account Details"}
                    </button>
                  </form>
                )}

                {/* ORGANIZATION TAB */}
                {activeTab === "organization" && (
                  <form onSubmit={handleOrg(onUpdateSettings)} className="max-w-2xl space-y-6">
                    <div className="flex items-start gap-3 rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
                      <Building className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
                      <p className="text-xs leading-relaxed">
                        As a registered <strong>{userRole.replace('_', ' ')}</strong>, CPCB 2022 guidelines require verified business credentials for certified e-waste transfer manifests.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Registered Business Name</label>
                      <input 
                        {...regOrg("companyName")} 
                        placeholder="e.g. EcoGreen Solutions Private Limited" 
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 px-4 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:focus:border-emerald-400" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">GST / CPCB Registration Code</label>
                      <input 
                        {...regOrg("registrationNumber")} 
                        placeholder="29AAAAA0000A1Z5" 
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 px-4 text-sm font-medium font-mono outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:focus:border-emerald-400" 
                      />
                    </div>
                    
                    <button 
                      disabled={isSaving} 
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 hover:shadow-lg disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Business Profile"}
                    </button>
                  </form>
                )}

                {/* PAYMENT TAB */}
                {activeTab === "payment" && (
                  <form onSubmit={handlePayment(onUpdateSettings)} className="max-w-2xl space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Default UPI Virtual Payment Address (VPA)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input 
                          {...regPayment("upiId")} 
                          placeholder="recipient@okhdfcbank" 
                          className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:focus:border-emerald-400" 
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Escrow payouts from accepted bids will be disbursed directly to this handle.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Bank Account Number (Optional)</label>
                      <input 
                        {...regPayment("bankAccount")} 
                        placeholder="50100456789012" 
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 px-4 text-sm font-medium font-mono outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:focus:border-emerald-400" 
                      />
                    </div>
                    
                    <button 
                      disabled={isSaving} 
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 hover:shadow-lg disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Payment Details"}
                    </button>
                  </form>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === "notifications" && (
                  <form onSubmit={handleNotif(onUpdateSettings)} className="max-w-2xl space-y-6">
                    <div className="space-y-3">
                      <label className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm transition hover:border-emerald-300 dark:border-slate-800/80 dark:bg-slate-950/60 dark:hover:border-slate-700 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-950 dark:text-white">Email Transaction Alerts</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Receive instant updates when a bid is received or approved.</div>
                          </div>
                        </div>
                        <input type="checkbox" {...regNotif("email")} className="h-5 w-5 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      </label>
                      
                      <label className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm transition hover:border-emerald-300 dark:border-slate-800/80 dark:bg-slate-950/60 dark:hover:border-slate-700 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-950 dark:text-white">In-App Live Notifications</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Show push banners and status indicator updates in dashboard.</div>
                          </div>
                        </div>
                        <input type="checkbox" {...regNotif("inApp")} className="h-5 w-5 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      </label>
                    </div>
                    
                    <button 
                      disabled={isSaving} 
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 hover:shadow-lg disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Preferences"}
                    </button>
                  </form>
                )}

                {/* SECURITY TAB */}
                {activeTab === "security" && (
                  <div className="max-w-2xl space-y-6">
                    <form onSubmit={handleSecurity(onUpdatePassword)} className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/80 dark:bg-slate-950/60 shadow-sm">
                      <h3 className="text-base font-bold text-slate-950 dark:text-white">Change Password</h3>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Current Password</label>
                        <input 
                          type="password" 
                          {...regSecurity("currentPassword", {required: true})} 
                          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-900" 
                        />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">New Password</label>
                          <input 
                            type="password" 
                            {...regSecurity("newPassword", {required: true, minLength: 6})} 
                            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-900" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Confirm Password</label>
                          <input 
                            type="password" 
                            {...regSecurity("confirmPassword", {required: true})} 
                            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-900" 
                          />
                        </div>
                      </div>
                      
                      <button 
                        disabled={isSaving} 
                        className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        <LockKeyhole className="h-4 w-4" /> {isSaving ? "Updating..." : "Update Password"}
                      </button>
                    </form>

                    <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-6 dark:border-red-900/40 dark:bg-red-950/20">
                      <h3 className="flex items-center gap-2 text-base font-bold text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" /> Danger Zone
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Permanently delete your account and all associated transaction manifests. This action is irreversible.
                      </p>
                      <button className="mt-4 rounded-xl border border-red-200 bg-red-100/70 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50">
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}

