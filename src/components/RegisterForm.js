"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
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

      <Button isLoading={loading} type="submit" color="primary" className="h-12 w-full font-semibold">
        Create account
      </Button>
    </form>
  );
};

export default RegisterForm;
