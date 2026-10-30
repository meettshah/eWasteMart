"use client";

import React, { useState, useEffect } from "react";
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
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  ShieldCheck,
  Sparkles,
  Dna,
  Eye
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
  "/gen-ai": Sparkles,
  "/soft-computing": Dna,
  "/computer-vision": Eye,
};

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Independent Page Visibility Toggles
  const [navConfig, setNavConfig] = useState({
    genAi: true,
    softComputing: true,
    computerVision: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadConfig = () => ({
        genAi: localStorage.getItem("ewastemart_nav_gen_ai") !== "false",
        softComputing: localStorage.getItem("ewastemart_nav_soft_computing") !== "false",
        computerVision: localStorage.getItem("ewastemart_nav_computer_vision") !== "false",
      });
      setNavConfig(loadConfig());

      const handleNavChange = (e) => {
        if (e.detail) setNavConfig(e.detail);
      };

      const handleStorage = (e) => {
        if (e.key?.startsWith("ewastemart_nav_")) {
          setNavConfig(loadConfig());
        }
      };

      window.addEventListener("academic_nav_change", handleNavChange);
      window.addEventListener("storage", handleStorage);
      return () => {
        window.removeEventListener("academic_nav_change", handleNavChange);
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, []);

  const roleMeta = roleConfig[user?.role] || roleConfig.user;
  const hasAnyAcademic = navConfig.genAi || navConfig.softComputing || navConfig.computerVision;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#090D14]/85 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
          
          {/* Brand */}
          <Link href="/home" className="flex items-center gap-2.5 transition-transform active:scale-95">
            <Image src="/logo.png" width={36} height={36} alt="eWasteMart Logo" className="h-9 w-9 object-contain" priority />
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                eWaste<span className="text-emerald-600 dark:text-emerald-400">Mart</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">
                Recycle, Reuse & Repeat
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

            {/* Individual Academic Subject Navigation (Controlled Separately via Settings) */}
            {hasAnyAcademic && (
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
            )}

            {navConfig.genAi && (
              <Link
                href="/gen-ai"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                  pathname === "/gen-ai"
                    ? "bg-violet-600 text-white shadow-sm dark:bg-violet-600 dark:text-white"
                    : "text-violet-700 hover:bg-violet-100/70 dark:text-violet-300 dark:hover:bg-violet-950/60"
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${pathname === "/gen-ai" ? "text-white" : "opacity-80"}`} />
                Gen AI
              </Link>
            )}

            {navConfig.softComputing && (
              <Link
                href="/soft-computing"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                  pathname === "/soft-computing"
                    ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-600 dark:text-white"
                    : "text-indigo-700 hover:bg-indigo-100/70 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                }`}
              >
                <Dna className={`h-3.5 w-3.5 ${pathname === "/soft-computing" ? "text-white" : "opacity-80"}`} />
                Soft Computing
              </Link>
            )}

            {navConfig.computerVision && (
              <Link
                href="/computer-vision"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                  pathname === "/computer-vision"
                    ? "bg-teal-600 text-white shadow-sm dark:bg-teal-600 dark:text-white"
                    : "text-teal-700 hover:bg-teal-100/70 dark:text-teal-300 dark:hover:bg-teal-950/60"
                }`}
              >
                <Eye className={`h-3.5 w-3.5 ${pathname === "/computer-vision" ? "text-white" : "opacity-80"}`} />
                Computer Vision
              </Link>
            )}
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
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 z-50"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {user?.name || "User Account"}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="h-3 w-3" />
                        {roleMeta.label}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Settings & Preferences
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
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
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
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

              {/* Mobile Academic Labs if any is toggled on */}
              {hasAnyAcademic && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Academic AI Labs
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {navConfig.genAi && (
                      <Link
                        href="/gen-ai"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-center text-[11px] font-bold border transition ${
                          pathname === "/gen-ai"
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40"
                        }`}
                      >
                        <Sparkles className="h-4 w-4 mb-1" />
                        <span>Gen AI</span>
                      </Link>
                    )}

                    {navConfig.softComputing && (
                      <Link
                        href="/soft-computing"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-center text-[11px] font-bold border transition ${
                          pathname === "/soft-computing"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40"
                        }`}
                      >
                        <Dna className="h-4 w-4 mb-1" />
                        <span>Soft Comp</span>
                      </Link>
                    )}

                    {navConfig.computerVision && (
                      <Link
                        href="/computer-vision"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-center text-[11px] font-bold border transition ${
                          pathname === "/computer-vision"
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40"
                        }`}
                      >
                        <Eye className="h-4 w-4 mb-1" />
                        <span>CV Lab</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
