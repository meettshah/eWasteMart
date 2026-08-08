"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@nextui-org/react";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to send reset email");
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900/50 dark:bg-green-900/20">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
        <h3 className="mb-2 font-semibold text-green-800 dark:text-green-400">Check your email</h3>
        <p className="text-sm text-green-700 dark:text-green-500">
          We've sent password reset instructions to your email address.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            placeholder="you@company.com"
            className="w-full rounded-md border-gray-200 bg-white py-3 pl-10 pr-3 dark:bg-gray-950"
          />
        </div>
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <Button isLoading={loading} type="submit" color="primary" className="h-12 w-full font-semibold">
        Reset Password
      </Button>
    </form>
  );
}
