"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@nextui-org/react";
import { LockKeyhole, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (data) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: data.password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to reset password");
      
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
        <h3 className="mb-2 font-semibold text-green-800 dark:text-green-400">Password reset</h3>
        <p className="mb-6 text-sm text-green-700 dark:text-green-500">
          Your password has been successfully reset.
        </p>
        <Link href="/login" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 font-semibold text-white transition hover:bg-primary/90">
          Continue to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
          New Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            className="w-full rounded-md border-gray-200 bg-white py-3 pl-10 pr-12 dark:bg-gray-950"
          />
          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
          Confirm Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            {...register("confirmPassword", { required: "Please confirm your password" })}
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            className="w-full rounded-md border-gray-200 bg-white py-3 pl-10 pr-12 dark:bg-gray-950"
          />
        </div>
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
