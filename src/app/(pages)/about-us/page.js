import Link from "next/link";
import { BadgeCheck, Leaf, LockKeyhole, Recycle } from "lucide-react";

const principles = [
  {
    icon: Recycle,
    title: "Circular economy first",
    text: "Every listing is designed to move electronics toward reuse, refurbishment or compliant recycling.",
  },
  {
    icon: LockKeyhole,
    title: "Data-aware disposal",
    text: "Sellers can document condition and handling needs before recyclers commit to pickup.",
  },
  {
    icon: BadgeCheck,
    title: "Transparent approvals",
    text: "Bids are visible to the seller, and one approved buyer owns the lot at the accepted price.",
  },
  {
    icon: Leaf,
    title: "Lower landfill impact",
    text: "The marketplace helps organizations divert electronics from informal disposal channels.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">About E-WasteMart</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              A clearer way to move e-waste from sellers to responsible buyers.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              E-WasteMart connects individual sellers, bulk sellers, certified recyclers and enterprises through a transparent bidding workflow. The platform keeps roles simple, actions protected and e-waste movement easy to understand.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/marketplace" className="rounded-md bg-primary px-5 py-3 text-center font-semibold text-white">
                Open marketplace
              </Link>
              <Link href="/register" className="rounded-md border border-gray-300 px-5 py-3 text-center font-semibold dark:border-gray-700">
                Join E-WasteMart
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
            <h2 className="text-xl font-semibold">Who uses the platform?</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-semibold">Users and bulk sellers</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">Create e-waste lots and approve the bid that works best.</dd>
              </div>
              <div>
                <dt className="font-semibold">Recyclers</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">Bid on lots that match their facility capabilities and pickup scope.</dd>
              </div>
              <div>
                <dt className="font-semibold">Enterprises</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">Participate in listings and run brand-oriented recovery programmes.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((item) => (
            <div key={item.title} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <item.icon className="h-7 w-7 text-primary" />
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
