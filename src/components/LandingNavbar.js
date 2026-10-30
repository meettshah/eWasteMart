"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { Menu, X, ArrowRight } from "lucide-react";

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#090D14]/85 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
        
        {/* Logo & Brand */}
        <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 md:flex">
          <Link
            href="#how-it-works"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
          >
            How it works
          </Link>
          <Link
            href="/marketplace"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
          >
            Marketplace
          </Link>
        </nav>

        {/* Actions & Theme */}
        <div className="flex items-center gap-3">
          <ThemeSwitch />

          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-600/30 transition-all hover:bg-emerald-500 active:scale-95"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#090D14]/95 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              How it works
            </Link>
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Marketplace
            </Link>

            <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl border border-slate-300 py-2.5 text-center text-sm font-semibold dark:border-slate-700"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
