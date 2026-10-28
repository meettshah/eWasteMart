import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Heart, Leaf } from "lucide-react";

const footerNavigation = {
  solutions: [
    { name: "Marketplace Bidding Desk", href: "/marketplace" },
    { name: "Certified Recycler Directory", href: "/recyclers" },
    { name: "Enterprise EPR Partners", href: "/collaborators" },
    { name: "Doorstep OTP Pickups", href: "/pickups" },
  ],
  intelligence: [
    { name: "GenAI Listing Assistant", href: "/marketplace" },
    { name: "Mamdani Fuzzy Bid Rating", href: "/marketplace" },
    { name: "Genetic Recycler Matcher", href: "/marketplace" },
    { name: "MobileNet Device Scanner", href: "/marketplace" },
    { name: "ESG Impact Certificate", href: "/marketplace" },
  ],
  company: [
    { name: "About E-WasteMart", href: "/about-us" },
    { name: "Environmental Guidelines", href: "/about-us" },
    { name: "Create Free Account", href: "/register" },
    { name: "Portal Sign In", href: "/login" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "CPCB 2022 Compliance", href: "/about-us" },
    { name: "Data Security Assurance", href: "/about-us" },
  ],
};

export default function Footer1() {
  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#060a10]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" width={36} height={36} alt="eWasteMart Logo" className="h-9 w-9 object-contain" priority />
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  eWaste<span className="text-emerald-600 dark:text-emerald-400">Mart</span>
                </span>
                <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">
                  Circular Economy Exchange
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              India&apos;s role-based marketplace uniting households, bulk disposers, certified recyclers and ESG enterprises for compliant, zero-landfill electronic asset liquidation.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational & Certified</span>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Solutions
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerNavigation.solutions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence Suite Column */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              AI & Research
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerNavigation.intelligence.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Compliance
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800/80 sm:flex-row">
          <p>© {new Date().getFullYear()} eWasteMart Circular Solutions Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built for responsible zero-landfill electronics lifecycle</span>
            <Leaf className="h-3.5 w-3.5 text-emerald-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
