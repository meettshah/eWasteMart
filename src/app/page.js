import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  BadgeCheck, 
  Building2, 
  Factory, 
  Recycle, 
  Scale, 
  ShieldCheck, 
  UserRound, 
  Sparkles, 
  Cpu, 
  Eye, 
  Brain, 
  Leaf, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  ChevronRight,
  Shield
} from "lucide-react";
import Footer1 from "@/components/Footer1";
import LandingNavbar from "@/components/LandingNavbar";

const academicPillars = [
  {
    icon: Sparkles,
    subject: "Generative AI",
    title: "Few-Shot Listings & Diffusion Photo Synthesizer",
    description: "Few-shot structured prompt engineering converts raw device specs into optimal marketplace listings, while diffusion models generate photorealistic e-waste photos.",
    tags: ["Few-Shot Prompting", "JSON Schema Enforcement", "Multi-turn Memory"],
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Brain,
    subject: "Soft Computing",
    title: "Mamdani Fuzzy Inference & Genetic Algorithms",
    description: "Evaluates bid fairness using a 2-input Mamdani Fuzzy Logic System with centroid defuzzification, and matches optimal recyclers via multi-objective Genetic Algorithm (GA) optimization.",
    tags: ["Mamdani FIS", "Centroid Defuzzification", "Multi-Objective GA"],
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Eye,
    subject: "Computer Vision",
    title: "In-Browser MobileNet CNN & Damage Analysis",
    description: "Client-side transfer learning with MobileNet v2 classifies e-waste hardware instantly, coupled with Laplacian convolution for blur rejection and Sobel/HSV edge filters for rust detection.",
    tags: ["MobileNet v2 CNN", "Laplacian Blur Kernel", "Sobel Rust Detection"],
    color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
];

const roles = [
  {
    icon: UserRound,
    role: "Individual Sellers",
    title: "Household & Personal Gadgets",
    text: "List old smartphones, laptops, cables and appliances. Receive fair AI valuations and secure doorstep OTP pickups.",
    benefit: "Fair value guarantee & zero paperwork",
  },
  {
    icon: Building2,
    role: "Bulk Sellers",
    title: "Offices, Schools & Warehouses",
    text: "Liquidate decommissioned IT assets in pallet lots with automated manifest generation and competitive recycler bidding.",
    benefit: "Batch lot bidding & asset retirement tracking",
  },
  {
    icon: Factory,
    role: "Certified Recyclers",
    title: "Authorized R2 & CPCB Processors",
    text: "Access verified bulk streams, place bids with transparent compliance notes, and schedule compliant logistics.",
    benefit: "Direct supply pipeline & genetic match priority",
  },
  {
    icon: BadgeCheck,
    role: "Enterprises",
    title: "ESG Programs & Brand Take-Back",
    text: "Orchestrate nation-wide extended producer responsibility (EPR) programs with downloadable carbon audit certificates.",
    benefit: "Verifiable ESG impact & CSR reporting",
  },
];

const stats = [
  { value: "100%", label: "CPCB 2022 Compliant", desc: "Meets official Indian e-waste disposal mandates" },
  { value: "4 Distinct", label: "Enterprise Roles", desc: "Sellers, Bulk Disposers, Recyclers, EPR Brands" },
  { value: "9 Algorithms", label: "Academic AI Suite", desc: "GenAI, Fuzzy Logic, GA & Deep Neural Vision" },
  { value: "< 24 Hrs", label: "Average Bid Turnaround", desc: "From lot publication to certified buyer approval" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D14]">
      <LandingNavbar />

      <main>
        {/* ─── Hero Section ────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#090D14] bg-radial-glow">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-24">
            
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Leaf className="h-3.5 w-3.5" />
                <span>India&apos;s 1st AI-Assisted Circular E-Waste Exchange</span>
              </div>

              <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Sell, Bid & Recycle E-Waste with <span className="text-gradient">Certified Trust</span>.
              </h1>

              <p className="mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-relaxed">
                eWasteMart unites households, bulk corporate disposers, certified recyclers, and EPR brands on a role-based exchange powered by Computer Vision, Soft Computing, and Generative AI.
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="btn-gradient text-sm"
                >
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/marketplace"
                  className="btn-secondary text-sm"
                >
                  Explore Marketplace
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>CPCB Rules 2022 Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  <span>100% Escrow Bidding</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Award className="h-4 w-4 text-emerald-500" />
                  <span>Doorstep OTP Verification</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="relative lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
                
                {/* Visual Image */}
                <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-72">
                  <Image
                    src="/card_img_03.jpg"
                    alt="Organized e-waste ready for circular processing"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Floating Status Pill */}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Live Bidding Active</span>
                  </div>

                  {/* Overlaid simulated transaction */}
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-slate-900/90 p-3 text-white backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">Dell PowerEdge Lot (50 units)</span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300">High Demand</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Highest Bid: <strong className="text-white">₹1,85,000</strong></span>
                      <span>Mamdani Fairness: <strong className="text-emerald-400">0.88 (Great)</strong></span>
                    </div>
                  </div>
                </div>

                {/* Simulated Intelligence Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                      <span>Vision Scanner</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">MobileNet: 94.2% laptop confidence</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Brain className="h-3.5 w-3.5 text-emerald-500" />
                      <span>GA Matching</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Matched EcoLoop (4.2 km away)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Metric Strip ────────────────────────────────────────── */}
        <section className="border-b border-slate-200/80 bg-slate-100/50 py-10 dark:border-slate-800/80 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-heading text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                    {s.value}
                  </span>
                  <span className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {s.label}
                  </span>
                  <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Academic Intelligence Showcase ─────────────────────── */}
        <section id="ai-features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Cpu className="h-3.5 w-3.5" />
                <span>Multi-Disciplinary Academic Suite</span>
              </div>
              <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Advanced AI, Soft Computing & Vision Integration
              </h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
                Engineered specifically for curriculum defense in Generative AI, Soft Computing, and Computer Vision with zero external dependencies and guaranteed offline execution.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {academicPillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={i}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900/80"
                  >
                    <div>
                      <div className={`inline-flex rounded-2xl border p-3.5 ${pillar.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-400">
                        {pillar.subject}
                      </span>
                      <h3 className="mt-2 font-heading text-xl font-bold text-slate-900 dark:text-white">
                        {pillar.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div className="flex flex-wrap gap-1.5">
                        {pillar.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── How It Works (Timeline) ────────────────────────────── */}
        <section id="how-it-works" className="border-t border-slate-200/80 bg-slate-100/50 py-20 px-4 sm:px-6 dark:border-slate-800/80 dark:bg-[#0c121d]">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Transparent Workflow
              </span>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                How eWasteMart Works in 4 Steps
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Inspect & List Lot",
                  desc: "Capture photos with the in-browser Device Scanner or type specs. GenAI crafts a professional title, condition notes, and scrap index pricing.",
                },
                {
                  step: "02",
                  title: "Competitive Bidding",
                  desc: "Authorized recyclers place transparent bids. The Mamdani Fuzzy Evaluator ranks offers as Fair, Good, or Great based on current scrap indices.",
                },
                {
                  step: "03",
                  title: "Select & Match",
                  desc: "The seller selects the winning bid or uses the Genetic Algorithm Matcher to find the closest recycler with the best recycling credentials.",
                },
                {
                  step: "04",
                  title: "Doorstep OTP & ESG",
                  desc: "Courier schedules pickup with 6-digit OTP verification. Once collected, escrow funds are automatically released to the seller.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="font-heading text-4xl font-extrabold text-emerald-500/20 dark:text-emerald-400/20">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Role-Based Capabilities ────────────────────────────── */}
        <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Tailored Permissions
              </span>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                4 Specialized Ecosystem Roles
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Each participant operates within verified boundaries to ensure safety, legal traceability, and economic fairness.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {roles.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-400">
                        {r.role}
                      </span>
                      <h3 className="mt-1 font-heading text-lg font-bold text-slate-900 dark:text-white">
                        {r.title}
                      </h3>
                      <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {r.text}
                      </p>
                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
                      ✓ {r.benefit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ─────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-8 text-white shadow-2xl sm:p-12">
              <div className="relative z-10 max-w-2xl">
                <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Ready to transform your e-waste into verified circular value?
                </h2>
                <p className="mt-4 text-sm text-emerald-100 sm:text-base">
                  Join certified recyclers, enterprises, and sellers moving tons of decommissioned electronics every month with complete peace of mind.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-md hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Browse Bidding Desk
                  </Link>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      <Footer1 />
    </div>
  );
}
