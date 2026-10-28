import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OnboardingForm from "@/components/OnboardingForm";
import { Sparkles } from "lucide-react";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // If role is already set, redirect to dashboard
  if (session.user.role !== "pending") {
    redirect("/home");
  }

  return (
    <main className="relative min-h-screen bg-slate-50/60 px-4 py-12 text-slate-900 dark:bg-[#090D14] dark:text-white sm:px-6 lg:px-8">
      {/* Decorative Glows */}
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/10" />

      <div className="relative mx-auto max-w-xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Google Authentication Verified
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Choose Your Ecosystem Role
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Welcome, <strong>{session.user.name}</strong>! Tailor your experience to unlock specialized AI valuations, bidding consoles, or compliance tools.
          </p>
        </div>
        
        <div className="glass-card mt-8 rounded-3xl p-6 sm:p-8 shadow-card">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}

