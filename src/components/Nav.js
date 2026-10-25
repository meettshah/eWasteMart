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

const roleLabels = {
  user: "Individual seller",
  bulk_seller: "Bulk seller",
  recycler: "Recycler",
  enterprise: "Enterprise",
};

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="glass-nav flex h-16 w-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-3">
            <Image src="/logo.png" width={36} height={36} className="h-9 w-9" alt="E-WasteMart logo" />
            <span className="text-gradient font-bold">E-WasteMart</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-5 justify-center flex-1 ml-10">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href ? "text-primary" : "text-gray-700 hover:text-primary dark:text-gray-200"
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 justify-end">
          <ThemeSwitch />
          <NotificationBell />
          
          <div className="relative">
            <button 
              className="flex items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setIsMenuOpen((prev) => (prev === 'profile' ? false : 'profile'))}
            >
              <Avatar size="sm" src="/profile1.png" name={user?.name || "User"} />
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold text-gray-950 dark:text-white">{user?.name || "Account"}</span>
                <span className="block text-xs text-gray-500">{roleLabels[user?.role] || "Member"}</span>
              </span>
            </button>
            
            <AnimatePresence>
              {isMenuOpen === 'profile' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl glass-card py-1 z-50"
                >
                  <Link href="/profile" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary dark:text-gray-200 dark:hover:bg-primary/20" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary dark:text-gray-200 dark:hover:bg-primary/20" onClick={() => setIsMenuOpen(false)}>Settings</Link>
                  <div className="my-1 h-px w-full bg-gray-200/50 dark:bg-gray-800/50" />
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10" 
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200"
            onClick={() => setIsMenuOpen((prev) => (prev === 'mobile' ? false : 'mobile'))}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen === 'mobile' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 z-40 glass-nav border-t-0 p-6 shadow-lg lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {siteConfig.navMenuItems.map((item) => (
                <Link
                  key={item.href}
                  className={pathname === item.href ? "font-semibold text-primary" : "text-gray-800 font-medium hover:text-primary dark:text-gray-100"}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
