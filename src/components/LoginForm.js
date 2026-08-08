"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@nextui-org/react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

const LoginForm = () => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError("formError", { type: "manual", message: "Invalid email or password. Please check and try again." });
        setLoading(false);
        return;
      }

      router.push("/home");
      router.refresh();
    } catch (error) {
      setError("formError", { type: "manual", message: "Login failed. Please try again in a moment." });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            autoComplete="current-password"
            placeholder="Enter your password"
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

      <div className="flex items-center justify-end">
        <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Forgot password?
        </a>
      </div>

      {errors.formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errors.formError.message}
        </div>
      )}

      <Button isLoading={loading} type="submit" color="primary" className="h-12 w-full font-semibold">
        Login
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
        Sign in with Google
      </button>
    </form>
  );
};

export default LoginForm;
