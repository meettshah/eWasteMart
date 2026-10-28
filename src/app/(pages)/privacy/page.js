import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-8 text-slate-900 dark:bg-[#090D14] dark:text-white md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-card backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
            <ShieldCheck className="h-4 w-4" /> DPDP Act 2023 & MoEFCC Compliant
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Privacy Policy & Data Security
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Last updated: October 2026 • Effective for all E-WasteMart transactions and services
          </p>
        </div>

        {/* Content Body */}
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-8 text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-950 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">1. Information We Collect</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              When you interact with E-WasteMart, we collect strictly necessary data to facilitate transparent, authenticated, and environmentally audited recycling transactions:
            </p>
            <ul className="space-y-2 text-sm pl-4 list-disc marker:text-emerald-500">
              <li><strong>Account Credentials:</strong> Name, verified email address, phone contact, and registered organization details.</li>
              <li><strong>E-Waste Manifest Data:</strong> Device types, photos, condition attributes, AI diagnostic scores, and declared hardware weights.</li>
              <li><strong>Logistics & Geolocation:</strong> Pickup coordinates, transit checkpoints, and recipient authorized processing facilities.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-8 dark:border-slate-800/80">
            <div className="flex items-center gap-3 text-slate-950 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">2. How We Secure & Process Data</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Data collected is processed under strict end-to-end encryption. Diagnostic images uploaded for Computer Vision classification are scrubbed of EXIF metadata before analysis. We never store raw debit/credit numbers; all payments use secure bank-grade escrow gateways.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-8 dark:border-slate-800/80">
            <div className="flex items-center gap-3 text-slate-950 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">3. Third-Party Sharing Rules</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              E-WasteMart never sells user data to advertisers or data brokers. Authorized CPCB/SPCB recycling partners receive dispatch manifests solely when a bid is finalized to comply with national hazardous material transport standards.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

