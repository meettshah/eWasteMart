import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Factory, Recycle, Scale, ShieldCheck, UserRound } from "lucide-react";
import Footer1 from "@/components/Footer1";
import LandingNavbar from "@/components/LandingNavbar";

const roles = [
  {
    icon: UserRound,
    title: "Individual sellers",
    text: "List old phones, laptops, batteries and appliances with a clear expected price.",
  },
  {
    icon: Building2,
    title: "Bulk sellers",
    text: "Move office, school or industry e-waste in lots that certified buyers can quote on.",
  },
  {
    icon: Factory,
    title: "Recyclers",
    text: "Bid on lots, share pickup notes, and win approved lots from verified sellers.",
  },
  {
    icon: BadgeCheck,
    title: "Enterprises",
    text: "Run brand-led recycling programmes while also bidding for recovery and refurbishing.",
  },
];

const steps = [
  "A seller publishes an e-waste lot with quantity, condition, location and expected price.",
  "Recyclers and enterprises place transparent bids with pickup or compliance notes.",
  "The seller approves one bid and the platform marks the lot as sold to that buyer.",
];

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <main className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
        <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Responsible e-waste marketplace</p>
              <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight sm:text-6xl">
                Sell, bid and approve e-waste lots with confidence.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                E-WasteMart connects households, bulk sellers, recyclers and enterprise recycling programmes in one role-based platform.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-white">
                  Start now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                  Login to marketplace
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-gray-500">Platform roles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-gray-500">Bid approval control</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Open</div>
                  <div className="text-gray-500">Marketplace model</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/card_img_03.jpg"
                alt="Sorted electronic waste ready for recycling"
                width={760}
                height={620}
                priority
                className="h-[520px] w-full rounded-lg object-cover shadow-xl"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-lg bg-white/95 p-5 shadow-lg backdrop-blur dark:bg-gray-900/95">
                <div className="flex items-start gap-3">
                  <Scale className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h2 className="font-semibold">Live bidding workflow</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Buyers compete on price, sellers approve the right offer, and every lot moves with a clear owner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold">How E-WasteMart Works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">{index + 1}</div>
                  <p className="text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="bg-gray-50 px-6 py-16 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold">Built For Every Stakeholder</h2>
                <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">
                  The same platform adapts access and actions based on the account role.
                </p>
              </div>
              <Link href="/register" className="font-semibold text-primary">Choose your role</Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {roles.map((role) => (
                <div key={role.title} className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-950">
                  <role.icon className="h-7 w-7 text-primary" />
                  <h3 className="mt-5 font-semibold">{role.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{role.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            <div className="flex gap-4">
              <Recycle className="h-7 w-7 text-primary" />
              <div>
                <h3 className="font-semibold">Circular recovery</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Move usable components and scrap into responsible recycling channels.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
              <div>
                <h3 className="font-semibold">Clear permissions</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Role checks protect listing, bidding and bid approval actions.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <BadgeCheck className="h-7 w-7 text-primary" />
              <div>
                <h3 className="font-semibold">Enterprise ready</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Brands can participate in take-back programmes and approved purchases.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer1 />
    </>
  );
}
