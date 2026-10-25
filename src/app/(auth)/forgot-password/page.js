import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div>
          <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary dark:text-gray-400">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
