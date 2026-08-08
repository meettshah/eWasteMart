"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@nextui-org/react";
import { BadgeCheck, Building2, Eye, EyeOff, Factory, LockKeyhole, Mail, UserRound } from "lucide-react";

const roles = [
  {
    value: "user",
    title: "Individual seller",
    text: "Sell household e-waste lots.",
    icon: UserRound,
  },
  {
    value: "bulk_seller",
    title: "Bulk seller",
    text: "List office or industry lots.",
    icon: Building2,
  },
  {
    value: "recycler",
    title: "Recycler",
    text: "Bid on open e-waste lots.",
    icon: Factory,
  },
  {
    value: "enterprise",
    title: "Enterprise",
    text: "Run programmes and bid.",
    icon: BadgeCheck,
  },
];

const RegisterForm = () => {
  const { register, handleSubmit, setError, watch, formState: { errors }, reset } = useForm({
    defaultValues: { role: "user" },
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/register", data);

      if (res.status === 201) {
        reset();
        router.push("/login");
      }
    } catch (error) {
      setError("formError", { type: "manual", message: error.response?.data?.message || "Registration failed. Please try again." });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
          Full name
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            id="name"
            autoComplete="name"
            placeholder="Your name or organization"
            className="w-full rounded-md border-gray-200 bg-white py-3 pl-10 pr-3 dark:bg-gray-950"
          />
        </div>
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-800 dark:text-gray-100">
          Choose your role
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <label
              key={role.value}
              className={`cursor-pointer rounded-md border p-4 transition ${
                selectedRole === role.value
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-gray-200 bg-white hover:border-primary/60 dark:border-gray-800 dark:bg-gray-950"
              }`}
            >
              <input
                {...register("role", { required: "Role is required" })}
                type="radio"
                value={role.value}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <role.icon className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-semibold text-gray-950 dark:text-white">{role.title}</div>
                  <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{role.text}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Enter a valid email address" },
            })}
            type="email"
            id="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-md border-gray-200 bg-white py-3 pl-10 pr-3 dark:bg-gray-950"
          />
        </div>
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            placeholder="Create a secure password"
            className="w-full rounded-md border-gray-200 bg-white py-3 pl-10 pr-12 dark:bg-gray-950"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {errors.formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errors.formError.message}
        </div>
      )}

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register("terms", { required: "You must agree to the Terms & Conditions" })}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the <a href="/terms" className="text-primary hover:underline" target="_blank">Terms and Conditions</a> and{" "}
            <a href="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</a>.
          </span>
        </label>
        {errors.terms && <p className="mt-2 text-sm text-red-600">{errors.terms.message}</p>}
      </div>

      <Button isLoading={loading} type="submit" color="primary" className="h-12 w-full font-semibold">
        Create account
      </Button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
        <span className="shrink-0 px-4 text-sm text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white font-semibold text-gray-800 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </button>
    </form>
  );
};

export default RegisterForm;
