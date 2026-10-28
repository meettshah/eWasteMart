import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Factory, HandCoins, Recycle, Leaf, ShieldCheck, BadgeCheck } from "lucide-react";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-12">
          
          {/* Left Form Column (lg:col-span-7) */}
          <section className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:col-span-7 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400">
                <ArrowLeft className="h-4 w-4" />
                Back to eWasteMart
              </Link>

              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Join the Network
                </span>
                <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Create your account
                </h1>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Select your role to access role-specific workflows, compliant manifests, and verified bidding.
                </p>
              </div>

              <RegisterForm />

              <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Already registered?{" "}
                <Link href="/login" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
                  Sign in instead
                </Link>
              </p>
            </div>
          </section>

          {/* Right Visual Column (lg:col-span-5) */}
          <section className="relative hidden min-h-[720px] overflow-hidden lg:block lg:col-span-5">
            <Image
              src="/card_img_05.jpg"
              alt="Certified e-waste collection sorting"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/40" />

            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-4">
                <Leaf className="h-3.5 w-3.5" />
                <span>Zero Landfill Mission</span>
              </div>

              <h2 className="font-heading text-3xl font-extrabold leading-tight">
                Role-tailored operations for maximum efficiency.
              </h2>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-xs">
                  <HandCoins className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Sellers list verified lots and retain 100% final approval control.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-xs">
                  <Recycle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Recyclers gain priority matching via Multi-Objective Genetic Algorithms.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-xs">
                  <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Enterprises generate downloadable ESG compliance certificates.</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
