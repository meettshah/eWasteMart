import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // If role is already set, they shouldn't be here
  if (session.user.role !== "pending") {
    redirect("/home");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Almost there!</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Welcome, {session.user.name}! Since you signed in with Google, we just need to know how you plan to use E-WasteMart.
        </p>
      </div>
      
      <div className="mx-auto mt-10 max-w-lg rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-10">
        <OnboardingForm />
      </div>
    </main>
  );
}
