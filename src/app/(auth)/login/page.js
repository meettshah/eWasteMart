import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Scale, ShieldCheck, Leaf } from "lucide-react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-12">
          
          {/* Left Hero Visual (lg:col-span-6) */}
          <section className="relative hidden min-h-[640px] overflow-hidden lg:block lg:col-span-6">
            <Image
              src="/card_img_02.jpg"
              alt="E-waste certified processing center"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/40" />
            
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to eWasteMart
              </Link>
              
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-4">
                <Leaf className="h-3.5 w-3.5" />
                <span>Verified Circular Network</span>
              </div>

              <h1 className="font-heading text-3xl font-extrabold leading-tight">
                Empowering zero-landfill e-waste disposal across India.
              </h1>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-xs">
                  <Scale className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Transparent Mamdani Fuzzy bid valuation & instant approval.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Role-based access protects sensitive corporate IT manifests.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Form Container (lg:col-span-6) */}
          <section className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:col-span-6 lg:px-12">
            <div className="mx-auto w-full max-w-sm">
              <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                Back to eWasteMart
              </Link>

              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Welcome Back
                </span>
                <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Sign in to portal
                </h2>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Enter your credentials to access your listings, bids and ESG audit logs.
                </p>
              </div>

              <LoginForm />

              <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
                  Register for free
                </Link>
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
