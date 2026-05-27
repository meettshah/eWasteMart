import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Factory, HandCoins, Recycle } from "lucide-react";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex min-h-[720px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-lg">
              <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary dark:text-gray-300">
                <ArrowLeft className="h-4 w-4" />
                Back to E-WasteMart
              </Link>
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Create account</p>
                <h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">Join the e-waste marketplace</h1>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Pick your role once and E-WasteMart will tailor the platform actions for you.
                </p>
              </div>
              <RegisterForm />
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                Already registered?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Login instead
                </Link>
              </p>
            </div>
          </section>

          <section className="relative hidden min-h-[720px] overflow-hidden lg:block">
            <Image
              src="/card_img_05.jpg"
              alt="Responsible e-waste sorting"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gray-950/55" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <h2 className="max-w-md text-4xl font-bold leading-tight">
                One account, the right workflow for your role.
              </h2>
              <div className="mt-8 grid gap-3">
                <div className="flex items-center gap-3 rounded-md bg-white/10 p-4 backdrop-blur">
                  <HandCoins className="h-5 w-5 text-primary" />
                  <span className="text-sm">Sellers publish lots and approve the final buyer.</span>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white/10 p-4 backdrop-blur">
                  <Recycle className="h-5 w-5 text-primary" />
                  <span className="text-sm">Recyclers bid on lots that match their capability.</span>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white/10 p-4 backdrop-blur">
                  <Factory className="h-5 w-5 text-primary" />
                  <span className="text-sm">Enterprises can run programmes and participate in bidding.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
