import { Scale, CheckCircle2, AlertCircle, FileCheck2 } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-8 text-slate-900 dark:bg-[#090D14] dark:text-white md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-card backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
            <Scale className="h-4 w-4" /> Legal & Compliance Framework
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Terms of Service & EPR Mandates
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Last updated: October 2026 • Governing all auction participation, courier dispatches, and material transfers
          </p>
        </div>

        {/* Content Body */}
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-8 text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-950 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">1. Platform Scope & Purpose</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              E-WasteMart operates as an AI-augmented circular economy clearinghouse connecting individual and commercial electronics sellers with verified, State and Central Pollution Control Board (CPCB/SPCB) licensed recyclers.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-8 dark:border-slate-800/80">
            <div className="flex items-center gap-3 text-slate-950 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">2. Participant Obligations</h2>
            </div>
            <ul className="space-y-3 text-sm pl-4 list-disc marker:text-emerald-500">
              <li>
                <strong>Sellers (Individual & Bulk):</strong> Must declare truthful descriptions of device hardware condition, battery integrity, and hazardous leaks. All data storage units must be zero-wiped prior to courier transfer.
              </li>
              <li>
                <strong>Authorized Recyclers:</strong> Must maintain active EPR authorization under the E-Waste (Management) Rules 2022 and process accepted hardware strictly within licensed dismantling and refining facilities.
              </li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-8 dark:border-slate-800/80">
            <div className="flex items-center gap-3 text-slate-950 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">3. Escrow Settlement & Logistics</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Accepted bids enter an automated verification escrow. Funds are disbursed to the seller upon biometric or QR-verified courier pickup, ensuring transparent reconciliation and dispute mitigation for both parties.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

