import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Scale, ShieldCheck } from "lucide-react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden min-h-[680px] overflow-hidden lg:block">
            <Image
              src="/card_img_02.jpg"
              alt="E-waste recycling facility"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gray-950/55" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to E-WasteMart
              </Link>
              <h1 className="max-w-md text-4xl font-bold leading-tight">
                Continue managing e-waste with full marketplace control.
              </h1>
              <div className="mt-8 grid gap-3">
                <div className="flex items-center gap-3 rounded-md bg-white/10 p-4 backdrop-blur">
                  <Scale className="h-5 w-5 text-primary" />
                  <span className="text-sm">Track listings, bids and approvals in one place.</span>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white/10 p-4 backdrop-blur">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Role-based access keeps workflows focused.</span>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white/10 p-4 backdrop-blur">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Approve one buyer and close the lot cleanly.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-[680px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary dark:text-gray-300 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                Back to E-WasteMart
              </Link>
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Welcome back</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">Login to your account</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Access your dashboard, marketplace listings and bidding activity.
                </p>
              </div>
              <LoginForm />
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                New to E-WasteMart?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
