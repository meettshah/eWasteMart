import Link from "next/link";
import { BadgeCheck, Leaf, LockKeyhole, Recycle, ShieldCheck, ArrowRight, Award, Factory, Users } from "lucide-react";

const principles = [
  {
    icon: Recycle,
    title: "Circular Economy Priority",
    text: "Every listing on eWasteMart is channeled toward verified reuse, refurbishment, or environmentally compliant smelting.",
  },
  {
    icon: LockKeyhole,
    title: "Cryptographic Data Sanitization",
    text: "NIST 800-88 compliant media wiping verification protects sensitive institutional and consumer data before handover.",
  },
  {
    icon: BadgeCheck,
    title: "Algorithmic Transparency",
    text: "Mamdani Fuzzy Inference Systems rank bids objectively against real metal scrap indices, preventing predatory quotes.",
  },
  {
    icon: Leaf,
    title: "Zero-Landfill Mandate",
    text: "Official CPCB 2022 compliance guarantees that no hazardous lead, cadmium, or mercury enters informal landfills.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Leaf className="h-3.5 w-3.5" />
                <span>Our Mission & Architectural Vision</span>
              </div>
              <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                A Transparent Pipeline for Responsible E-Waste Movement.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                eWasteMart was engineered to bridge the trust gap between electronics owners, bulk corporate asset managers, and certified R2/CPCB recycling centers across India. By fusing real-time Computer Vision, Soft Computing, and Generative AI, we make electronics retirement economically rewarding and ecologically verifiable.
              </p>
              
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/marketplace" className="btn-gradient text-xs">
                  Enter Bidding Floor <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register" className="btn-secondary text-xs">
                  Join the Network
                </Link>
              </div>
            </div>

            {/* Right Card: Platform Governance */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 dark:border-slate-800/80 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    Platform Stakeholders
                  </h2>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <strong className="block text-slate-900 dark:text-white">Sellers & Bulk IT Disposers</strong>
                    <span className="text-slate-500 dark:text-slate-400">Publish lots with photo-grade MobileNet condition analysis and maintain 100% final approval control.</span>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <strong className="block text-slate-900 dark:text-white">Licensed R2 & CPCB Recyclers</strong>
                    <span className="text-slate-500 dark:text-slate-400">Compete on a level bidding desk with Genetic Algorithm distance-weight matching and instant payouts.</span>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <strong className="block text-slate-900 dark:text-white">ESG & EPR Enterprises</strong>
                    <span className="text-slate-500 dark:text-slate-400">Meet corporate sustainability statutory quotas with downloadable cryptographic impact ledgers.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </main>
  );
}
