import Link from "next/link";
import { BatteryCharging, Cpu, HardDrive, Recycle } from "lucide-react";

const recyclers = [
  {
    name: "EcoLoop Recovery",
    speciality: "Computers, peripherals and servers",
    location: "Mumbai, Maharashtra",
    policy: "Data-bearing assets require wipe confirmation before pickup.",
    pricePoint: "Competitive bids for laptops, desktops, boards and mixed IT lots.",
    icon: Cpu,
  },
  {
    name: "GreenCell Processors",
    speciality: "Batteries, chargers and mobile devices",
    location: "Bengaluru, Karnataka",
    policy: "Battery lots must be packed separately and declared by chemistry where possible.",
    pricePoint: "Higher quotes for sorted lithium-ion and mobile lots.",
    icon: BatteryCharging,
  },
  {
    name: "UrbanMine Recycling",
    speciality: "Displays, appliances and mixed scrap",
    location: "Delhi NCR",
    policy: "Bulk pickup available for enterprise and institutional lots.",
    pricePoint: "Lot price depends on weight, condition and contamination risk.",
    icon: HardDrive,
  },
  {
    name: "CircularTech Agency",
    speciality: "Refurbishable electronics",
    location: "Pune, Maharashtra",
    policy: "Working and repairable devices are inspected before final acceptance.",
    pricePoint: "Premium bids for repairable laptops, tablets and branded accessories.",
    icon: Recycle,
  },
];

export default function Recyclers() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Certified recycling network</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-950 dark:text-white">Recyclers</h1>
            <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
              Browse recycler capabilities before creating a listing or placing bids in the marketplace.
            </p>
          </div>
          <Link href="/marketplace" className="rounded-md bg-primary px-5 py-3 text-center font-semibold text-white">
            View open lots
          </Link>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {recyclers.map((recycler) => (
            <article key={recycler.name} className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <recycler.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-950 dark:text-white">{recycler.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{recycler.location}</p>
                </div>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-gray-950 dark:text-white">Speciality</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{recycler.speciality}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-950 dark:text-white">Policy</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{recycler.policy}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-950 dark:text-white">Pricing</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{recycler.pricePoint}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
