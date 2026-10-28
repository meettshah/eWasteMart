"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "./theme-switch";
import NotificationBell from "./NotificationBell";
import { 
  LayoutDashboard, 
  Store, 
  Truck, 
  Wallet, 
  Factory, 
  Building2, 
  Info, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  ShieldCheck
} from "lucide-react";

const roleConfig = {
  user: { label: "Individual Seller", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  bulk_seller: { label: "Bulk Seller", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  recycler: { label: "Certified Recycler", color: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20" },
  enterprise: { label: "Enterprise Partner", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  pending: { label: "Verification Pending", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
};

const navIcons = {
  "/home": LayoutDashboard,
  "/marketplace": Store,
  "/pickups": Truck,
  "/payments": Wallet,
  "/recyclers": Factory,
  "/collaborators": Building2,
  "/about-us": Info,
};

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleMeta = roleConfig[user?.role] || roleConfig.user;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#090D14]/85 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          
          {/* Brand */}
          <Link href="/home" className="flex items-center gap-2.5 transition-transform active:scale-95">
            <Image src="/logo.png" width={36} height={36} alt="eWasteMart Logo" className="h-9 w-9 object-contain" priority />
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                eWaste<span className="text-emerald-600 dark:text-emerald-400">Mart</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">
                Workspace
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Fluent Pill Segment) */}
          <div className="hidden xl:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/70 p-1 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
            {siteConfig.navItems.map((item) => {
              const Icon = navIcons[item.href] || Store;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-70"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <NotificationBell />

            {/* User Profile Pill Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/70 p-1.5 pr-3 text-left transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
              >
                <Avatar
                  size="sm"
                  src="/profile1.png"
                  name={user?.name || "User"}
                  className="h-8 w-8 ring-1 ring-emerald-500/30"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user?.name || "Account"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    {roleMeta.label}
                  </span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#0f172a]/95 z-50"
                  >
                    <div className="border-b border-slate-100 dark:border-slate-800/80 px-3 py-2.5 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.name || "My Account"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${roleMeta.color}`}>
                        <ShieldCheck className="h-3 w-3" />
                        {roleMeta.label}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Profile & Verification
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Account Settings
                      </Link>
                    </div>

                    <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 xl:hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#090D14]/95 xl:hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                {siteConfig.navMenuItems.map((item) => {
                  const Icon = navIcons[item.href] || Store;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4 opacity-75" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
