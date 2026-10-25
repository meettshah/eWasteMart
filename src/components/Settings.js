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
  AlertTriangle
} from "lucide-react";
import { signOut } from "next-auth/react";

const tabs = [
  { id: "account", label: "Account", icon: User, desc: "Personal info & contact details" },
  { id: "security", label: "Security", icon: LockKeyhole, desc: "Password & authentication" },
  { id: "organization", label: "Organization", icon: Building, desc: "Company & GST details", roles: ["bulk_seller", "recycler", "enterprise"] },
  { id: "payment", label: "Payment Details", icon: CreditCard, desc: "UPI & Bank accounts" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Email & in-app alerts" },
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
      // Format nested data if it's payment or notifications
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

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading settings...</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 px-4 py-8 text-gray-950 dark:bg-gray-950 dark:text-white md:px-6 md:py-12">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <SettingsIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account preferences and secure your profile.</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-red-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-400">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
          <nav className="flex flex-col gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all ${
                  activeTab === tab.id 
                    ? "bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800" 
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-white"
                }`}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-primary" : "text-gray-400"}`} />
                <div>
                  <div className={`font-medium ${activeTab === tab.id ? "text-gray-900 dark:text-white" : ""}`}>{tab.label}</div>
                  <div className="mt-0.5 text-xs text-gray-400">{tab.desc}</div>
                </div>
              </button>
            ))}
          </nav>

          <section className="min-h-[500px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="mb-8 border-b border-gray-100 pb-6 dark:border-gray-800">
              <h2 className="flex items-center gap-3 text-2xl font-bold">
                {active && <active.icon className="h-6 w-6 text-primary" />}
                {active?.label}
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{active?.desc}</p>
            </div>

            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <form onSubmit={handleAccount(onUpdateSettings)} className="space-y-6 max-w-2xl">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Read Only)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input value={session?.user?.email || ""} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-gray-500 outline-none dark:border-gray-800 dark:bg-gray-950" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role (Read Only)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input value={(session?.user?.role || "user").toUpperCase()} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-gray-500 outline-none dark:border-gray-800 dark:bg-gray-950" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input {...regAccount("name")} className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input {...regAccount("phone")} placeholder="+91 9876543210" className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-10 pr-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Primary Pickup Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea {...regAccount("address")} rows="3" placeholder="123 Green Street, Tech Hub..." className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-10 pr-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                    </div>
                  </div>
                </div>
                <button disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> Save Account Details
                </button>
              </form>
            )}

            {/* ORGANIZATION TAB */}
            {activeTab === "organization" && (
              <form onSubmit={handleOrg(onUpdateSettings)} className="space-y-6 max-w-2xl">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-800 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300 mb-6 flex gap-3">
                  <Building className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">Because you are a <strong>{userRole.replace('_', ' ')}</strong>, you must provide valid business registration details for compliance and invoicing purposes.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <input {...regOrg("companyName")} placeholder="Acme Recycling Ltd." className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GST / Registration Number</label>
                  <input {...regOrg("registrationNumber")} placeholder="22AAAAA0000A1Z5" className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                </div>
                <button disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50 mt-6">
                  <Save className="h-4 w-4" /> Save Organization Details
                </button>
              </form>
            )}

            {/* PAYMENT TAB */}
            {activeTab === "payment" && (
              <form onSubmit={handlePayment(onUpdateSettings)} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default UPI ID</label>
                  <input {...regPayment("upiId")} placeholder="username@upi" className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                  <p className="text-xs text-gray-500">Payouts from successful e-waste sales will automatically be routed here.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank Account Number (Optional)</label>
                  <input {...regPayment("bankAccount")} placeholder="0000123456789" className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                </div>
                <button disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50 mt-6">
                  <Save className="h-4 w-4" /> Save Payment Preferences
                </button>
              </form>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <form onSubmit={handleNotif(onUpdateSettings)} className="space-y-6 max-w-2xl">
                <div className="space-y-4">
                  <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-500">Receive updates about bids and payments via email.</div>
                      </div>
                    </div>
                    <input type="checkbox" {...regNotif("email")} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                  </label>
                  
                  <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">In-App Notifications</div>
                        <div className="text-sm text-gray-500">Show alerts in the dashboard notification bell.</div>
                      </div>
                    </div>
                    <input type="checkbox" {...regNotif("inApp")} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                  </label>
                </div>
                <button disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50 mt-6">
                  <Save className="h-4 w-4" /> Save Notification Settings
                </button>
              </form>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-8 max-w-2xl">
                <form onSubmit={handleSecurity(onUpdatePassword)} className="space-y-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <input type="password" {...regSecurity("currentPassword", {required: true})} className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <input type="password" {...regSecurity("newPassword", {required: true, minLength: 6})} className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <input type="password" {...regSecurity("confirmPassword", {required: true})} className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-4 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700" />
                    </div>
                  </div>
                  <button disabled={isSaving} className="mt-4 flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                    <LockKeyhole className="h-4 w-4" /> Update Password
                  </button>
                </form>

                <div className="rounded-xl border border-red-200 p-6 dark:border-red-900/50">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Danger Zone
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button className="mt-4 rounded-lg bg-red-100 px-4 py-2 font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
