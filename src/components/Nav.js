"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "./theme-switch";

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
      <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200/70 bg-white/70 px-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/70">
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-3">
            <Image src="/logo.png" width={36} height={36} className="h-9 w-9" alt="E-WasteMart logo" />
            <span className="font-bold text-gray-950 dark:text-white">E-WasteMart</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-5 justify-center flex-1 ml-10">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              className={`text-sm font-medium ${
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
          
          <div className="relative">
            <button 
              className="flex items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-900"
              onClick={() => setIsMenuOpen((prev) => (prev === 'profile' ? false : 'profile'))}
            >
              <Avatar size="sm" src="/profile1.png" name={user?.name || "User"} />
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold text-gray-950 dark:text-white">{user?.name || "Account"}</span>
                <span className="block text-xs text-gray-500">{roleLabels[user?.role] || "Member"}</span>
              </span>
            </button>
            
            {isMenuOpen === 'profile' && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-950">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <Link href="/settingtab" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900" onClick={() => setIsMenuOpen(false)}>Settings</Link>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10" 
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </button>
              </div>
            )}
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

      {isMenuOpen === 'mobile' && (
        <div className="fixed inset-x-0 top-16 z-40 bg-white/95 backdrop-blur-md dark:bg-gray-950/95 border-b border-gray-200 dark:border-gray-800 p-6 shadow-lg lg:hidden">
          <div className="flex flex-col gap-4">
            {siteConfig.navMenuItems.map((item) => (
              <Link
                key={item.href}
                className={pathname === item.href ? "font-semibold text-primary" : "text-gray-800 dark:text-gray-100"}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
