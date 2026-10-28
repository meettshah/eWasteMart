import Link from "next/link";
import { BatteryCharging, Cpu, HardDrive, Recycle, ShieldCheck, MapPin, ArrowRight, Award, CheckCircle2 } from "lucide-react";

const recyclers = [
  {
    name: "EcoLoop Recovery",
    speciality: "Computers, Peripherals & Datacenter Servers",
    location: "Mumbai, Maharashtra",
    distance: "4.2 km",
    policy: "Data-bearing assets require certified NIST 800-88 cryptographic wipe confirmation before pickup.",
    pricePoint: "Competitive bids for laptops, desktops, motherboards and mixed IT asset lots.",
    cpcbCert: "CPCB/EW/MH/2023/118",
    rating: "4.9 ★ (120+ lots processed)",
    icon: Cpu,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    name: "GreenCell Processors",
    speciality: "Lithium-Ion Batteries, Power Banks & Mobile Handsets",
    location: "Bengaluru, Karnataka",
    distance: "12.8 km",
    policy: "Battery lots must be packed in non-conductive containers and declared by chemical composition.",
    pricePoint: "Premium bids for sorted high-nickel and cobalt-rich battery lots.",
    cpcbCert: "CPCB/EW/KA/2022/094",
    rating: "4.8 ★ (95+ lots processed)",
    icon: BatteryCharging,
    color: "from-blue-500/10 to-sky-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    name: "UrbanMine Recycling",
    speciality: "Displays, Industrial Equipment & Mixed Scrap Lots",
    location: "Delhi NCR",
    distance: "8.5 km",
    policy: "Fleet dispatch available for enterprise lots > 500kg. Zero-landfill documentation provided.",
    pricePoint: "Pricing calculated using dynamic metal scrap commodities index (Copper, Lead, Aluminum).",
    cpcbCert: "CPCB/EW/DL/2021/045",
    rating: "4.7 ★ (210+ lots processed)",
    icon: HardDrive,
    color: "from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    name: "CircularTech Agency",
    speciality: "Refurbishable Devices & Reconditioned Electronics",
    location: "Pune, Maharashtra",
    distance: "15.0 km",
    policy: "Diagnostic grading for functional and repairable laptops, tablets and branded accessories.",
    pricePoint: "Top-market valuations for devices with salvageable motherboards and displays.",
    cpcbCert: "CPCB/EW/MH/2024/021",
    rating: "5.0 ★ (80+ lots processed)",
    icon: Recycle,
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

export default function Recyclers() {
  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>R2 / CPCB Authorized Network</span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Certified Recycler Directory
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Browse licensed e-waste processors, inspection policies, and processing specialities. Recyclers compete on the bidding desk and are ranked by our Genetic Algorithm.
              </p>
            </div>
            
            <Link
              href="/marketplace"
              className="btn-gradient shrink-0 text-xs"
            >
              View Open Bidding Lots <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Recyclers Grid */}
        <section className="grid gap-6 md:grid-cols-2">
          {recyclers.map((recycler) => {
            const Icon = recycler.icon;
            return (
              <article
                key={recycler.name}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border p-3 ${recycler.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                            {recycler.name}
                          </h2>
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {recycler.location}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {recycler.distance} radius
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {recycler.rating}
                    </span>
                  </div>

                  <dl className="mt-6 space-y-3.5 text-xs">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
                      <dt className="font-bold text-slate-900 dark:text-white">
                        Speciality Focus
                      </dt>
                      <dd className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                        {recycler.speciality}
                      </dd>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
                      <dt className="font-bold text-slate-900 dark:text-white">
                        Compliance & Data Wipe Policy
                      </dt>
                      <dd className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                        {recycler.policy}
                      </dd>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
                      <dt className="font-bold text-slate-900 dark:text-white">
                        Pricing Model
                      </dt>
                      <dd className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                        {recycler.pricePoint}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
                  <span className="font-medium text-slate-500">
                    Reg: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-slate-800">{recycler.cpcbCert}</code>
                  </span>
                  <Link
                    href="/marketplace"
                    className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    Match with this Recycler →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

      </div>
    </main>
  );
}
